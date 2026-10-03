package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"tajweedo-backend/database"
)

func Account(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, PATCH, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// 1. Validasi Token
	var tokenString string
	for _, cookie := range r.Cookies() {
		if cookie.Name == "token" {
			tokenString = cookie.Value
			break
		}
	}
	if tokenString == "" {
		authHeader := r.Header.Get("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
		}
	}
	if tokenString == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	secret := os.Getenv("JWT_SECRET")
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		http.Error(w, "Invalid Token", http.StatusUnauthorized)
		return
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		http.Error(w, "Invalid Token", http.StatusUnauthorized)
		return
	}
	userId := claims["userId"].(string)

	database.InitPool()
	ctx := context.Background()

	if r.Method == http.MethodGet {
		// Get user info
		var username, imageSrc string
		var email *string
		err := database.Pool.QueryRow(ctx, "SELECT user_name, user_image_src, (SELECT email FROM users WHERE id = $1) FROM user_progress WHERE user_id = $1", userId).Scan(&username, &imageSrc, &email)
		if err != nil {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}

		// Get owned avatars (store_items joined with user_purchases where item_type = 'profile' OR item_type = 'shop')
		// Wait, user_progress has image_src. Any item purchased that has an image_src could be used.
		// For simplicity, fetch all store items the user purchased.
		query := `
			SELECT si.id, si.name, si.image_src
			FROM store_items si
			JOIN user_purchases ui ON si.id = ui.item_id
			WHERE ui.user_id = $1
		`
		rows, err := database.Pool.Query(ctx, query, userId)
		if err != nil {
			http.Error(w, "DB error", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		ownedAvatars := []map[string]interface{}{}
		for rows.Next() {
			var id int
			var name, img string
			if err := rows.Scan(&id, &name, &img); err == nil {
				ownedAvatars = append(ownedAvatars, map[string]interface{}{
					"id":        id,
					"name":      name,
					"image_src": img,
				})
			}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"user": map[string]interface{}{
				"username":          username,
				"profile_image_src": imageSrc,
				"email":             email,
			},
			"ownedAvatars": ownedAvatars,
		})
		return
	}

	if r.Method == http.MethodPatch {
		var req struct {
			Username string  `json:"username"`
			Password string  `json:"password"`
			ImageSrc string  `json:"imageSrc"`
			Email    *string `json:"email"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		// Update user progress
		if req.Username != "" {
			req.Username = strings.ToLower(strings.TrimSpace(req.Username))
			if len(req.Username) > 10 {
				req.Username = req.Username[:10]
			}
			// Check if username taken
			var exists bool
			database.Pool.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM user_progress WHERE user_name = $1 AND user_id != $2)", req.Username, userId).Scan(&exists)
			if exists {
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"error": "username_taken"})
				return
			}
			database.Pool.Exec(ctx, "UPDATE user_progress SET user_name = $1 WHERE user_id = $2", req.Username, userId)
			database.Pool.Exec(ctx, "UPDATE users SET username = $1 WHERE id = $2", req.Username, userId)
		}

		if req.Email != nil {
			var em string
			if *req.Email != "" {
				em = strings.TrimSpace(*req.Email)
			}
			database.Pool.Exec(ctx, "UPDATE users SET email = $1 WHERE id = $2", em, userId)
		}

		if req.ImageSrc != "" {
			database.Pool.Exec(ctx, "UPDATE user_progress SET user_image_src = $1 WHERE user_id = $2", req.ImageSrc, userId)
			database.Pool.Exec(ctx, "UPDATE users SET profile_image_src = $1 WHERE id = $2", req.ImageSrc, userId)
		}

		if req.Password != "" {
			hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
			if err == nil {
				database.Pool.Exec(ctx, "UPDATE users SET password = $1 WHERE id = $2", string(hashed), userId)
			}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "success"})
		return
	}

	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
}
