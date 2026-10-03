package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"time"

	"tajweedo-backend/database"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type RegisterRequest struct {
	Username string  `json:"username"`
	Password string  `json:"password"`
	Email    *string `json:"email,omitempty"`
}

func Register(w http.ResponseWriter, r *http.Request) {
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

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "invalid_input"}`, http.StatusBadRequest)
		return
	}

	req.Username = strings.ToLower(strings.TrimSpace(req.Username))
	if len(req.Username) > 10 {
		req.Username = req.Username[:10]
	}

	if req.Username == "" || len(req.Password) < 6 {
		http.Error(w, `{"error": "invalid_input"}`, http.StatusBadRequest)
		return
	}

	database.InitPool()

	var existingId string
	err := database.Pool.QueryRow(context.Background(), "SELECT id FROM users WHERE username = $1", req.Username).Scan(&existingId)
	if err == nil {
		http.Error(w, `{"error": "username_taken"}`, http.StatusConflict)
		return
	}

	hash, _ := bcrypt.GenerateFromPassword([]byte(req.Password), 10)
	id := uuid.New().String()

	_, err = database.Pool.Exec(context.Background(), "INSERT INTO users (id, username, password_hash, role, profile_image_src, email) VALUES ($1, $2, $3, $4, $5, $6)", id, req.Username, string(hash), "user", "/standar.png", req.Email)
	if err != nil {
		http.Error(w, `{"error": "server_error"}`, http.StatusInternalServerError)
		return
	}

	// Auto grant
	rows, err := database.Pool.Query(context.Background(), "SELECT id FROM store_items WHERE item_type = 'profile' AND active = true")
	if err == nil {
		defer rows.Close()
		var itemIds []int
		for rows.Next() {
			var i int
			if rows.Scan(&i) == nil {
				itemIds = append(itemIds, i)
			}
		}
		for _, itId := range itemIds {
			database.Pool.Exec(context.Background(), "INSERT INTO user_purchases (user_id, item_id) VALUES ($1, $2)", id, itId)
		}
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId": id,
		"exp":    time.Now().Add(time.Hour * 24 * 7).Unix(),
	})

	secret := os.Getenv("JWT_SECRET")
	tokenString, _ := token.SignedString([]byte(secret))

	cookie := &http.Cookie{
		Name:     "token",
		Value:    tokenString,
		Path:     "/",
		HttpOnly: true,
		MaxAge:   7 * 24 * 3600,
		SameSite: http.SameSiteLaxMode,
	}
	if os.Getenv("NODE_ENV") == "production" {
		cookie.Secure = true
	}
	http.SetCookie(w, cookie)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"ok": true, "userId": id})
}
