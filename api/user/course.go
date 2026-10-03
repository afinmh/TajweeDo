package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"tajweedo-backend/database"
)

type CourseRequest struct {
	CourseId int `json:"courseId"`
}

func UserCourse(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

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

	var userId string
	if tokenString != "" {
		secret := os.Getenv("JWT_SECRET")
		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			return []byte(secret), nil
		})
		if err == nil && token.Valid {
			if claims, ok := token.Claims.(jwt.MapClaims); ok {
				userId = claims["userId"].(string)
			}
		}
	}

	if userId == "" {
		http.Error(w, "Unauthorized", 401)
		return
	}

	var req CourseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Bad Request", 400)
		return
	}

	database.InitPool()
	ctx := context.Background()

	// Get username and profile image from users
	var username, profileImage string
	database.Pool.QueryRow(ctx, "SELECT username, profile_image_src FROM users WHERE id = $1", userId).Scan(&username, &profileImage)

	// Upsert user_progress
	_, err := database.Pool.Exec(ctx, `
		INSERT INTO user_progress (user_id, user_name, user_image_src, active_course_id, hearts, points, xp)
		VALUES ($1, $2, $3, $4, 5, 0, 0)
		ON CONFLICT (user_id) DO UPDATE SET active_course_id = EXCLUDED.active_course_id
	`, userId, username, profileImage, req.CourseId)

	if err != nil {
		http.Error(w, "Server Error", 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"ok": true})
}
