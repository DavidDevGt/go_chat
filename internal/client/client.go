package client

import (
	"encoding/json"
	"go_chat/internal/hub"
	"log"

	"github.com/gorilla/websocket"
)

type Client struct {
	ID   string
	hub  *hub.Hub
	conn *websocket.Conn
	send chan []byte
}

func NewClient(h *hub.Hub, conn *websocket.Conn, id string) *Client {
	return &Client{
		ID:   id,
		hub:  h,
		conn: conn,
		send: make(chan []byte, 256),
	}
}

func (c *Client) GetSend() chan []byte {
	return c.send
}

func (c *Client) ReadPump() {
	defer func() {
		c.hub.Unregister <- c
		c.conn.Close()
	}()

	for {
		_, rawMessage, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Error inesperado: %v", err)
			} else {
				log.Printf("Cliente desconectado normalmente")
			}
			break
		}

		log.Printf("Mensaje recibido: %s", rawMessage)

		// Envolver mensaje con el ID del usuario
		payload := map[string]string{
			"user":    c.ID,
			"mensaje": string(rawMessage),
		}

		jsonPayload, err := json.Marshal(payload)
		if err != nil {
			log.Printf("Error serializando mensaje: %v", err)
			continue
		}

		c.hub.Broadcast <- jsonPayload
	}
}

func (c *Client) WritePump() {
	defer c.conn.Close()
	for message := range c.send {
		if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
			log.Printf("Error escribiendo mensaje: %v", err)
			return
		}
	}
}
