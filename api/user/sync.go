package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strings"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/jwt"
	"tajweedo-backend/database"
)

type SyncResponse struct {
	ID     string `json:"id"`
	Points int    `json:"points"`
	Hearts int    `json:"hearts"`
	Avatar string `json:"avatar"`
}

// Handler untuk GET /api/user/sync
// Frontend memanggil ini setelah sukses login via Clerk untuk sinkronisasi DB lokal.
func Sync(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	authHeader := r.Header.Get("Authorization")
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	token := strings.TrimPrefix(authHeader, "Bearer ")

	clerk.SetKey(os.Getenv("CLERK_SECRET_KEY"))
	claims, err := jwt.Verify(context.Background(), &jwt.VerifyParams{
		Token: token,
	})
	if err != nil {
		http.Error(w, "Invalid Token: "+err.Error(), http.StatusUnauthorized)
		return
	}

	userID := claims.Subject

	database.InitPool()
	if database.Pool == nil {
		http.Error(w, "DB not configured", http.StatusInternalServerError)
		return
	}

	ctx := context.Background()

	// 1. Pastikan record di tabel users ada
	_, err = database.Pool.Exec(ctx, `
		INSERT INTO users (id, username, role) 
		VALUES ($1, $2, 'user') 
		ON CONFLICT (id) DO NOTHING
	`, userID, "user_"+userID[:6])
	if err != nil {
		http.Error(w, "Failed to sync user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 2. Pastikan record di tabel user_progress ada dan ambil datanya
	var resp SyncResponse
	err = database.Pool.QueryRow(ctx, `
		INSERT INTO user_progress (user_id, user_name, user_image_src, hearts, points)
		VALUES ($1, $2, '/standar.png', 5, 0)
		ON CONFLICT (user_id) DO UPDATE SET user_id = user_progress.user_id
		RETURNING user_id, points, hearts, user_image_src
	`, userID, "User").Scan(&resp.ID, &resp.Points, &resp.Hearts, &resp.Avatar)

	if err != nil {
		http.Error(w, "Failed to sync progress: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
