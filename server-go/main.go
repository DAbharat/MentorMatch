package main

import (
	"MentorMatch/server-go/config"
	"MentorMatch/server-go/db"
	"MentorMatch/socket"
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	envLoaded, err := loadEnvironmentFiles(".env", "../.env")
	if err != nil {
		log.Fatalf("load environment file: %v", err)
	}
	if !envLoaded {
		log.Println("no .env file found in current or parent directory, using system environment variables")
	}

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load configuration: %v", err)
	}
	log.Println("configuration loaded successfully.")

	pool, err := db.New(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("load databse url: %v", err)
	}
	defer pool.Close()

	server := socket.NewServer(pool, cfg)
	server.Start()
}

func loadEnvironmentFiles(filenames ...string) (bool, error) {
	loaded := false
	for _, filename := range filenames {
		_, err := os.Stat(filename)
		if errors.Is(err, os.ErrNotExist) {
			continue
		}
		if err != nil {
			return false, fmt.Errorf("inspect %s: %w", filename, err)
		}

		if err := godotenv.Load(filename); err != nil {
			return false, fmt.Errorf("load %s: %w", filename, err)
		}
		loaded = true
	}

	return loaded, nil
}
