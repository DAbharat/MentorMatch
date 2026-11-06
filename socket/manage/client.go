package manage

import (
	"context"
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Client struct {
	hub        *Hub
	conn       *websocket.Conn
	UserID     string
	send       chan []byte
	rooms      map[string]bool
	closeOnce  sync.Once
	ctx        context.Context
	cancelFunc context.CancelFunc
	sendMu     sync.Mutex
	closed     bool
	OnClose    func(client *Client, leftRooms []string)
}

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 512 * 1024
)

func NewClient(hub *Hub, conn *websocket.Conn, userID string) *Client {
	ctx, cancel := context.WithCancel(context.Background())
	return &Client{
		hub:        hub,
		conn:       conn,
		UserID:     userID,
		send:       make(chan []byte, 256),
		rooms:      make(map[string]bool),
		ctx:        ctx,
		cancelFunc: cancel,
	}
}

func (c *Client) TrySend(msg []byte) bool {
	c.sendMu.Lock()
	defer c.sendMu.Unlock()

	if c.closed {
		return false
	}

	select {
	case <-c.ctx.Done():
		return false
	default:
	}

	select {
	case <-c.ctx.Done():
		return false
	case c.send <- msg:
		return true
	default:
		return false
	}
}

func (c *Client) SendJSON(v any) bool {
	data, err := json.Marshal(v)
	if err != nil {
		log.Printf("marshal error for user %s: %v", c.UserID, err)
		return false
	}

	return c.TrySend(data)
}

func (c *Client) Close() {
	c.closeOnce.Do(func() {
		c.sendMu.Lock()
		c.closed = true
		c.sendMu.Unlock()

		c.cancelFunc()
		leftRooms := c.hub.Unregister(c)
		_ = c.conn.Close()

		if c.OnClose != nil {
			c.OnClose(c, leftRooms)
		}
	})
}

func (c *Client) Start(handleMessage func(client *Client, raw []byte)) {
	go c.writePump()
	go c.readPump(handleMessage)
}

func (c *Client) ReadPump(handleMessage func(client *Client, raw []byte)) {
	c.readPump(handleMessage)
}

func (c *Client) WritePump() {
	c.writePump()
}

// continously read incoming messages
func (c *Client) readPump(handleMessage func(client *Client, raw []byte)) {
	defer c.Close()

	c.conn.SetReadLimit(maxMessageSize)
	_ = c.conn.SetReadDeadline(time.Now().Add(pongWait))

	c.conn.SetPongHandler(func(string) error {
		_ = c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure) {
				log.Printf("websocket error (user %s): %v", c.UserID, err)
			}
			break
		}
		handleMessage(c, message)
	}
}

// only goroutine allowed to write into c.conn
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.Close()
	}()

	for {
		select {
		case <-c.ctx.Done():
			_ = c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			_ = c.conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
			return

		case message, ok := <-c.send:
			_ = c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				_ = c.conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			if _, err := w.Write(message); err != nil {
				return
			}
			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			_ = c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
