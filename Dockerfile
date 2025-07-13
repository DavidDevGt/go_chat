# 1) Builder: compila el binario Go
FROM golang:1.21-alpine AS builder

# Instala certificados root (si hace HTTPS)
RUN apk add --no-cache ca-certificates

WORKDIR /app

# Trae sólo go.mod y go.sum first para cachear dependencias
COPY go.mod go.sum ./
RUN go mod download

# Copia el resto del código
COPY . .

# Compila un binario estático y optimizado
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" \
    -o chat_server ./cmd/server

# 2) Imagen final: ligera, solo con el binario
FROM alpine:latest
RUN apk add --no-cache ca-certificates

WORKDIR /root/

# Copia el binario del builder
COPY --from=builder /app/chat_server .

# Expone el puerto WS
EXPOSE 8420

# Comando por defecto
CMD ["./chat_server"]
