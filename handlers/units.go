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

// Handler untuk GET /api/units
func Units(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
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
	userId := claims["userId"].(string)

	database.InitPool()
	ctx := context.Background()

	// Ambil active_course_id
	var activeCourseId int
	err = database.Pool.QueryRow(ctx, "SELECT active_course_id FROM user_progress WHERE user_id = $1", userId).Scan(&activeCourseId)
	if err != nil || activeCourseId == 0 {
		json.NewEncoder(w).Encode([]interface{}{})
		return
	}

	// Ambil units
	rows, err := database.Pool.Query(ctx, "SELECT id, title, description, \"order\" FROM units WHERE course_id = $1 ORDER BY \"order\" ASC", activeCourseId)
	if err != nil {
		http.Error(w, "DB Error", 500)
		return
	}
	defer rows.Close()

	type Lesson struct {
		ID        int    `json:"id"`
		Title     string `json:"title"`
		Order     int    `json:"order"`
		Completed bool   `json:"completed"`
	}

	type Unit struct {
		ID          int      `json:"id"`
		Title       string   `json:"title"`
		Description string   `json:"description"`
		Order       int      `json:"order"`
		Lessons     []Lesson `json:"lessons"`
	}

	units := []Unit{}
	var unitIDs []int
	for rows.Next() {
		var u Unit
		rows.Scan(&u.ID, &u.Title, &u.Description, &u.Order)
		u.Lessons = []Lesson{}
		units = append(units, u)
		unitIDs = append(unitIDs, u.ID)
	}

	if len(units) > 0 {
		// Ambil lessons
		lrows, _ := database.Pool.Query(ctx, "SELECT id, title, \"order\", unit_id FROM lessons WHERE unit_id = ANY($1) ORDER BY \"order\" ASC", unitIDs)
		defer lrows.Close()
		
		lessonsByUnit := make(map[int][]Lesson)
		for lrows.Next() {
			var l Lesson
			var uid int
			lrows.Scan(&l.ID, &l.Title, &l.Order, &uid)
			lessonsByUnit[uid] = append(lessonsByUnit[uid], l)
		}

		// Ambil lesson_progress
		lprows, _ := database.Pool.Query(ctx, "SELECT lesson_id, completed FROM lesson_progress WHERE user_id = $1", userId)
		completedLessons := make(map[int]bool)
		if lprows != nil {
			for lprows.Next() {
				var lid int
				var comp bool
				lprows.Scan(&lid, &comp)
				if comp {
					completedLessons[lid] = true
				}
			}
			lprows.Close()
		}

		// Ambil challenge_progress
		crows, _ := database.Pool.Query(ctx, "SELECT challenge_id FROM challenge_progress WHERE user_id = $1 AND completed = true", userId)
		completedChallenges := make(map[int]bool)
		if crows != nil {
			for crows.Next() {
				var cid int
				crows.Scan(&cid)
				completedChallenges[cid] = true
			}
			crows.Close()
		}

		var lessonIDs []int
		for _, ls := range lessonsByUnit {
			for _, l := range ls {
				lessonIDs = append(lessonIDs, l.ID)
			}
		}

		lessonChallenges := make(map[int][]int)
		if len(lessonIDs) > 0 {
			// Use pivot table for structured 7-per-lesson distribution
			chrows, _ := database.Pool.Query(ctx, "SELECT lesson_id, challenge_id FROM lesson_challenges WHERE lesson_id = ANY($1)", lessonIDs)
			if chrows != nil {
				for chrows.Next() {
					var lid, cid int
					chrows.Scan(&lid, &cid)
					lessonChallenges[lid] = append(lessonChallenges[lid], cid)
				}
				chrows.Close()
			}
		}

		for uid, lessons := range lessonsByUnit {
			for i, l := range lessons {
				done := completedLessons[l.ID]
				if !done {
					cids := lessonChallenges[l.ID]
					if len(cids) > 0 {
						done = true
						for _, cid := range cids {
							if !completedChallenges[cid] {
								done = false
								break
							}
						}
					}
				}
				lessonsByUnit[uid][i].Completed = done
			}
		}
		
		for i := range units {
			units[i].Lessons = lessonsByUnit[units[i].ID]
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(units)
}
