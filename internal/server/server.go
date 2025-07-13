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

type Server struct {
	httpServer *http.Server
	hub        interface{}
}

func NewServer(hub interface{}) *Server {
	return &Server{
		hub: hub,
	}
}

func (s *Server) Setup(wsHandler http.HandlerFunc) {
	fs := http.FileServer(http.Dir("web/static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// STATIC FRONTEND
	http.HandleFunc("/", s.serveIndex)

	// WEBSOCKET SERVER
	http.HandleFunc("/ws", wsHandler)

	s.httpServer = &http.Server{
		Addr:         config.App.ServerPort,
		ReadTimeout:  config.App.ReadTimeout,
		WriteTimeout: config.App.WriteTimeout,
		IdleTimeout:  config.App.IdleTimeout,
	}
}

/*
 * INIT FRONTEND
 */
func (s *Server) serveIndex(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	http.ServeFile(w, r, "web/templates/index.html")
}

func (s *Server) Start() error {
	log.Printf("Servidor iniciado en %s", s.httpServer.Addr)
	return s.httpServer.ListenAndServe()
}

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

/*
 *  INIT SERVER
 */
func (s *Server) Run() error {
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	// Iniciar servidor en goroutine
	go func() {
		if err := s.Start(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Error en ListenAndServe: %v", err)
		}
	}()

	<-stop

	return s.Shutdown()
}
