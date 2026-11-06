package manage

import (
	"encoding/json"
	"log"
	"sync"
)

type MessagePayload struct {
	Event string          `json:"event"`
	Room  string          `json:"room,omitempty"`
	Data  json.RawMessage `json:"data"`
}

type Hub struct {
	clients     map[*Client]bool
	rooms       map[string]map[*Client]bool
	userClients map[string]map[*Client]bool
	clientRooms map[*Client]map[string]bool
	mu          sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		clients:     make(map[*Client]bool),
		rooms:       make(map[string]map[*Client]bool),
		clientRooms: make(map[*Client]map[string]bool),
		userClients: make(map[string]map[*Client]bool),
	}
}

func (h *Hub) Register(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if h.clients[client] {
		return
	}

	h.clients[client] = true

	if h.userClients[client.UserID] == nil {
		h.userClients[client.UserID] = make(map[*Client]bool)
	}
	h.userClients[client.UserID][client] = true
	h.clientRooms[client] = make(map[string]bool)
}

func (h *Hub) Unregister(client *Client) []string {
	h.mu.Lock()
	defer h.mu.Unlock()

	if !h.clients[client] {
		return nil
	}
	delete(h.clients, client)

	if userMap, exists := h.userClients[client.UserID]; exists {
		delete(userMap, client)
		if len(userMap) == 0 {
			delete(h.userClients, client.UserID)
		}
	}

	var leftRooms []string
	if rooms, exists := h.clientRooms[client]; exists {
		for room := range rooms {
			leftRooms = append(leftRooms, room)
			if clientsInRoom, ok := h.rooms[room]; ok {
				delete(clientsInRoom, client)
				if len(clientsInRoom) == 0 {
					delete(h.rooms, room)
				}
			}
		}
		delete(h.clientRooms, client)
	}

	return leftRooms
}

func (h *Hub) JoinRoom(client *Client, room string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if !h.clients[client] {
		return
	}
	if h.rooms[room] == nil {
		h.rooms[room] = make(map[*Client]bool)
	}
	h.rooms[room][client] = true

	if h.clientRooms[client] == nil {
		h.clientRooms[client] = make(map[string]bool)
	}
	h.clientRooms[client][room] = true
}

func (h *Hub) LeaveRoom(client *Client, room string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if clientsInRoom, ok := h.rooms[room]; ok {
		delete(clientsInRoom, client)
		if len(clientsInRoom) == 0 {
			delete(h.rooms, room)
		}
	}
	if rooms, ok := h.clientRooms[client]; ok {
		delete(rooms, room)
	}
}

func (h *Hub) IsUserOnline(userID string) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.userClients[userID]) > 0
}

func (h *Hub) BroadcastToRoom(room string, payload []byte, sender *Client) {
	h.mu.RLock()

	targets := make([]*Client, 0, len(h.rooms[room]))
	for client := range h.rooms[room] {
		if client != sender {
			targets = append(targets, client)
		}
	}
	h.mu.RUnlock()

	for _, client := range targets {
		if !client.TrySend(payload) {
			go client.Close()
		}
	}
}

func (h *Hub) BroadcastJSON(room string, v any, sender *Client) error {
	payload, err := json.Marshal(v)
	if err != nil {
		log.Printf("hub BroadcastJSON marshal error: %v", err)
		return err
	}

	h.BroadcastToRoom(room, payload, sender)
	return nil
}

func (h *Hub) SendToUser(userID string, payload []byte) {
	h.mu.RLock()

	targets := make([]*Client, 0, len(h.userClients[userID]))
	for client := range h.userClients[userID] {
		targets = append(targets, client)
	}
	h.mu.RUnlock()

	for _, client := range targets {
		if !client.TrySend(payload) {
			go client.Close()
		}
	}
}

func (h *Hub) SendJSONToUser(userID string, v any) error {
	payload, err := json.Marshal(v)
	if err != nil {
		log.Printf("hub SendJSONToUser marshal error: %v", err)
		return err
	}

	h.SendToUser(userID, payload)
	return nil
}
