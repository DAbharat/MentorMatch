package main

import (
	"MentorMatch/server-go/auth"
	"MentorMatch/server-go/config"
	"encoding/json"
	"fmt"
	"log"
	"net/url"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load(".env", "../.env", "../../.env")
	if err != nil {
		log.Println("no env file found")
	}

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	testuserID := "test-user-123"
	claims := auth.UserClaims{
		UserID: testuserID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	toeknString, err := token.SignedString([]byte(cfg.AccessTokenSecret))
	if err != nil {
		log.Fatalf("failed to sign token: %v", err)
	}

	fmt.Println("Generated test JWT token successfully")

	u := url.URL{
		Scheme:   "ws",
		Host:     "localhost:3001",
		Path:     "/ws",
		RawQuery: "token=" + toeknString + "&chatId=test-chat",
	}

	conn, resp, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Fatalf("connection failed: %v (response status: %v)", err, resp)
	}
	defer conn.Close()

	fmt.Printf("Connected to Go Websocket Server successfully")

	typingEvent := map[string]any{
		"event": "typing",
		"room":  "chat_test-chat",
		"data": map[string]string{
			"userId": testuserID,
		},
	}

	data, _ := json.Marshal(typingEvent)
	if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
		log.Fatalf("failed to send message: %v", err)
	}
	fmt.Println("Sent 'typing' event successfully")

	closeMsg := websocket.FormatCloseMessage(websocket.CloseNormalClosure, "")
	_ = conn.WriteMessage(websocket.CloseMessage, closeMsg)
	time.Sleep(500 * time.Millisecond)

	fmt.Println("\nAll verification checks passed!")
}
