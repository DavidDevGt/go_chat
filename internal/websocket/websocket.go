package websocket

import (
	"log"
	"net/http"

	"go_chat/internal/client"
	"go_chat/internal/hub"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type WebSocketHandler struct {
	hub *hub.Hub
}

func NewWebSocketHandler(hub *hub.Hub) *WebSocketHandler {
	return &WebSocketHandler{
		hub: hub,
	}
}

func (h *WebSocketHandler) ServeWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Error al actualizar a WebSocket: %v", err)
		return
	}

	id := r.URL.Query().Get("id")
	if id == "" {
		id = "anon"
	}
	client := client.NewClient(h.hub, conn, id)
	h.hub.Register <- client

	go client.WritePump()
	client.ReadPump()
}
