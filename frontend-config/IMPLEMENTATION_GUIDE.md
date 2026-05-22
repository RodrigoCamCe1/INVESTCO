# 🏗️ INVESTCO ERP FRONTEND - GUÍA DE IMPLEMENTACIÓN

## 📋 Índice
- [Descripción del Proyecto](#descripción-del-proyecto)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Instalación Automatizada](#instalación-automatizada)
- [Instalación Manual](#instalación-manual)
- [Estructura de Directorios](#estructura-de-directorios)
- [Convenciones y Mejores Prácticas](#convenciones-y-mejores-prácticas)
- [Variables de Entorno](#variables-de-entorno)
- [Comandos Disponibles](#comandos-disponibles)

---

## 📖 Descripción del Proyecto

**Investco ERP** es un **Sistema de Gestión y Control de Avance de Obras** para proyectos civiles e inmobiliarios en Bolivia.

### Características Principales:
- ✅ Gestión integral de proyectos y obras
- ✅ Control de budgets y gastos (con precisión decimal)
- ✅ Gestión de clientes y contratos
- ✅ Reportes y análisis en tiempo real
- ✅ Soporte para PWA (Progressive Web App)
- ✅ Funcionalidad offline con cola de sincronización
- ✅ Arquitectura enterprise-grade

---

## 🔧 Stack Tecnológico OBLIGATORIO

### Frontend:
- **Framework**: Next.js 15 (App Router)
- **Librería de UI**: React 19
- **Lenguaje**: TypeScript (modo estricto)
- **Estilos**: Tailwind CSS v4
- **Componentes**: shadcn/ui

### Manejo de Estado:
- **Servidor**: TanStack Query v5 (React Query)
- **Cliente**: Zustand
- **Offline**: IndexedDB + Zustand

### Formularios y Validación:
- **React Hook Form**
- **Zod** (esquemas de validación)

### Visualización de Datos:
- **Tablas**: TanStack Table v8
- **Gráficos**: Recharts

### Otros:
- **HTTP Client**: Axios
- **Precisión Decimal**: decimal.js
- **Fechas**: date-fns
- **Temas**: next-themes

---

## 🏛️ Arquitectura

### Principios de Diseño:

```
┌─────────────────────────────────────────────────────┐
│                  COMPONENTES (UI)                   │
│  - Componentes de presentación sin lógica           │
│  - Reutilizables y testeables                       │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                 CUSTOM HOOKS                        │
│  - useAuth(), usePreciseMath(), useOfflineQueue()  │
│  - Lógica reutilizable                              │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│          CAPA DE SERVICIOS (Services)               │
│  - Orquestación de datos                            │
│  - Llamadas a API                                   │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│          ESTADO GLOBAL (Stores)                     │
│  - Zustand (UI local state)                         │
│  - TanStack Query (servidor)                        │
│  - IndexedDB (datos offline)                        │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│          CAPA DE API (lib/api-client.ts)            │
│  - Cliente HTTP centralizado                        │
│  - Interceptores                                    │
│  - Manejo de errores                                │
└─────────────────────────────────────────────────────┘
```

### Estructura de Carpetas - Separación por Responsabilidad:

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas privadas: login, recuperar-password
│   ├── (dashboard)/       # Rutas autenticadas: dashboard, proyectos
│   ├── obra-mobile/       # PWA móvil optimizado
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
│
├── components/            # Componentes React
│   ├── ui/               # Componentes shadcn/ui base
│   ├── shared/           # Navbar, Sidebar, Layout compartidos
│   ├── forms/            # Formularios validados con Zod
│   └── charts/           # Gráficos personalizados (Recharts)
│
├── hooks/                 # Custom React Hooks
│   ├── useAuth.ts        # Autenticación y permisos
│   ├── usePreciseMath.ts # Operaciones financieras
│   └── useOfflineQueue.ts # Cola offline (PWA)
│
├── lib/                   # Librerías y utilidades
│   ├── api-client.ts     # Cliente Axios configurado
│   ├── decimal-utils.ts  # Cálculos financieros precisos
│   └── date-utils.ts     # Funciones de fecha (zona Bolivia)
│
├── providers/             # React Providers
│   ├── query-provider.tsx   # TanStack Query
│   ├── auth-provider.tsx    # Contexto de autenticación
│   └── index.tsx            # Agregador de providers
│
├── store/                 # Estado global (Zustand)
│   ├── ui-store.ts       # UI: sidebar, modales, filtros
│   ├── auth-store.ts     # Autenticación y tokens
│   └── offline-store.ts  # Cola offline con IndexedDB
│
├── types/                 # TypeScript Types
│   ├── api.ts            # Tipos de API y modelos
│   └── auth.ts           # Tipos de autenticación
│
├── services/              # Lógica de negocio
│   ├── projectService.ts
│   ├── clientService.ts
│   ├── contractService.ts
│   └── ...
│
├── utils/                 # Funciones utilitarias
│   ├── validators.ts
│   ├── formatters.ts
│   └── ...
│
├── constants/             # Constantes
│   ├── permissions.ts
│   ├── roles.ts
│   └── ...
│
├── middleware/            # Middleware y guards
│   ├── auth-middleware.ts
│   └── ...
│
└── styles/
    └── globals.css        # Estilos globales Tailwind
```

---

## 🚀 Instalación Automatizada

### Opción 1: Script Bash (Recomendado para Linux/macOS)

```bash
# 1. Hacer el script ejecutable
chmod +x setup-frontend.sh

# 2. Ejecutar el script
./setup-frontend.sh

# El script automaticamente:
# - Crea la estructura Next.js 15
# - Instala todas las dependencias
# - Configura Tailwind CSS v4
# - Instala componentes shadcn/ui
# - Crea la estructura de directorios
```

### Opción 2: Para Windows (PowerShell)

```powershell
# Si tienes WSL 2:
wsl bash setup-frontend.sh

# O ejecutar manualmente (ver Instalación Manual)
```

---

## 🔨 Instalación Manual

Si prefieres o necesitas hacerlo paso a paso:

### Paso 1: Crear proyecto Next.js 15

```bash
npx create-next-app@latest frontend \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --no-git \
  --import-alias '@/*'

cd frontend
```

### Paso 2: Instalar dependencias principales

```bash
# React y Next.js (actualizar a versiones específicas)
npm install next@15 react@19 react-dom@19

# Estado y queries
npm install @tanstack/react-query@5 zustand@4

# Formularios y validación
npm install react-hook-form@7 zod@3 @hookform/resolvers@3

# Tablas y gráficos
npm install @tanstack/react-table@8 recharts@2

# HTTP
npm install axios@1

# Otros
npm install decimal.js date-fns date-fns-tz next-themes
npm install class-variance-authority clsx tailwind-merge
```

### Paso 3: Instalar dependencias de desarrollo

```bash
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
  prettier
```

### Paso 4: Instalar shadcn/ui

```bash
npx shadcn-ui@latest init -d

# Instalar componentes base
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
# ... (ver script para lista completa)
```

### Paso 5: Copiar archivos de configuración

Copiar los siguientes archivos a tu proyecto:

```
next.config.ts          → ./
tsconfig.json          → ./
tailwind.config.ts     → ./
postcss.config.js      → ./
.env.example           → ./

lib/                    → ./src/
hooks/                  → ./src/
providers/              → ./src/
store/                  → ./src/
types/                  → ./src/
```

### Paso 6: Crear estructura de directorios

```bash
# Rutas autenticadas
mkdir -p src/app/\(auth\)/{login,recuperar-password}
mkdir -p src/app/\(dashboard\)/{inmuebles,planos,clientes,reservas,contratos,reportes,admin}
mkdir -p src/app/\(dashboard\)/proyectos/\[id\]

# Componentes
mkdir -p src/components/{ui,shared,forms,charts}

# Otros
mkdir -p src/services
mkdir -p src/utils
mkdir -p src/constants
mkdir -p src/middleware
```

### Paso 7: Variables de entorno

```bash
# Copiar template
cp .env.example .env.local

# Editar .env.local con tus valores:
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_TIMEZONE=America/La_Paz
# etc.
```

---

## 📁 Estructura de Directorios Final

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── recuperar-password/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── inmuebles/
│   │   │   │   └── page.tsx
│   │   │   ├── clientes/
│   │   │   │   └── page.tsx
│   │   │   ├── contratos/
│   │   │   │   └── page.tsx
│   │   │   ├── proyectos/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── reportes/
│   │   │   │   └── page.tsx
│   │   │   └── admin/
│   │   │       └── page.tsx
│   │   │
│   │   ├── obra-mobile/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── favicon.ico
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ... (shadcn/ui)
│   │   │
│   │   ├── shared/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Breadcrumbs.tsx
│   │   │
│   │   ├── forms/
│   │   │   ├── ProjectForm.tsx
│   │   │   ├── ClientForm.tsx
│   │   │   └── ContractForm.tsx
│   │   │
│   │   └── charts/
│   │       ├── BudgetChart.tsx
│   │       ├── ProgressChart.tsx
│   │       └── RevenueChart.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePreciseMath.ts
│   │   └── useOfflineQueue.ts
│   │
│   ├── lib/
│   │   ├── api-client.ts
│   │   ├── decimal-utils.ts
│   │   └── date-utils.ts
│   │
│   ├── providers/
│   │   ├── query-provider.tsx
│   │   ├── auth-provider.tsx
│   │   └── index.tsx
│   │
│   ├── store/
│   │   ├── ui-store.ts
│   │   ├── auth-store.ts
│   │   └── offline-store.ts
│   │
│   ├── types/
│   │   ├── api.ts
│   │   └── auth.ts
│   │
│   ├── services/
│   │   ├── projectService.ts
│   │   ├── clientService.ts
│   │   ├── contractService.ts
│   │   ├── propertyService.ts
│   │   └── reportService.ts
│   │
│   ├── utils/
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   └── helpers.ts
│   │
│   ├── constants/
│   │   ├── permissions.ts
│   │   ├── roles.ts
│   │   └── statuses.ts
│   │
│   ├── middleware/
│   │   ├── auth-middleware.ts
│   │   └── error-boundary.tsx
│   │
│   └── styles/
│       ├── globals.css
│       └── variables.css
│
├── public/
│   ├── favicon.ico
│   ├── apple-touch-icon.png
│   └── ...
│
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── package.json
├── .env.example
├── .env.local
├── .gitignore
├── .prettierrc
├── .eslintrc.json
└── README.md
```

---

## 🎨 Convenciones y Mejores Prácticas

### 1. **Componentes**

```typescript
// ✅ CORRECTO: Componente de servidor (por defecto)
export default function ProjectList() {
  const projects = await getProjects();
  return <div>{/* ... */}</div>;
}

// ✅ CORRECTO: Componente de cliente con 'use client'
"use client";
import { useEffect } from "react";

export function ProjectForm() {
  const [state, setState] = useState();
  return <form>{/* ... */}</form>;
}
```

### 2. **Custom Hooks**

```typescript
// ✅ CORRECTO: Hook prefijado con 'use'
export function useProjects() {
  const { data, isLoading } = useQuery(/* ... */);
  return { projects: data || [], isLoading };
}
```

### 3. **Types y Interfaces**

```typescript
// ✅ CORRECTO: Interfaz clara y bien nombrada
export interface Project {
  id: string;
  name: string;
  budget: string; // Usar string para Decimal
  status: ProjectStatus;
}

export type ProjectStatus = "planning" | "active" | "completed";
```

### 4. **Cálculos Financieros**

```typescript
// ❌ INCORRECTO: Usar números flotantes
const total = 100.1 + 100.2; // 200.30000000000003

// ✅ CORRECTO: Usar decimal-utils
import { sum, formatCurrency } from "@/lib/decimal-utils";
const total = sum(100.1, 100.2); // Decimal(200.3)
const display = formatCurrency(total); // "Bs. 200.30"
```

### 5. **Manejo de Fechas**

```typescript
// ✅ CORRECTO: Usar date-utils con zona horaria Bolivia
import { getNowInBolivia, formatDateTime } from "@/lib/date-utils";

const now = getNowInBolivia();
console.log(formatDateTime(now)); // "15/05/2026 14:30"
```

### 6. **API Calls**

```typescript
// ✅ CORRECTO: Usar apiClient centralizado
import { apiGet, apiPost } from "@/lib/api-client";

const projects = await apiGet<Project[]>("/projects");
const created = await apiPost<Project>("/projects", payload);
```

### 7. **Zustand Store**

```typescript
// ✅ CORRECTO: Store con persistencia
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useMyStore = create<State>()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }),
    { name: "my-store" }
  )
);
```

---

## 🔐 Variables de Entorno

### `.env.local` (NO COMPARTIR)

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Autenticación
NEXT_PUBLIC_LOGIN_URL=/auth/login
NEXT_PUBLIC_JWT_TOKEN_KEY=investco_token

# Localización
NEXT_PUBLIC_TIMEZONE=America/La_Paz
NEXT_PUBLIC_DEFAULT_LOCALE=es-BO

# Features
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_OFFLINE_QUEUE=true

# Debug
DEBUG=false
```

---

## 📦 Comandos Disponibles

### Desarrollo

```bash
# Servidor de desarrollo (puerto 3000)
npm run dev

# Con turbopack (más rápido)
npm run dev -- --turbo
```

### Construcción y Deploy

```bash
# Build para producción
npm run build

# Iniciar servidor de producción
npm start

# Build + Start
npm run build && npm start
```

### Linting y Formato

```bash
# TypeScript check
npm run type-check

# ESLint
npm run lint

# Format con Prettier
npm run format
```

### Testing (opcional, agregar después)

```bash
npm run test
npm run test:watch
npm run test:coverage
```

---

## 🔗 Conexión con Backend

### URL del Backend NestJS

```
http://localhost:3001
```

### Endpoints Principales

```
POST   /auth/login
POST   /auth/logout
GET    /auth/me
POST   /api/projects
GET    /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id
```

---

## ⚠️ Puntos Importantes

1. **Modo Estricto TypeScript**: `strict: true` - Resolver todos los errores TS
2. **Precisión Decimal**: SIEMPRE usar `decimal.js` para cálculos monetarios
3. **Zona Horaria**: Bolivia es UTC-4, usar `date-fns-tz` para conversiones
4. **Autenticación**: Token JWT almacenado en `localStorage` con refresh
5. **PWA**: Funcionalidad offline con `IndexedDB` + cola de sincronización
6. **Componentes**: Preferir Server Components, usar `"use client"` solo cuando sea necesario

---

## 🆘 Troubleshooting

### Error: "Cannot find module '@/lib/api-client'"

→ Asegúrate que `tsconfig.json` tiene las rutas configuradas correctamente

### Error: "SyntaxError: Unexpected token <"

→ Probablemente estés importando un componente que necesita `"use client"`

### Next.js no detecta cambios

→ Reinicia el servidor: `Ctrl+C` y ejecuta `npm run dev` nuevamente

---

## 📚 Recursos Adicionales

- [Next.js 15 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

---

## 👥 Contribuciones

Seguir las convenciones establecidas en este documento.

**Versión**: 1.0.0  
**Última actualización**: 22 de mayo de 2026  
**Timezone**: America/La_Paz (Bolivia)
