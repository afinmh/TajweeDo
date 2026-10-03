package handler

import (
	"net/http"
	"tajweedo-backend/database"
)

// Handler untuk GET /api/courses
func Courses(w http.ResponseWriter, r *http.Request) {
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
				'id', id,
				'title', title,
				'imageSrc', image_src
			) ORDER BY id ASC
		),
		'[]'::json
	)
	FROM courses;
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
