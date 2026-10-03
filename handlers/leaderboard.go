package handler

import (
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
	query := `
	SELECT COALESCE(
		json_agg(
			json_build_object(
				'userId', user_id,
				'userName', COALESCE(user_name, 'Learner'),
				'userImageSrc', COALESCE(user_image_src, '/mascot.svg'),
				'points', points,
				'xp', xp
			)
		),
		'[]'::json
	)
	FROM (
		SELECT user_id, user_name, user_image_src, points, xp 
		FROM user_progress 
		ORDER BY xp DESC, points DESC 
		LIMIT 100
	) sub;
	`

	var result []byte
	err := database.Pool.QueryRow(r.Context(), query).Scan(&result)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte("[]"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(result)
}
