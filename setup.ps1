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

# Configurar variable de entorno CHAT_AES_KEY
$aesKey = "12345678901234567890123456789012"
Write-Host "🔑 Configurando variable de entorno CHAT_AES_KEY..." -ForegroundColor Yellow

try {
    [Environment]::SetEnvironmentVariable("CHAT_AES_KEY", $aesKey, "User")
    Write-Host "✅ Variable CHAT_AES_KEY configurada correctamente" -ForegroundColor Green
} catch {
    Write-Host "⚠️  No se pudo configurar la variable de entorno. Configurando temporalmente..." -ForegroundColor Yellow
    $env:CHAT_AES_KEY = $aesKey
}

# Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
go mod download

# Verificar que todo funciona
Write-Host "🧪 Probando la aplicación..." -ForegroundColor Yellow
try {
    $env:CHAT_AES_KEY = $aesKey
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
Write-Host "⚠️  Para producción, cambia la clave AES en la variable de entorno CHAT_AES_KEY" -ForegroundColor Yellow 