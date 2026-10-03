package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"tajweedo-backend/database"

	api "tajweedo-backend/api"
	auth "tajweedo-backend/api/auth"
	challenge "tajweedo-backend/api/challenge"
	shop "tajweedo-backend/api/shop"
	user "tajweedo-backend/api/user"
)

// corsMiddleware is a basic middleware to handle CORS for local development
func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
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

func main() {
	// Load .env
	godotenv.Load()

	// Initialize Database Pool
	database.InitPool()

	mux := http.NewServeMux()

	// Root API
	mux.HandleFunc("/api/courses", corsMiddleware(api.Courses))
	mux.HandleFunc("/api/daily-login", corsMiddleware(api.DailyLogin))
	mux.HandleFunc("/api/leaderboard", corsMiddleware(api.Leaderboard))
	mux.HandleFunc("/api/health", corsMiddleware(api.Health))
	mux.HandleFunc("/api/lessons", corsMiddleware(api.Lessons))
	mux.HandleFunc("/api/units", corsMiddleware(api.Units))

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

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Backend server running on http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
