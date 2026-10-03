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
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func Login(w http.ResponseWriter, r *http.Request) {
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

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "invalid_input"}`, http.StatusBadRequest)
		return
	}

	req.Username = strings.ToLower(strings.TrimSpace(req.Username))
	if !strings.Contains(req.Username, "@") {
		if len(req.Username) > 10 {
			req.Username = req.Username[:10]
		}
	}

	database.InitPool()

	var id, hash string
	err := database.Pool.QueryRow(context.Background(), "SELECT id, password_hash FROM users WHERE username = $1 OR email = $1", req.Username).Scan(&id, &hash)
	if err != nil {
		http.Error(w, `{"error": "invalid_credentials"}`, http.StatusUnauthorized)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)); err != nil {
		http.Error(w, `{"error": "invalid_credentials"}`, http.StatusUnauthorized)
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId": id,
		"exp":    time.Now().Add(time.Hour * 24 * 7).Unix(),
	})

	secret := os.Getenv("JWT_SECRET")
	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		http.Error(w, `{"error": "server_error"}`, http.StatusInternalServerError)
		return
	}

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
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"ok": true, "userId": id})
}
