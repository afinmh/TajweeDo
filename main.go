package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"tajweedo-backend/router"
)

func main() {
	// Load .env
	godotenv.Load()

	mux := router.SetupRouter()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Backend server running on http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
