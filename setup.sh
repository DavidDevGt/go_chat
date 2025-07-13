#!/bin/bash

# Script de configuración para Go Chat
# Ejecutar con: bash setup.sh

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Configurando entorno de desarrollo para Go Chat...${NC}"

# Verificar si Go está instalado
if command -v go &> /dev/null; then
    GO_VERSION=$(go version)
    echo -e "${GREEN}✅ Go encontrado: $GO_VERSION${NC}"
else
    echo -e "${RED}❌ Go no está instalado. Por favor instala Go desde https://golang.org/dl/${NC}"
    exit 1
fi

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}🔧 Creando archivo .env desde env.example...${NC}"
    cp env.example .env
    echo -e "${GREEN}✅ Archivo .env creado${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANTE: Edita el archivo .env y configura CHAT_AES_KEY con una clave segura${NC}"
    echo -e "${CYAN}💡 Puedes generar una clave segura con: openssl rand -hex 16${NC}"
else
    echo -e "${GREEN}✅ Archivo .env ya existe${NC}"
fi

# Instalar dependencias
echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
go mod download

# Verificar que todo funciona
echo -e "${YELLOW}🧪 Probando la aplicación...${NC}"
if go run cmd/server/main.go --help &>/dev/null; then
    echo -e "${GREEN}✅ Aplicación compila correctamente${NC}"
else
    echo -e "${RED}❌ Error compilando la aplicación${NC}"
    exit 1
fi

# Verificar si make está disponible
if command -v make &> /dev/null; then
    echo -e "${GREEN}✅ Make encontrado${NC}"
else
    echo -e "${YELLOW}⚠️  Make no está instalado. Instalando...${NC}"
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y make
    elif command -v yum &> /dev/null; then
        sudo yum install -y make
    elif command -v brew &> /dev/null; then
        brew install make
    else
        echo -e "${RED}❌ No se pudo instalar make automáticamente${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 ¡Configuración completada!${NC}"
echo ""
echo -e "${CYAN}📋 Comandos disponibles:${NC}"
echo -e "${WHITE}  go run cmd/server/main.go    - Ejecutar aplicación${NC}"
echo -e "${WHITE}  make run                     - Ejecutar con Makefile${NC}"
echo -e "${WHITE}  make dev                     - Modo desarrollo con hot reload${NC}"
echo -e "${WHITE}  make docker-build            - Construir imagen Docker${NC}"
echo -e "${WHITE}  make docker-run              - Ejecutar con Docker${NC}"
echo ""
echo -e "${CYAN}🌐 La aplicación estará disponible en: http://localhost:8420${NC}"
echo ""
echo -e "${YELLOW}🔒 Seguridad:${NC}"
echo -e "${WHITE}  - El archivo .env contiene las variables de configuración${NC}"
echo -e "${WHITE}  - Edita .env para configurar CHAT_AES_KEY con una clave segura${NC}"
echo -e "${WHITE}  - El archivo .env está en .gitignore para proteger las claves${NC}" 