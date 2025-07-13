package websocket

import (
	"log"
	"net/http"

	"go_chat/internal/client"
	"go_chat/internal/hub"
	"go_chat/pkg/config"

	"github.com/gorilla/websocket"
)

type WebSocketHandler struct {
	hub      *hub.Hub
	upgrader websocket.Upgrader
}

func NewWebSocketHandler(hub *hub.Hub) *WebSocketHandler {
	return &WebSocketHandler{
		hub: hub,
		upgrader: websocket.Upgrader{
			ReadBufferSize:  config.App.ReadBufferSize,
			WriteBufferSize: config.App.WriteBufferSize,
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
	}
}

func (h *WebSocketHandler) ServeWS(w http.ResponseWriter, r *http.Request) {
	conn, err := h.upgrader.Upgrade(w, r, nil)
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
