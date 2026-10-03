package handler

import (
	"net/http"
	"sync"
	"tajweedo-backend/router"
)

var (
	apiHandler http.Handler
	once       sync.Once
)

// Handler is the single entry point for Vercel Serverless Functions
func Handler(w http.ResponseWriter, r *http.Request) {
	once.Do(func() {
		apiHandler = router.SetupRouter()
	})
	apiHandler.ServeHTTP(w, r)
}
