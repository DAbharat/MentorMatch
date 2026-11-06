package main

import (
	"MentorMatch/server-go/config"
	"MentorMatch/server-go/db"
	"MentorMatch/socket"
	"log"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(".env", "../.env"); err != nil {
		log.Println("no .env file found, using system environment variables")
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
