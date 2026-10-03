package database

import (
	"context"
	"log"
	"os"
	"sync"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

var (
	Pool *pgxpool.Pool
	once sync.Once
)

// InitPool inisialisasi koneksi Postgres via pgxpool (Singleton untuk Vercel).
func InitPool() {
	once.Do(func() {
		_ = godotenv.Load("../../.env") // Fallback lokal
		_ = godotenv.Load("../.env")    
		_ = godotenv.Load(".env")

		dbURL := os.Getenv("DATABASE_URL")
		if dbURL == "" {
			log.Println("WARNING: DATABASE_URL is not set")
			return
		}

		var err error
		Pool, err = pgxpool.New(context.Background(), dbURL)
		if err != nil {
			log.Fatalf("Unable to connect to database: %v\n", err)
		}
	})
}
