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

type BuyRequest struct {
	ItemID int `json:"item_id"`
}

// Buy menangani endpoint POST /api/shop/buy
func Buy(w http.ResponseWriter, r *http.Request) {
	// CORS Headers
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
	userID := claims["userId"].(string)

	// 2. Parse Body
	var req BuyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// 3. Init DB & Transaksi
	database.InitPool()
	if database.Pool == nil {
		http.Error(w, "Database not configured", http.StatusInternalServerError)
		return
	}

	ctx := context.Background()
	tx, err := database.Pool.Begin(ctx)
	if err != nil {
		http.Error(w, "DB Error", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(ctx)

	var price int
	err = tx.QueryRow(ctx, "SELECT price_points FROM store_items WHERE id = $1", req.ItemID).Scan(&price)
	if err != nil {
		http.Error(w, "Item not found", http.StatusNotFound)
		return
	}

	var currentPoints int
	err = tx.QueryRow(ctx, "SELECT points FROM user_progress WHERE user_id = $1 FOR UPDATE", userID).Scan(&currentPoints)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	if currentPoints < price {
		http.Error(w, "Not enough points", http.StatusPaymentRequired)
		return
	}

	// Kurangi koin
	_, err = tx.Exec(ctx, "UPDATE user_progress SET points = points - $1 WHERE user_id = $2", price, userID)
	if err != nil {
		http.Error(w, "Update failed", http.StatusInternalServerError)
		return
	}

	// Tambah ke inventory (user_purchases)
	_, err = tx.Exec(ctx, "INSERT INTO user_purchases (user_id, item_id) VALUES ($1, $2)", userID, req.ItemID)
	if err != nil {
		http.Error(w, "Purchase update failed (already owned?)", http.StatusConflict)
		return
	}

	// Catat transaksi (best-effort, tabel mungkin belum ada)
	tx.Exec(ctx, "INSERT INTO transactions (user_id, item_id, price) VALUES ($1, $2, $3)", userID, req.ItemID, price)

	tx.Commit(ctx)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"item_id": req.ItemID,
		"balance": currentPoints - price,
	})
}
