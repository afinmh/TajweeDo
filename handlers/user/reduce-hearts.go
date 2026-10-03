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

type ReduceHeartsRequest struct {
	LessonID int `json:"lessonId,omitempty"`
}

func ReduceHearts(w http.ResponseWriter, r *http.Request) {
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
	userID := claims["userId"].(string)

	database.InitPool()
	ctx := context.Background()

	// Load user progress
	var hearts int
	err = database.Pool.QueryRow(ctx, "SELECT hearts FROM user_progress WHERE user_id = $1", userID).Scan(&hearts)
	if err != nil {
		http.Error(w, "User progress not found", http.StatusNotFound)
		return
	}

	if hearts == 0 {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"error": "hearts"})
		return
	}

	// Reduce hearts
	newHearts := hearts - 1
	if newHearts < 0 {
		newHearts = 0
	}

	_, err = database.Pool.Exec(ctx, "UPDATE user_progress SET hearts = $1 WHERE user_id = $2", newHearts, userID)
	if err != nil {
		http.Error(w, "Failed to update hearts", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"hearts": newHearts})
}
