# Variables
BINARY_NAME=go-chat
BUILD_DIR=bin
MAIN_PATH=cmd/server/main.go

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
	go run $(MAIN_PATH)

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
	docker run -p 8420:8420 --env-file .env $(BINARY_NAME)

docker-compose-up: ## Levanta los servicios con Docker Compose
	@echo "$(GREEN)Levantando servicios con Docker Compose...$(NC)"
	docker-compose up -d

docker-compose-down: ## Detiene los servicios de Docker Compose
	@echo "$(GREEN)Deteniendo servicios de Docker Compose...$(NC)"
	docker-compose down

docker-compose-logs: ## Muestra logs de Docker Compose
	@echo "$(GREEN)Mostrando logs...$(NC)"
	docker-compose logs -f

docker-compose-restart: ## Reinicia los servicios de Docker Compose
	@echo "$(GREEN)Reiniciando servicios...$(NC)"
	docker-compose restart

dev: ## Ejecuta en modo desarrollo con hot reload (requiere air)
	@echo "$(GREEN)Ejecutando en modo desarrollo...$(NC)"
	@if command -v air > /dev/null; then \
		air; \
	else \
		echo "$(YELLOW)Air no está instalado. Instalando...$(NC)"; \
		go install github.com/cosmtrek/air@latest; \
		air; \
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
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Creando archivo .env desde env.example...$(NC)"; \
		cp env.example .env; \
		echo "$(GREEN)Archivo .env creado. Edita las variables según necesites.$(NC)"; \
	else \
		echo "$(GREEN)Archivo .env ya existe.$(NC)"; \
	fi
	@echo "$(GREEN)¡Entorno configurado!$(NC)"

setup-windows: ## Configura el entorno en Windows
	@echo "$(GREEN)Ejecutando script de configuración para Windows...$(NC)"
	powershell -ExecutionPolicy Bypass -File setup.ps1

setup-unix: ## Configura el entorno en Unix/Linux
	@echo "$(GREEN)Ejecutando script de configuración para Unix/Linux...$(NC)"
	chmod +x setup.sh && ./setup.sh

env-init: ## Inicializa el archivo .env desde env.example
	@echo "$(GREEN)Inicializando archivo .env...$(NC)"
	@if [ ! -f .env ]; then \
		cp env.example .env; \
		echo "$(GREEN)Archivo .env creado desde env.example$(NC)"; \
		echo "$(YELLOW)IMPORTANTE: Edita el archivo .env y configura CHAT_AES_KEY con una clave segura$(NC)"; \
	else \
		echo "$(YELLOW)Archivo .env ya existe. No se sobrescribió.$(NC)"; \
	fi 