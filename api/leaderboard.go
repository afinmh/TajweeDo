package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"tajweedo-backend/database"
)

func Leaderboard(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	database.InitPool()
	rows, err := database.Pool.Query(context.Background(), "SELECT user_id, user_name, user_image_src, points, xp FROM user_progress ORDER BY xp DESC, points DESC")
	if err != nil {
		http.Error(w, "DB Error", 500)
		return
	}
	defer rows.Close()

	users := []map[string]interface{}{}
	for rows.Next() {
		var id, name, img string
		var points, xp int
		rows.Scan(&id, &name, &img, &points, &xp)
		users = append(users, map[string]interface{}{
			"userId":       id,
			"userName":     name,
			"userImageSrc": img,
			"points":       points,
			"xp":           xp,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}
