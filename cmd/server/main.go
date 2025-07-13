package main

import (
	"log"

	"go_chat/internal/hub"
	"go_chat/internal/server"
	"go_chat/internal/websocket"
	"go_chat/pkg/config"
)

func main() {
	// Cargar configuración
	config.Load()

	// Crear y ejecutar hub
	hub := hub.NewHub()
	go hub.Run()

	// Crear manejador de WebSocket
	wsHandler := websocket.NewWebSocketHandler(hub)

	// Crear y configurar servidor
	srv := server.NewServer(hub)
	srv.Setup(wsHandler.ServeWS)

	// Ejecutar servidor
	if err := srv.Run(); err != nil {
		log.Fatalf("Error ejecutando servidor: %v", err)
	}
}
