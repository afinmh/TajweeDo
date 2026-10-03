/*  */ package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"time"

	"tajweedo-backend/database"

	"github.com/golang-jwt/jwt/v5"
)

func DailyLogin(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS")
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

	var userId string
	if tokenString != "" {
		secret := os.Getenv("JWT_SECRET")
		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			return []byte(secret), nil
		})
		if err == nil && token.Valid {
			if claims, ok := token.Claims.(jwt.MapClaims); ok {
				userId = claims["userId"].(string)
			}
		}
	}

	database.InitPool()
	ctx := context.Background()

	// GET request
	if r.Method == http.MethodGet {
		rows, err := database.Pool.Query(ctx, "SELECT day, points, item_id FROM daily_login_rewards ORDER BY day ASC")
		rewards := []map[string]interface{}{}
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var day, points int
				var itemId *int
				rows.Scan(&day, &points, &itemId)
				rewards = append(rewards, map[string]interface{}{
					"day": day, "points": points, "item_id": itemId,
				})
			}
		}

		if userId == "" {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{"rewards": rewards})
			return
		}

		todayStr := time.Now().Format("2006-01-02")
		yesterdayStr := time.Now().AddDate(0, 0, -1).Format("2006-01-02")

		// Ensure user_progress exists (like legacy code did)
		var upId string
		err = database.Pool.QueryRow(ctx, "SELECT user_id FROM user_progress WHERE user_id = $1", userId).Scan(&upId)
		if err != nil {
			var username, profileImage string
			database.Pool.QueryRow(ctx, "SELECT username, profile_image_src FROM users WHERE id = $1", userId).Scan(&username, &profileImage)
			database.Pool.Exec(ctx, "INSERT INTO user_progress (user_id, user_name, user_image_src, hearts, points, xp) VALUES ($1, $2, $3, 5, 0, 0) ON CONFLICT DO NOTHING", userId, username, profileImage)
		}

		var lastDate string
		var cStreak, bStreak, tLogins int
		var status, view bool
		err = database.Pool.QueryRow(ctx, "SELECT COALESCE(TO_CHAR(last_login_date, 'YYYY-MM-DD'), ''), COALESCE(current_streak, 0), COALESCE(best_streak, 0), COALESCE(total_logins, 0), COALESCE(status::boolean, false), COALESCE(view::boolean, false) FROM user_daily_login WHERE user_id = $1", userId).
			Scan(&lastDate, &cStreak, &bStreak, &tLogins, &status, &view)

		if err != nil {
			// Not found, insert fresh
			database.Pool.Exec(ctx, "INSERT INTO user_daily_login (user_id, last_login_date, current_streak, best_streak, total_logins, status, view) VALUES ($1, $2, 0, 0, 0, 'false', 'false')", userId, yesterdayStr)
			lastDate = yesterdayStr
		}

		if lastDate != todayStr && (status || view) {
			database.Pool.Exec(ctx, "UPDATE user_daily_login SET status = 'false', view = 'false' WHERE user_id = $1", userId)
			status = false
			view = false
		}

		dayIndex := (tLogins % 30) + 1
		if lastDate == todayStr && status {
			dayIndex = ((tLogins - 1) % 30) + 1
		}

		var rPts int
		var rItem *int
		database.Pool.QueryRow(ctx, "SELECT points, item_id FROM daily_login_rewards WHERE day = $1", dayIndex).Scan(&rPts, &rItem)

		rewardMap := map[string]interface{}{"day": dayIndex, "points": rPts, "item_id": rItem}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"rewards": rewards,
			"state": map[string]interface{}{
				"show":            lastDate != todayStr && !view,
				"status":          status,
				"view":            view,
				"last_login_date": lastDate,
				"currentStreak":   cStreak,
				"bestStreak":      bStreak,
				"totalLogins":     tLogins,
				"day":             dayIndex,
				"reward":          rewardMap,
			},
		})
		return
	}

	// POST request
	if r.Method == http.MethodPost {
		if userId == "" {
			http.Error(w, "Unauthorized", 401)
			return
		}

		todayStr := time.Now().Format("2006-01-02")
		yesterdayStr := time.Now().AddDate(0, 0, -1).Format("2006-01-02")

		var lastDate string
		var cStreak, bStreak, tLogins int
		var status bool
		err := database.Pool.QueryRow(ctx, "SELECT COALESCE(TO_CHAR(last_login_date, 'YYYY-MM-DD'), ''), COALESCE(current_streak, 0), COALESCE(best_streak, 0), COALESCE(total_logins, 0), COALESCE(status::boolean, false) FROM user_daily_login WHERE user_id = $1", userId).
			Scan(&lastDate, &cStreak, &bStreak, &tLogins, &status)

		importLog := func(a ...any) {
			for _, v := range a {
				print(v, " ")
			}
			println()
		}
		importLog("POST Check:", "err=", err, "lastDate=", lastDate, "todayStr=", todayStr, "status=", status)

		if err == nil && lastDate == todayStr && status {
			dayIndex := ((tLogins - 1) % 30) + 1
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{"status": "already_claimed", "day": dayIndex})
			return
		}

		isConsecutive := lastDate == yesterdayStr
		if isConsecutive {
			cStreak++
		} else {
			cStreak = 1
		}
		if cStreak > bStreak {
			bStreak = cStreak
		}
		tLogins++

		dayIndex := ((tLogins - 1) % 30) + 1
		var rPts int
		var rItem *int
		database.Pool.QueryRow(ctx, "SELECT points, item_id FROM daily_login_rewards WHERE day = $1", dayIndex).Scan(&rPts, &rItem)

		if rPts > 0 {
			database.Pool.Exec(ctx, "UPDATE user_progress SET points = points + $1 WHERE user_id = $2", rPts, userId)
		}
		if rItem != nil {
			database.Pool.Exec(ctx, "INSERT INTO user_purchases (user_id, item_id) VALUES ($1, $2)", userId, *rItem)
		}

		database.Pool.Exec(ctx, `
			INSERT INTO user_daily_login (user_id, last_login_date, current_streak, best_streak, total_logins, status)
			VALUES ($1, $2, $3, $4, $5, 'true')
			ON CONFLICT (user_id) DO UPDATE SET 
				last_login_date = EXCLUDED.last_login_date,
				current_streak = EXCLUDED.current_streak,
				best_streak = EXCLUDED.best_streak,
				total_logins = EXCLUDED.total_logins,
				status = EXCLUDED.status
		`, userId, todayStr, cStreak, bStreak, tLogins)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":      "claimed",
			"day":         dayIndex,
			"reward":      map[string]interface{}{"points": rPts, "item_id": rItem},
			"totalLogins": tLogins,
		})
		return
	}

	// PATCH request
	if r.Method == http.MethodPatch {
		if userId == "" {
			http.Error(w, "Unauthorized", 401)
			return
		}
		var body struct {
			View bool `json:"view"`
		}
		json.NewDecoder(r.Body).Decode(&body)
		viewStr := "false"
		if body.View {
			viewStr = "true"
		}
		database.Pool.Exec(ctx, "UPDATE user_daily_login SET view = $1 WHERE user_id = $2", viewStr, userId)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"ok": true})
	}
}
