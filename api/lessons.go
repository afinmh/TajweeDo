package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"tajweedo-backend/database"
)

// Handler untuk GET /api/lessons?id=123
func Lessons(w http.ResponseWriter, r *http.Request) {
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
	// Note: We parse the token but don't strictly require userId for fetching a lesson,
	// though we could enforce it.


	lessonIDStr := r.URL.Query().Get("id")
	lessonID, err := strconv.Atoi(lessonIDStr)
	if err != nil {
		http.Error(w, "Invalid lesson ID", http.StatusBadRequest)
		return
	}

	database.InitPool()
	ctx := context.Background()

	type Option struct {
		ID        int    `json:"id"`
		Text      string `json:"text"`
		ImageSrc  *string `json:"imageSrc,omitempty"`
		AudioSrc  *string `json:"audioSrc,omitempty"`
		Correct   bool   `json:"correct"`
	}

	type Challenge struct {
		ID        int      `json:"id"`
		Type      string   `json:"type"`
		Question  string   `json:"question"`
		Order     int      `json:"order"`
		Completed bool     `json:"completed"`
		Options   []Option `json:"challengeOptions"`
	}

	type Lesson struct {
		ID         int         `json:"id"`
		Title      string      `json:"title"`
		Challenges []Challenge `json:"challenges"`
	}

	var l Lesson
	err = database.Pool.QueryRow(ctx, "SELECT id, title FROM lessons WHERE id = $1", lessonID).Scan(&l.ID, &l.Title)
	if err != nil {
		http.Error(w, "Lesson not found", 404)
		return
	}

	// Query via pivot table lesson_challenges for structured 7-per-lesson distribution
	crows, err := database.Pool.Query(ctx, `
		SELECT c.id, c.type, c.question, lc.position
		FROM lesson_challenges lc
		JOIN challenges c ON c.id = lc.challenge_id
		WHERE lc.lesson_id = $1
		ORDER BY lc.position ASC
	`, lessonID)
	if err == nil {
		defer crows.Close()
		var cIDs []int
		for crows.Next() {
			var c Challenge
			crows.Scan(&c.ID, &c.Type, &c.Question, &c.Order)
			c.Options = []Option{}
			l.Challenges = append(l.Challenges, c)
			cIDs = append(cIDs, c.ID)
		}

		if len(cIDs) > 0 {
			orows, _ := database.Pool.Query(ctx, "SELECT id, challenge_id, text, correct, image_src, audio_src FROM challenge_options WHERE challenge_id = ANY($1)", cIDs)
			defer orows.Close()
			
			optMap := make(map[int][]Option)
			for orows.Next() {
				var o Option
				var cid int
				orows.Scan(&o.ID, &cid, &o.Text, &o.Correct, &o.ImageSrc, &o.AudioSrc)
				optMap[cid] = append(optMap[cid], o)
			}
			
			// Ambil completed dari challenge_progress
			claims, _ := token.Claims.(jwt.MapClaims)
			userId := claims["userId"].(string)

			prows, _ := database.Pool.Query(ctx, "SELECT challenge_id FROM challenge_progress WHERE user_id = $1 AND challenge_id = ANY($2) AND completed = true", userId, cIDs)
			completedMap := make(map[int]bool)
			if prows != nil {
				defer prows.Close()
				for prows.Next() {
					var cid int
					prows.Scan(&cid)
					completedMap[cid] = true
				}
			}

			for i := range l.Challenges {
				l.Challenges[i].Options = optMap[l.Challenges[i].ID]
				l.Challenges[i].Completed = completedMap[l.Challenges[i].ID]
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(l)
}
