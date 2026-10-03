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

type ProgressRequest struct {
	ChallengeID int `json:"challengeId"`
}

// Handler untuk POST /api/challenge/progress
func ChallengeProgress(w http.ResponseWriter, r *http.Request) {
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
	var req ProgressRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	database.InitPool()
	ctx := context.Background()

	// Insert challenge progress
	res, err := database.Pool.Exec(ctx, `
		INSERT INTO challenge_progress (user_id, challenge_id, completed) 
		VALUES ($1, $2, true) 
		ON CONFLICT DO NOTHING
	`, userID, req.ChallengeID)
	
	if err != nil {
		http.Error(w, "Failed to save progress", 500)
		return
	}

	if res.RowsAffected() > 0 {
		// Update points & xp only if challenge wasn't completed before
		_, err = database.Pool.Exec(ctx, `
			UPDATE user_progress 
			SET points = points + 25, xp = xp + 100
			WHERE user_id = $1
		`, userID)
		
		if err != nil {
			http.Error(w, "Failed to update points", 500)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"status": "success"})
}
