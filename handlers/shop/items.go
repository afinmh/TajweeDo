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

// Handler untuk GET /api/shop/items
func Items(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
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

	// Ambil semua item dari store_items
	// Left join dengan user_inventory untuk tahu apakah user sudah beli
	query := `
		SELECT si.id, si.name, si.image_src, si.price_points, si.item_type,
		       CASE WHEN ui.item_id IS NOT NULL THEN true ELSE false END as purchased
		FROM store_items si
		LEFT JOIN user_purchases ui ON si.id = ui.item_id AND ui.user_id = $1
		WHERE si.active = true
	`

	rows, err := database.Pool.Query(context.Background(), query, userId)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var items []map[string]interface{}
	for rows.Next() {
		var id int
		var name, imageSrc, itemType string
		var pricePoints int
		
		// The `database/sql` driver handles standard Go types.
		// `pgx` is likely used, so `bool` is fine.
		var isPurchased bool

		if err := rows.Scan(&id, &name, &imageSrc, &pricePoints, &itemType, &isPurchased); err != nil {
			// print error to console to debug
			println("Scan error:", err.Error())
			continue
		}

		items = append(items, map[string]interface{}{
			"id":          id,
			"name":        name,
			"imageSrc":    imageSrc,
			"pricePoints": pricePoints,
			"itemType":    itemType,
			"purchased":   isPurchased,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}
