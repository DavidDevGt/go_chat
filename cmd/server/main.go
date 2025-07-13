package main

import (
	"log"

	"go_chat/internal/hub"
	"go_chat/internal/server"
	"go_chat/internal/websocket"
	"go_chat/pkg/config"
)

func main() {
	config.Load()

	hub := hub.NewHub()
	go hub.Run()

	wsHandler := websocket.NewWebSocketHandler(hub)

	srv := server.NewServer(hub)
	srv.Setup(wsHandler.ServeWS)

	if err := srv.Run(); err != nil {
		log.Fatalf("Error ejecutando servidor: %v", err)
	}
}
