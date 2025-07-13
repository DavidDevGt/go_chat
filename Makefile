# Variables
BINARY_NAME=go-chat
BUILD_DIR=bin
MAIN_PATH=cmd/server/main.go
AES_KEY=12345678901234567890123456789012

# Colores para output
GREEN=\033[0;32m
YELLOW=\033[1;33m
NC=\033[0m # No Color

.PHONY: help build run clean test docker-build docker-run

# Comando por defecto
help: ## Muestra esta ayuda
	@echo "$(GREEN)Comandos disponibles:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

build: ## Construye la aplicación
	@echo "$(GREEN)Construyendo aplicación...$(NC)"
	@mkdir -p $(BUILD_DIR)
	go build -o $(BUILD_DIR)/$(BINARY_NAME) $(MAIN_PATH)
	@echo "$(GREEN)¡Construcción completada!$(NC)"

run: ## Ejecuta la aplicación en modo desarrollo
	@echo "$(GREEN)Ejecutando aplicación...$(NC)"
	CHAT_AES_KEY=$(AES_KEY) go run $(MAIN_PATH)

clean: ## Limpia archivos generados
	@echo "$(GREEN)Limpiando archivos generados...$(NC)"
	rm -rf $(BUILD_DIR)
	go clean

test: ## Ejecuta los tests
	@echo "$(GREEN)Ejecutando tests...$(NC)"
	go test ./...

test-coverage: ## Ejecuta tests con cobertura
	@echo "$(GREEN)Ejecutando tests con cobertura...$(NC)"
	go test -cover ./...

docker-build: ## Construye la imagen Docker
	@echo "$(GREEN)Construyendo imagen Docker...$(NC)"
	docker build -t $(BINARY_NAME) .

docker-run: ## Ejecuta el contenedor Docker
	@echo "$(GREEN)Ejecutando contenedor Docker...$(NC)"
	docker run -p 8420:8420 -e CHAT_AES_KEY=$(AES_KEY) $(BINARY_NAME)

docker-compose-up: ## Levanta los servicios con Docker Compose
	@echo "$(GREEN)Levantando servicios con Docker Compose...$(NC)"
	docker-compose up -d

docker-compose-down: ## Detiene los servicios de Docker Compose
	@echo "$(GREEN)Deteniendo servicios de Docker Compose...$(NC)"
	docker-compose down

dev: ## Ejecuta en modo desarrollo con hot reload (requiere air)
	@echo "$(GREEN)Ejecutando en modo desarrollo...$(NC)"
	@if command -v air > /dev/null; then \
		CHAT_AES_KEY=$(AES_KEY) air; \
	else \
		echo "$(YELLOW)Air no está instalado. Instalando...$(NC)"; \
		go install github.com/cosmtrek/air@latest; \
		CHAT_AES_KEY=$(AES_KEY) air; \
	fi

install-deps: ## Instala dependencias de desarrollo
	@echo "$(GREEN)Instalando dependencias de desarrollo...$(NC)"
	go mod download
	go install github.com/cosmtrek/air@latest

format: ## Formatea el código
	@echo "$(GREEN)Formateando código...$(NC)"
	go fmt ./...

lint: ## Ejecuta el linter
	@echo "$(GREEN)Ejecutando linter...$(NC)"
	@if command -v golangci-lint > /dev/null; then \
		golangci-lint run; \
	else \
		echo "$(YELLOW)golangci-lint no está instalado. Instalando...$(NC)"; \
		go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest; \
		golangci-lint run; \
	fi

setup: ## Configura el entorno de desarrollo
	@echo "$(GREEN)Configurando entorno de desarrollo...$(NC)"
	@echo "$(YELLOW)Configurando variable de entorno CHAT_AES_KEY...$(NC)"
	@if [ "$(OS)" = "Windows_NT" ]; then \
		setx CHAT_AES_KEY $(AES_KEY); \
		echo "$(GREEN)Variable CHAT_AES_KEY configurada en Windows$(NC)"; \
	else \
		echo "export CHAT_AES_KEY=$(AES_KEY)" >> ~/.bashrc; \
		echo "$(GREEN)Variable CHAT_AES_KEY configurada en Linux/Mac$(NC)"; \
	fi
	@echo "$(GREEN)¡Entorno configurado!$(NC)" 