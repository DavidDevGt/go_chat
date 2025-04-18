package config

import "time"

const (
	ServerPort      = ":8420"
	ReadTimeout     = 15 * time.Second
	WriteTimeout    = 15 * time.Second
	IdleTimeout     = 60 * time.Second
	ShutdownTimeout = 15 * time.Second
	ReadBufferSize  = 1024
	WriteBufferSize = 1024
)
