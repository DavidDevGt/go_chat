# Go Chat 🚀

**Chat en tiempo real, simple, seguro y listo para producción.**

---

Go Chat es una solución moderna de chat en tiempo real construida con Go y WebSockets. Ideal para proyectos que necesitan comunicación instantánea, escalabilidad y facilidad de despliegue.

## 🏆 Características principales

- Backend rápido en Go
- WebSockets nativos para baja latencia
- Interfaz web responsiva y minimalista
- Multiusuario y estado en línea
- Scripts de configuracion para Windows y Linux
- Listo para Docker y despliegue cloud

## 🚀 Instalación rápida

```bash
git clone https://github.com/DavidDevGt/go_chat.git
cd go_chat
cp env.example .env
# Edita .env y pon una clave segura en CHAT_AES_KEY
make run  # o: go run cmd/server/main.go
```
Abre [http://localhost:8420](http://localhost:8420) y ¡listo!

### Docker

```bash
cp env.example .env
make docker-build
make docker-run
```

## ⚙️ Configuración

- Todas las variables en `.env` (ver `env.example`)
- Clave AES de 32 caracteres para cifrado seguro
- `.env` nunca se sube al repo

## 🛠️ Personaliza y extiende

- Código modular y limpio (Go idiomático)
- Fácil de integrar autenticación, bases de datos, o lógica propia
- Frontend desacoplado: usa tu propio cliente si lo prefieres

## 📦 Stack TECH

- **Go** 1.21+
- **WebSockets** (gorilla/websocket)
- **HTML/CSS/JS** moderno
- **Docker** y Makefile para CI/CD

## 🧑‍💻 Para devs

- usen el makefile para tener Hot reload con [air](https://github.com/cosmtrek/air): `make dev`
- Linter, tests y formateo incluidos en Makefile

## 🔒 Seguridad

- Claves fuera del código
- `.env` en `.gitignore`
- AES-256 listo para producción

---
