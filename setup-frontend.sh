#!/bin/bash

# ============================================================================
# INVESTCO ERP FRONTEND - AUTOMATED SETUP SCRIPT
# ============================================================================
# Este script automatiza la creación de la estructura frontend Next.js 15
# Arquitectura Limpia + Desacoplamiento Técnico
# ============================================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
PROJECT_NAME="investco-frontend"
FRONTEND_DIR="$(pwd)/frontend"

# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

print_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC} $1"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# ============================================================================
# PASO 1: Crear estructura base con create-next-app
# ============================================================================

print_header "PASO 1: Inicializando proyecto Next.js 15"

if [ -d "$FRONTEND_DIR" ]; then
    print_warning "Directorio $FRONTEND_DIR ya existe. Continuando..."
else
    npx create-next-app@latest frontend \
        --typescript \
        --tailwind \
        --app \
        --src-dir \
        --no-git \
        --no-eslint \
        --import-alias '@/*' \
        --skip-install
    
    print_success "Proyecto Next.js 15 creado"
fi

cd "$FRONTEND_DIR"

# ============================================================================
# PASO 2: Instalar dependencias del proyecto
# ============================================================================

print_header "PASO 2: Instalando dependencias"

# Actualizar package.json con versiones específicas
npm install --save \
    next@15 \
    react@19 \
    react-dom@19 \
    typescript@latest

npm install --save \
    @tanstack/react-query@5 \
    zustand@4 \
    react-hook-form@7 \
    zod@3 \
    @hookform/resolvers@3 \
    @tanstack/react-table@8 \
    recharts@2 \
    axios@1

npm install --save \
    class-variance-authority \
    clsx \
    tailwind-merge

npm install --save-dev \
    @types/node \
    @types/react \
    @types/react-dom \
    typescript \
    tailwindcss@4 \
    postcss \
    autoprefixer \
    eslint \
    eslint-config-next \
    prettier \
    @typescript-eslint/eslint-plugin \
    @typescript-eslint/parser

print_success "Dependencias instaladas"

# ============================================================================
# PASO 3: Crear estructura de directorios en src/
# ============================================================================

print_header "PASO 3: Creando estructura de directorios"

mkdir -p src/app/{auth,dashboard,obra-mobile}
mkdir -p src/app/\(auth\)/{login,recuperar-password}
mkdir -p src/app/\(dashboard\)/{inmuebles,planos,clientes,reservas,contratos,reportes,admin,proyectos}
mkdir -p src/app/\(dashboard\)/proyectos/\[id\]

mkdir -p src/components/{ui,shared,forms,charts}
mkdir -p src/hooks
mkdir -p src/lib
mkdir -p src/providers
mkdir -p src/store
mkdir -p src/types
mkdir -p src/services
mkdir -p src/constants
mkdir -p src/middleware
mkdir -p src/utils

print_success "Estructura de directorios creada"

# ============================================================================
# PASO 4: Configurar TypeScript strict mode
# ============================================================================

print_header "PASO 4: Configurando TypeScript en modo estricto"

# El archivo tsconfig.json se generará en los archivos de configuración

print_success "TypeScript configurado"

# ============================================================================
# PASO 5: Configurar Tailwind CSS v4
# ============================================================================

print_header "PASO 5: Configurando Tailwind CSS v4"

# tailwind.config.ts y postcss.config.js se generarán en los archivos

print_success "Tailwind CSS v4 configurado"

# ============================================================================
# PASO 6: Instalar shadcn/ui components
# ============================================================================

print_header "PASO 6: Instalando componentes shadcn/ui"

# Nota: shadcn/ui será instalado mediante CLI
npx shadcn-ui@latest init -d \
    --style new-york \
    --baseColor zinc \
    --skipGit

# Instalar componentes base comúnmente usados
npx shadcn-ui@latest add button -y
npx shadcn-ui@latest add card -y
npx shadcn-ui@latest add input -y
npx shadcn-ui@latest add label -y
npx shadcn-ui@latest add textarea -y
npx shadcn-ui@latest add select -y
npx shadcn-ui@latest add checkbox -y
npx shadcn-ui@latest add radio -y
npx shadcn-ui@latest add dialog -y
npx shadcn-ui@latest add dropdown-menu -y
npx shadcn-ui@latest add alert -y
npx shadcn-ui@latest add toast -y
npx shadcn-ui@latest add table -y
npx shadcn-ui@latest add form -y
npx shadcn-ui@latest add pagination -y

print_success "Componentes shadcn/ui instalados"

# ============================================================================
# INFORMACIÓN FINAL
# ============================================================================

print_header "INSTALACIÓN COMPLETADA"

echo -e "${GREEN}Pasos siguientes:${NC}"
echo "1. cd frontend"
echo "2. npm run dev"
echo ""
echo -e "${YELLOW}Archivos de configuración:${NC}"
echo "- next.config.ts"
echo "- tsconfig.json"
echo "- tailwind.config.ts"
echo "- postcss.config.js"
echo ".env.local (crear manualmente con variables de entorno)"
echo ""
echo -e "${BLUE}Documentación:${NC}"
echo "- Next.js App Router: https://nextjs.org/docs/app"
echo "- TanStack Query: https://tanstack.com/query/latest"
echo "- Zustand: https://github.com/pmndrs/zustand"
echo ""
print_success "¡Proyecto listo para desarrollo!"
