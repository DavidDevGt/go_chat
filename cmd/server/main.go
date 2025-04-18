package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"

	"go_chat/internal/hub"
	"go_chat/internal/websocket"
	"go_chat/pkg/config"
)

func main() {
	hub := hub.NewHub()
	go hub.Run()

	wsHandler := websocket.NewWebSocketHandler(hub)
	http.HandleFunc("/ws", wsHandler.ServeWS)

	server := &http.Server{
		Addr:         config.ServerPort,
		ReadTimeout:  config.ReadTimeout,
		WriteTimeout: config.WriteTimeout,
		IdleTimeout:  config.IdleTimeout,
	}

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)

	go func() {
		log.Printf("Servidor iniciado en %s", server.Addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Error en ListenAndServe: %v", err)
		}
	}()

	<-stop

	ctx, cancel := context.WithTimeout(context.Background(), config.ShutdownTimeout)
	defer cancel()

	log.Println("Apagando el servidor...")
	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Error al apagar el servidor: %v", err)
	}
	log.Println("Servidor apagado correctamente")
}
