package config

import (
	"log"
	"os"
	"time"
)

const (
	ServerPort      = ":8420"
	ReadTimeout     = 15 * time.Second
	WriteTimeout    = 15 * time.Second
	IdleTimeout     = 60 * time.Second
	ShutdownTimeout = 15 * time.Second
	ReadBufferSize  = 1024
	WriteBufferSize = 1024
)

var AESKey []byte

func LoadAESKey() {
	key := os.Getenv("CHAT_AES_KEY")
	if len(key) != 32 {
		log.Fatalf("La variable de entorno CHAT_AES_KEY debe tener 32 caracteres (AES-256)")
	}
	AESKey = []byte(key)
}
