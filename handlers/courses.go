package handler

import (
	"context"
	"encoding/json"
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
	rows, err := database.Pool.Query(context.Background(), "SELECT id, title, image_src FROM courses ORDER BY id ASC")
	if err != nil {
		http.Error(w, "DB Error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	courses := []map[string]interface{}{}
	for rows.Next() {
		var id int
		var title, image string
		rows.Scan(&id, &title, &image)
		courses = append(courses, map[string]interface{}{
			"id":       id,
			"title":    title,
			"imageSrc": image,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(courses)
}
