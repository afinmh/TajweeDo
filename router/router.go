package router

import (
	"net/http"
	"strings"

	"tajweedo-backend/database"
	handlers "tajweedo-backend/handlers"
	auth "tajweedo-backend/handlers/auth"
	challenge "tajweedo-backend/handlers/challenge"
	shop "tajweedo-backend/handlers/shop"
	user "tajweedo-backend/handlers/user"
)

// corsMiddleware is a middleware to handle CORS for both local development and Vercel
func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			w.Header().Set("Access-Control-Allow-Origin", "*")
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

// SetupRouter initializes database and returns the configured HTTP handler.
func SetupRouter() http.Handler {
	database.InitPool()

	mux := http.NewServeMux()

	// Root API
	mux.HandleFunc("/api/courses", corsMiddleware(handlers.Courses))
	mux.HandleFunc("/api/daily-login", corsMiddleware(handlers.DailyLogin))
	mux.HandleFunc("/api/leaderboard", corsMiddleware(handlers.Leaderboard))
	mux.HandleFunc("/api/health", corsMiddleware(handlers.Health))
	mux.HandleFunc("/api/lessons", corsMiddleware(handlers.Lessons))
	mux.HandleFunc("/api/units", corsMiddleware(handlers.Units))

	// Auth API
	mux.HandleFunc("/api/auth/register", corsMiddleware(auth.Register))
	mux.HandleFunc("/api/auth/login", corsMiddleware(auth.Login))
	mux.HandleFunc("/api/auth/logout", corsMiddleware(auth.Logout))
	mux.HandleFunc("/api/auth/me", corsMiddleware(auth.Me))

	// User API
	mux.HandleFunc("/api/user/sync", corsMiddleware(user.Sync))
	mux.HandleFunc("/api/user/progress", corsMiddleware(user.UserProgress))
	mux.HandleFunc("/api/user/reduce-hearts", corsMiddleware(user.ReduceHearts))
	mux.HandleFunc("/api/user/refill-hearts", corsMiddleware(user.RefillHearts))
	mux.HandleFunc("/api/user/course", corsMiddleware(user.UserCourse))
	mux.HandleFunc("/api/account", corsMiddleware(user.Account))

	// Challenge API
	mux.HandleFunc("/api/challenge/progress", corsMiddleware(challenge.ChallengeProgress))

	// Shop API
	mux.HandleFunc("/api/shop/items", corsMiddleware(shop.Items))
	mux.HandleFunc("/api/shop/buy", corsMiddleware(shop.Buy))

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// When deployed on Vercel with rewrites, r.URL.Path might be "/api/index.go" or original path.
		// Check headers if r.URL.Path was rewritten to /api/index.go or /api
		if r.URL.Path == "/api/index.go" || r.URL.Path == "/api" {
			if matched := r.Header.Get("x-matched-path"); matched != "" {
				r.URL.Path = strings.Split(matched, "?")[0]
			}
		}
		mux.ServeHTTP(w, r)
	})
}
