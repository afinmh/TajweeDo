package handler

import (
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

	// Ambil semua item dari store_items secara teragregasi
	query := `
	SELECT COALESCE(
		json_agg(
			json_build_object(
				'id', si.id,
				'name', si.name,
				'imageSrc', si.image_src,
				'pricePoints', si.price_points,
				'itemType', si.item_type,
				'purchased', CASE WHEN ui.item_id IS NOT NULL THEN true ELSE false END
			) ORDER BY si.id ASC
		),
		'[]'::json
	)
	FROM store_items si
	LEFT JOIN user_purchases ui ON si.id = ui.item_id AND ui.user_id = $1
	WHERE si.active = true;
	`

	var result []byte
	err = database.Pool.QueryRow(r.Context(), query, userId).Scan(&result)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte("[]"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(result)
}
