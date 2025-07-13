# Go Chat - Aplicación de Chat en Tiempo Real

Una aplicación de chat en tiempo real construida con Go, WebSockets y una interfaz web moderna.

## 🚀 Características

- Chat en tiempo real con WebSockets
- Interfaz web moderna y responsiva
- Soporte para múltiples usuarios
- Indicador de estado en línea
- Diseño limpio y minimalista
- **Configuración segura** con archivo .env

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
├── env.example                 # Ejemplo de variables de entorno
├── setup.ps1                   # Script de configuración para Windows
├── setup.sh                    # Script de configuración para Unix/Linux
└── README.md                   # Este archivo
```

## 🛠️ Instalación

### Prerrequisitos

- Go 1.21 o superior
- Docker (opcional)
- Make (opcional, se instala automáticamente)

### Configuración Automática (Recomendado)

#### Windows
```powershell
# Ejecutar como administrador si es necesario
.\setup.ps1
```

#### Unix/Linux/macOS
```bash
# Hacer ejecutable y ejecutar
chmod +x setup.sh
./setup.sh

# O ejecutar directamente
bash setup.sh
```

### Instalación Manual

1. Clona el repositorio:
```bash
git clone <tu-repositorio>
cd go_chat
```

2. Crea el archivo de configuración:
```bash
# Copia el archivo de ejemplo
cp env.example .env

# Edita el archivo .env con tus configuraciones
# IMPORTANTE: Configura CHAT_AES_KEY con una clave segura
```

3. Ejecuta la aplicación:
```bash
go run cmd/server/main.go
```

4. Abre tu navegador en `http://localhost:8420`

### Instalación con Docker

1. Configura el archivo .env:
```bash
cp env.example .env
# Edita .env con tus configuraciones
```

2. Construye y ejecuta:
```bash
make docker-build
make docker-run
```

## 🔧 Configuración

### Archivo .env

La aplicación usa un archivo `.env` para la configuración. Este archivo **NO se sube al repositorio** por seguridad.

**Variables disponibles:**
- `CHAT_AES_KEY`: Clave AES de 32 caracteres para encriptación (requerida para producción)
- `PORT`: Puerto del servidor (opcional, por defecto 8420)
- `READ_TIMEOUT`: Timeout de lectura (opcional, por defecto 15s)
- `WRITE_TIMEOUT`: Timeout de escritura (opcional, por defecto 15s)
- `IDLE_TIMEOUT`: Timeout de inactividad (opcional, por defecto 60s)
- `SHUTDOWN_TIMEOUT`: Timeout de apagado (opcional, por defecto 15s)
- `DEBUG`: Modo debug (opcional, por defecto false)
- `LOG_LEVEL`: Nivel de logging (opcional, por defecto info)

### Generar Clave Segura

Para producción, genera una clave AES segura:

```bash
# Linux/macOS
openssl rand -hex 16

# Windows (PowerShell)
[System.Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(16))
```

## 🚀 Desarrollo

### Ejecutar en modo desarrollo

```bash
# Con Makefile (recomendado)
make run

# Directamente
go run cmd/server/main.go

# Con hot reload (requiere air)
make dev
```

### Construir para producción

```bash
make build
```

### Ejecutar tests

```bash
make test
```

### Comandos disponibles

```bash
make help              # Ver todos los comandos
make run               # Ejecutar aplicación
make dev               # Modo desarrollo con hot reload
make build             # Construir para producción
make clean             # Limpiar archivos generados
make test              # Ejecutar tests
make docker-build      # Construir imagen Docker
make docker-run        # Ejecutar con Docker
make format            # Formatear código
make lint              # Ejecutar linter
make env-init          # Inicializar archivo .env
```

## 🔒 Seguridad

### Desarrollo
- La aplicación genera automáticamente una clave AES para desarrollo
- No se requiere configuración previa
- El archivo `.env` está en `.gitignore` para proteger las claves

### Producción
- **IMPORTANTE**: Configura `CHAT_AES_KEY` con una clave de 32 caracteres
- Usa una clave segura y única para cada entorno
- El archivo `.env` nunca se sube al repositorio
- Ejemplo de clave segura: `openssl rand -hex 16`

### Protección de Claves
- ✅ Archivo `.env` en `.gitignore`
- ✅ Claves no hardcodeadas en el código
- ✅ Configuración flexible con variables de entorno
- ✅ Scripts de configuración seguros

## 📦 Dependencias

- `github.com/gorilla/websocket`: Para manejo de WebSockets
- `github.com/joho/godotenv`: Para cargar archivo .env
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