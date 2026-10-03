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

		config, err := pgxpool.ParseConfig(dbURL)
		if err != nil {
			log.Fatalf("Unable to parse database config: %v\n", err)
		}
		config.MaxConns = 20
		config.MinConns = 3

		Pool, err = pgxpool.NewWithConfig(context.Background(), config)
		if err != nil {
			log.Fatalf("Unable to connect to database: %v\n", err)
		}
	})
}
