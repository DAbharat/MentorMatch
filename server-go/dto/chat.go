package dto

import "time"

type ChatMessageInput struct {
	ChatID  string `json:"chatId"`
	Content string `json:"content"`
}

type MessageOutput struct {
	ID        string    `json:"id"`
	ChatID    string    `json:"chatId"`
	SenderID  string    `json:"senderId"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"createdAt"`
	Sender    struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"sender"`
}
