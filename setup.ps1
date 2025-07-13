# Script de configuración para Go Chat
# Ejecutar como administrador si es necesario

Write-Host "🚀 Configurando entorno de desarrollo para Go Chat..." -ForegroundColor Green

# Verificar si Go está instalado
try {
    $goVersion = go version
    Write-Host "✅ Go encontrado: $goVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Go no está instalado. Por favor instala Go desde https://golang.org/dl/" -ForegroundColor Red
    exit 1
}

# Crear archivo .env si no existe
if (-not (Test-Path ".env")) {
    Write-Host "🔧 Creando archivo .env desde env.example..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "✅ Archivo .env creado" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANTE: Edita el archivo .env y configura CHAT_AES_KEY con una clave segura" -ForegroundColor Yellow
    Write-Host "💡 Puedes generar una clave segura con: openssl rand -hex 16" -ForegroundColor Cyan
} else {
    Write-Host "✅ Archivo .env ya existe" -ForegroundColor Green
}

# Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
go mod download

# Verificar que todo funciona
Write-Host "🧪 Probando la aplicación..." -ForegroundColor Yellow
try {
    go run cmd/server/main.go --help 2>$null
    Write-Host "✅ Aplicación compila correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error compilando la aplicación" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 ¡Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Comandos disponibles:" -ForegroundColor Cyan
Write-Host "  go run cmd/server/main.go    - Ejecutar aplicación" -ForegroundColor White
Write-Host "  make run                     - Ejecutar con Makefile" -ForegroundColor White
Write-Host "  make dev                     - Modo desarrollo con hot reload" -ForegroundColor White
Write-Host "  make docker-build            - Construir imagen Docker" -ForegroundColor White
Write-Host "  make docker-run              - Ejecutar con Docker" -ForegroundColor White
Write-Host ""
Write-Host "🌐 La aplicación estará disponible en: http://localhost:8420" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔒 Seguridad:" -ForegroundColor Yellow
Write-Host "  - El archivo .env contiene las variables de configuración" -ForegroundColor White
Write-Host "  - Edita .env para configurar CHAT_AES_KEY con una clave segura" -ForegroundColor White
Write-Host "  - El archivo .env está en .gitignore para proteger las claves" -ForegroundColor White 