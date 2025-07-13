# Go Chat - Aplicación de Chat en Tiempo Real

Una aplicación de chat en tiempo real construida con Go, WebSockets y una interfaz web moderna.

## 🚀 Características

- Chat en tiempo real con WebSockets
- Interfaz web moderna y responsiva
- Soporte para múltiples usuarios
- Indicador de estado en línea
- Diseño limpio y minimalista

## 📁 Estructura del Proyecto

```
go_chat/
├── cmd/
│   └── server/
│       └── main.go              # Punto de entrada de la aplicación
├── internal/
│   ├── client/
│   │   └── client.go            # Lógica del cliente WebSocket
│   ├── hub/
│   │   └── hub.go              # Gestión de conexiones y broadcasting
│   ├── websocket/
│   │   └── websocket.go        # Manejador de WebSocket
│   └── server/
│       └── server.go           # Configuración del servidor HTTP
├── pkg/
│   └── config/
│       └── config.go           # Configuración de la aplicación
├── web/
│   ├── static/
│   │   ├── css/
│   │   │   └── main.css        # Estilos de la aplicación
│   │   └── js/
│   │       └── main.js         # JavaScript del cliente
│   └── templates/
│       └── index.html          # Plantilla HTML principal
├── docker-compose.yml          # Configuración de Docker
├── Dockerfile                  # Imagen de Docker
├── go.mod                      # Dependencias de Go
├── go.sum                      # Checksums de dependencias
└── README.md                   # Este archivo
```

## 🛠️ Instalación

### Prerrequisitos

- Go 1.21 o superior
- Docker (opcional)

### Instalación Local

1. Clona el repositorio:
```bash
git clone <tu-repositorio>
cd go_chat
```

2. Configura la variable de entorno para la clave AES:
```bash
export CHAT_AES_KEY="tu-clave-de-32-caracteres-aqui"
```

3. Ejecuta la aplicación:
```bash
go run cmd/server/main.go
```

4. Abre tu navegador en `http://localhost:8420`

### Instalación con Docker

1. Construye la imagen:
```bash
docker build -t go-chat .
```

2. Ejecuta el contenedor:
```bash
docker run -p 8420:8420 -e CHAT_AES_KEY="tu-clave-de-32-caracteres-aqui" go-chat
```

## 🔧 Configuración

### Variables de Entorno

- `CHAT_AES_KEY`: Clave AES de 32 caracteres para encriptación (requerida)
- `PORT`: Puerto del servidor (opcional, por defecto 8420)

### Configuración del Servidor

Los valores de configuración se pueden modificar en `pkg/config/config.go`:

- `ServerPort`: Puerto del servidor
- `ReadTimeout`: Timeout de lectura
- `WriteTimeout`: Timeout de escritura
- `IdleTimeout`: Timeout de inactividad
- `ShutdownTimeout`: Timeout de apagado

## 🚀 Desarrollo

### Ejecutar en modo desarrollo

```bash
go run cmd/server/main.go
```

### Construir para producción

```bash
go build -o bin/server cmd/server/main.go
```

### Ejecutar tests

```bash
go test ./...
```

## 📦 Dependencias

- `github.com/gorilla/websocket`: Para manejo de WebSockets
- `golang.org/x/net`: Dependencia indirecta

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🐛 Reportar Bugs

Si encuentras algún bug, por favor abre un issue en el repositorio con:

- Descripción del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Información del sistema (OS, versión de Go, etc.) 