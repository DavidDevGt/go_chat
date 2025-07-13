package config

import (
	"crypto/rand"
	"log"
	"os"
	"strconv"
	"time"
)

// Config contiene toda la configuración de la aplicación
type Config struct {
	ServerPort      string
	ReadTimeout     time.Duration
	WriteTimeout    time.Duration
	IdleTimeout     time.Duration
	ShutdownTimeout time.Duration
	ReadBufferSize  int
	WriteBufferSize int
	AESKey          []byte
}

// App es la instancia global de configuración
var App *Config

// Load carga la configuración desde variables de entorno y valores por defecto
func Load() {
	App = &Config{
		ServerPort:      getEnv("PORT", ":8420"),
		ReadTimeout:     getDurationEnv("READ_TIMEOUT", 15*time.Second),
		WriteTimeout:    getDurationEnv("WRITE_TIMEOUT", 15*time.Second),
		IdleTimeout:     getDurationEnv("IDLE_TIMEOUT", 60*time.Second),
		ShutdownTimeout: getDurationEnv("SHUTDOWN_TIMEOUT", 15*time.Second),
		ReadBufferSize:  getIntEnv("READ_BUFFER_SIZE", 1024),
		WriteBufferSize: getIntEnv("WRITE_BUFFER_SIZE", 1024),
	}

	// Cargar clave AES
	loadAESKey()
}

// getEnv obtiene una variable de entorno o retorna el valor por defecto
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getIntEnv obtiene una variable de entorno como entero o retorna el valor por defecto
func getIntEnv(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

// getDurationEnv obtiene una variable de entorno como duración o retorna el valor por defecto
func getDurationEnv(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}

// loadAESKey carga la clave AES desde variables de entorno o genera una por defecto
func loadAESKey() {
	key := os.Getenv("CHAT_AES_KEY")

	if key == "" {
		// Generar una clave por defecto para desarrollo
		log.Println("⚠️  CHAT_AES_KEY no configurada. Generando clave por defecto para desarrollo.")
		log.Println("⚠️  Para producción, configura CHAT_AES_KEY con una clave de 32 caracteres.")
		App.AESKey = generateDefaultKey()
		return
	}

	if len(key) != 32 {
		log.Fatalf("❌ La variable de entorno CHAT_AES_KEY debe tener 32 caracteres (AES-256)")
	}

	App.AESKey = []byte(key)
	log.Println("✅ Clave AES configurada correctamente")
}

// generateDefaultKey genera una clave AES por defecto para desarrollo
func generateDefaultKey() []byte {
	key := make([]byte, 32)
	_, err := rand.Read(key)
	if err != nil {
		log.Fatalf("❌ Error generando clave por defecto: %v", err)
	}
	return key
}

// LoadAESKey mantiene compatibilidad con código existente
func LoadAESKey() {
	if App == nil {
		Load()
	}
}
