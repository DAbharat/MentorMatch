package socket

import (
	"MentorMatch/server-go/dto"
	"MentorMatch/socket/manage"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"log"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

func (s *Server) handleMessage(client *manage.Client, raw []byte) {
	var payload manage.MessagePayload
	if err := json.Unmarshal(raw, &payload); err != nil {
		log.Printf("invalid JSON from user %s: %v", client.UserID, err)
		client.SendJSON(map[string]any{
			"event":   "error",
			"message": "invalid JSON format",
		})
		return
	}

	switch payload.Event {
	case "join_room":
		s.handleJoinRoom(client, payload)

	case "leave_room":
		s.handleLeaveRoom(client, payload)

	case "send_message":
		s.handleChatMessage(client, payload)

	case "typing", "stop_typing":
		if payload.Room != "" {
			s.hub.BroadcastJSON(payload.Room, map[string]any{
				"event":  payload.Event,
				"room":   payload.Room,
				"userId": client.UserID,
			}, client)
		}

	case "session:start":
		s.handleSessionStart(client, payload)

	case "webrtc:join":
		s.handleWebRTCJoin(client, payload)

	case "webrtc:offer", "webrtc:answer", "webrtc:ice-candidate", "webrtc:screen-share-started", "webrtc:screen-share-stopped":
		s.handleWebRTCSignaling(client, payload, raw)

	default:
		log.Printf("unknown event '%s' from user %s", payload.Event, client.UserID)
	}
}

func (s *Server) handleChatMessage(client *manage.Client, payload manage.MessagePayload) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var input dto.ChatMessageInput

	decoder := json.NewDecoder(bytes.NewReader(payload.Data))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&input); err != nil {
		client.SendJSON(map[string]any{
			"event":   "chat:error",
			"message": "invalid message payload format",
		})
		return
	}
	if err := decoder.Decode(&struct{}{}); err != io.EOF {
		client.SendJSON(map[string]any{
			"event":   "chat:error",
			"message": "payload must contain a single JSON object",
		})
		return
	}

	content := strings.TrimSpace(input.Content)
	if content == "" {
		client.SendJSON(map[string]any{
			"event":   "chat:error",
			"message": "message content cannot be empty",
		})
		return
	}
	if len(content) > 5000 {
		client.SendJSON(map[string]any{
			"event":   "chat:error",
			"message": "message exceeds maximum allowed length of 5000 characters",
		})
		return
	}

	chatId := input.ChatID
	if chatId == "" && payload.Room != "" {
		chatId = strings.TrimPrefix(payload.Room, "chat_")
	}
	if chatId == "" {
		client.SendJSON(map[string]any{
			"event":   "chat:error",
			"message": "missing chat ID",
		})
		return
	}

	messageID := uuid.New().String()
	now := time.Now().UTC()

	const insertQuery = `
	WITH verified_sender AS (
		SELECT c.id AS chat_id, u.name AS sender_name
		FROM "Chat" c
		JOIN "User" u ON u.id = $3
		WHERE c.id = $2 AND (c."mentorId" = $3 OR c."menteeId" = $3)
	)
	INSERT INTO "Message" (
		id, "chatId", "senderId", content, "isDelivered", "isRead", "createdAt"
	)
	SELECT $1, vs.chat_id, $3, $4, false, false, $5
	FROM verified_sender vs
	RETURNING (SELECT sender_name FROM verified_sender)
	`

	var senderName string
	err := s.pool.QueryRow(ctx, insertQuery, messageID, chatId, client.UserID, content, now).Scan(&senderName)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			client.SendJSON(map[string]any{
				"event":   "chat:error",
				"message": "unauthorized or chat not found",
			})
			return
		}
		log.Printf("failed to save message: %v", err)
		client.SendJSON(map[string]any{
			"event":   "chat:error",
			"message": "internal server error",
		})
		return
	}

	out := dto.MessageOutput{
		ID:        messageID,
		ChatID:    chatId,
		SenderID:  client.UserID,
		Content:   strings.TrimSpace(input.Content),
		CreatedAt: now,
	}
	out.Sender.ID = client.UserID
	out.Sender.Name = senderName

	room := "chat_" + chatId
	s.hub.BroadcastJSON(room, map[string]any{
		"event": "new_message",
		"data":  out,
	}, nil)
}

func (s *Server) handleSessionStart(client *manage.Client, payload manage.MessagePayload) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var input dto.SessionStartInput
	if err := json.Unmarshal(payload.Data, &input); err != nil || input.SessionID == "" {
		client.SendJSON(map[string]any{
			"event":   "session:error",
			"message": "sessionId required",
		})
		return
	}

	var mentorId, menteeId, status string
	err := s.pool.QueryRow(ctx,
		`SELECT "mentorId", "menteeId", status
		FROM "Session"
		WHERE id = $1
		`, input.SessionID,
	).Scan(&mentorId, &menteeId, &status)

	if err != nil || mentorId != client.UserID {
		client.SendJSON(map[string]any{
			"event":   "session:error",
			"message": "session not found or unauthorized",
		})
		return
	}

	if status != "CONFIRMED" && status != "IN_PROGRESS" {
		client.SendJSON(map[string]any{
			"event":   "session:error",
			"message": "session is not eligible to start",
		})
		return
	}

	if !s.hub.IsUserOnline(menteeId) {
		client.SendJSON(map[string]any{
			"event":   "session:error",
			"message": "Mentee is not online",
		})
		return
	}

	_ = s.hub.SendJSONToUser(menteeId, map[string]any{
		"event": "session:started",
		"data": map[string]string{
			"sessionId": input.SessionID,
			"mentorId":  mentorId,
		},
	})

	client.SendJSON(map[string]any{
		"event": "session:started:ack",
		"data": map[string]string{
			"sessionId": input.SessionID,
		},
	})
}

func (s *Server) handleWebRTCJoin(client *manage.Client, payload manage.MessagePayload) {
	room := payload.Room
	if room == "" {
		return
	}

	s.hub.JoinRoom(client, room)
	s.hub.BroadcastJSON(room, map[string]any{
		"event": "webrtc:peer-joined",
		"data": map[string]string{
			"userId": client.UserID,
		},
	}, client)
}

func (s *Server) handleWebRTCSignaling(client *manage.Client, payload manage.MessagePayload, raw []byte) {
	if payload.Room != "" {
		s.hub.BroadcastToRoom(payload.Room, raw, client)
	}
}

func (s *Server) handleDisconnect(client *manage.Client, leftRooms []string) {
	for _, room := range leftRooms {
		if strings.HasPrefix(room, "call_") {
			s.hub.BroadcastJSON(room, map[string]any{
				"event": "webrtc:peer-left",
				"data": map[string]string{
					"userId": client.UserID,
				},
			}, client)
		}
	}
}

func (s *Server) handleJoinRoom(client *manage.Client, payload manage.MessagePayload) {
	room := payload.Room
	if room == "" {
		var data struct {
			Room string `json:"room"`
		}
		_ = json.Unmarshal(payload.Data, &data)
		room = data.Room
	}

	if room == "" {
		return
	}

	if strings.HasPrefix(room, "chat_") {
		chatId := strings.TrimPrefix(room, "chat_")
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()

		var exists bool
		err := s.pool.QueryRow(ctx,
			`
			SELECT EXISTS(
				SELECT 1 FROM "Chat"
				WHERE id = $1 AND ("mentorId" = $2 OR "menteeId" = $2)
			)
		`, chatId, client.UserID).Scan(&exists)

		if err != nil || !exists {
			client.SendJSON(map[string]any{
				"event":   "chat:error",
				"message": "unauthorized to join room",
			})
			return
		}

		s.hub.JoinRoom(client, room)
		client.SendJSON(map[string]any{
			"event": "room_joined",
			"data": map[string]string{
				"room": room,
			},
		})
	}
}

func (s *Server) handleLeaveRoom(client *manage.Client, payload manage.MessagePayload) {
	room := payload.Room
	if room != "" {
		s.hub.LeaveRoom(client, room)
	}
}
