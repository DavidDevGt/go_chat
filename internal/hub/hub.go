package hub

import (
	"log"
)

type Hub struct {
	Clients    map[Client]bool
	Broadcast  chan []byte
	Register   chan Client
	Unregister chan Client
}

type Client interface {
	GetSend() chan []byte
}

func NewHub() *Hub {
	return &Hub{
		Clients:    make(map[Client]bool),
		Broadcast:  make(chan []byte),
		Register:   make(chan Client),
		Unregister: make(chan Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.Clients[client] = true
			log.Printf("Nuevo cliente registrado. Total clientes: %d", len(h.Clients))
		case client := <-h.Unregister:
			if _, ok := h.Clients[client]; ok {
				delete(h.Clients, client)
				close(client.GetSend())
				log.Printf("Cliente desconectado. Total clientes: %d", len(h.Clients))
			}
		case message := <-h.Broadcast:
			for client := range h.Clients {
				select {
				case client.GetSend() <- message:
				default:
					close(client.GetSend())
					delete(h.Clients, client)
				}
			}
		}
	}
}
