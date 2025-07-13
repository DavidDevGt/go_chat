package server

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"go_chat/pkg/config"
)

// Server representa el servidor HTTP
type Server struct {
	httpServer *http.Server
	hub        interface{}
}

// NewServer crea una nueva instancia del servidor
func NewServer(hub interface{}) *Server {
	return &Server{
		hub: hub,
	}
}

// Setup configura las rutas del servidor
func (s *Server) Setup(wsHandler http.HandlerFunc) {
	// Servir archivos estáticos
	fs := http.FileServer(http.Dir("web/static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// Servir la página principal
	http.HandleFunc("/", s.serveIndex)

	// WebSocket endpoint
	http.HandleFunc("/ws", wsHandler)

	s.httpServer = &http.Server{
		Addr:         config.App.ServerPort,
		ReadTimeout:  config.App.ReadTimeout,
		WriteTimeout: config.App.WriteTimeout,
		IdleTimeout:  config.App.IdleTimeout,
	}
}

// serveIndex sirve la página principal
func (s *Server) serveIndex(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	http.ServeFile(w, r, "web/templates/index.html")
}

// Start inicia el servidor
func (s *Server) Start() error {
	log.Printf("Servidor iniciado en %s", s.httpServer.Addr)
	return s.httpServer.ListenAndServe()
}

// Shutdown apaga el servidor de forma graceful
func (s *Server) Shutdown() error {
	ctx, cancel := context.WithTimeout(context.Background(), config.App.ShutdownTimeout)
	defer cancel()

	log.Println("Apagando el servidor...")
	if err := s.httpServer.Shutdown(ctx); err != nil {
		return err
	}
	log.Println("Servidor apagado correctamente")
	return nil
}

// Run ejecuta el servidor con manejo de señales
func (s *Server) Run() error {
	// Canal para señales de interrupción
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	// Iniciar servidor en goroutine
	go func() {
		if err := s.Start(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Error en ListenAndServe: %v", err)
		}
	}()

	// Esperar señal de interrupción
	<-stop

	return s.Shutdown()
}
