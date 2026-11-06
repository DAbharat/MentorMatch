package socket

import (
	"MentorMatch/server-go/auth"
	"MentorMatch/server-go/config"
	"MentorMatch/server-go/httpx"
	"MentorMatch/socket/manage"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/websocket"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Server struct {
	hub      *manage.Hub
	pool     *pgxpool.Pool
	cfg      *config.Config
	upgrader websocket.Upgrader
}

func NewServer(pool *pgxpool.Pool, cfg *config.Config) *Server {
	return &Server{
		hub:  manage.NewHub(),
		pool: pool,
		cfg:  cfg,
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
	}
}

func (s *Server) Start() {
	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{
		"status":"ok", 
		"server":"go"
		}`))
	})

	mux.HandleFunc("/ws", s.handleWebSocket)

	addr := ":" + strconv.Itoa(s.cfg.SocketPort)
	log.Printf("Go Socket Server running on http://localhost%s", addr)

	server := &http.Server{
		Addr:    addr,
		Handler: mux,
	}

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server failed to start: %v", err)
	}
}

func (s *Server) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	var token string

	if cookie, err := r.Cookie("accessToken"); err == nil && cookie.Value != "" {
		token = cookie.Value
	}

	if token == "" {
		token = r.URL.Query().Get("token")
	}
	if token == "" {
		httpx.RespondWithError(w, http.StatusBadRequest, "missing authentication token")
		return
	}

	claims, err := auth.VerifyAccessToken(token, s.cfg.AccessTokenSecret)
	if err != nil {
		httpx.RespondWithError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	conn, err := s.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("failed to upgrade connection for user: %v", err)
		return
	}

	client := manage.NewClient(s.hub, conn, claims.UserID)
	client.OnClose = s.handleDisconnect
	s.hub.Register(client)

	if chatId := r.URL.Query().Get("chatId"); chatId != "" {
		s.hub.JoinRoom(client, "chat_"+chatId)
	}

	client.Start(s.handleMessage)
}
