package handler

import (
	"context"
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

	// Single unified query with CTE and json_agg for maximum performance
	query := `
	WITH user_course AS (
		SELECT active_course_id 
		FROM user_progress 
		WHERE user_id = $1
	),
	completed_lessons AS (
		SELECT lesson_id 
		FROM lesson_progress 
		WHERE user_id = $1 AND completed = true
	),
	completed_challenges AS (
		SELECT challenge_id 
		FROM challenge_progress 
		WHERE user_id = $1 AND completed = true
	),
	lesson_status AS (
		SELECT 
			l.id,
			l.title,
			l."order",
			l.unit_id,
			CASE 
				WHEN cl.lesson_id IS NOT NULL THEN true
				WHEN COUNT(lc.challenge_id) > 0 AND COUNT(lc.challenge_id) = COUNT(cc.challenge_id) THEN true
				ELSE false
			END AS completed
		FROM lessons l
		JOIN units u ON u.id = l.unit_id
		JOIN user_course uc ON uc.active_course_id = u.course_id
		LEFT JOIN completed_lessons cl ON cl.lesson_id = l.id
		LEFT JOIN lesson_challenges lc ON lc.lesson_id = l.id
		LEFT JOIN completed_challenges cc ON cc.challenge_id = lc.challenge_id
		GROUP BY l.id, l.title, l."order", l.unit_id, cl.lesson_id
	)
	SELECT COALESCE(
		json_agg(
			json_build_object(
				'id', u.id,
				'title', u.title,
				'description', u.description,
				'order', u."order",
				'lessons', COALESCE(
					(
						SELECT json_agg(
							json_build_object(
								'id', ls.id,
								'title', ls.title,
								'order', ls."order",
								'completed', ls.completed
							) ORDER BY ls."order" ASC
						)
						FROM lesson_status ls
						WHERE ls.unit_id = u.id
					),
					'[]'::json
				)
			) ORDER BY u."order" ASC
		),
		'[]'::json
	)
	FROM units u
	JOIN user_course uc ON uc.active_course_id = u.course_id;
	`

	var unitsJSON []byte
	err = database.Pool.QueryRow(ctx, query, userId).Scan(&unitsJSON)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte("[]"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(unitsJSON)
}
