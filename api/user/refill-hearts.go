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

const POINTS_TO_REFILL = 10

func RefillHearts(w http.ResponseWriter, r *http.Request) {
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
	var hearts, points int
	err = database.Pool.QueryRow(ctx, "SELECT hearts, points FROM user_progress WHERE user_id = $1", userID).Scan(&hearts, &points)
	if err != nil {
		http.Error(w, "User progress not found", http.StatusNotFound)
		return
	}

	if hearts >= 5 {
		http.Error(w, "Hearts already full", http.StatusBadRequest)
		return
	}

	if points < POINTS_TO_REFILL {
		http.Error(w, "Not enough points", http.StatusBadRequest)
		return
	}

	_, err = database.Pool.Exec(ctx, "UPDATE user_progress SET hearts = 5, points = points - $1 WHERE user_id = $2", POINTS_TO_REFILL, userID)
	if err != nil {
		http.Error(w, "Failed to refill hearts", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"status": "success", "hearts": 5, "points": points - POINTS_TO_REFILL})
}
