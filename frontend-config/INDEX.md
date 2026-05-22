# 📦 INVESTCO ERP FRONTEND - ÍNDICE COMPLETO DE ARCHIVOS GENERADOS

**Fecha**: 22 de Mayo de 2026  
**Versión**: 1.0.0  
**Stack**: Next.js 15 + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui

---

## 📋 Resumen Ejecutivo

Se ha creado una **estructura enterprise-grade** completa para el frontend Investco ERP con:
- ✅ Configuración Next.js 15 con App Router
- ✅ TypeScript en modo estricto
- ✅ Arquitectura limpia con desacoplamiento técnico
- ✅ Gestión de estado con Zustand + TanStack Query
- ✅ Utilidades financieras con precisión decimal
- ✅ Soporte para PWA con funcionalidad offline
- ✅ Manejo de autenticación JWT
- ✅ Validación de formularios con Zod + React Hook Form

---

## 📁 ARCHIVOS GENERADOS

### 🔧 CONFIGURACIÓN Y SETUP

#### 1. **setup-frontend.sh**
- **Ubicación**: Raíz del proyecto
- **Descripción**: Script Bash automatizado que configura toda la estructura
- **Uso**: `bash setup-frontend.sh` o `chmod +x setup-frontend.sh && ./setup-frontend.sh`
- **Automatiza**:
  - Creación de proyecto Next.js 15
  - Instalación de todas las dependencias
  - Creación de estructura de directorios
  - Configuración de Tailwind CSS
  - Instalación de componentes shadcn/ui

---

### ⚙️ CONFIGURACIÓN DEL PROYECTO

#### 2. **next.config.ts**
- **Ubicación**: Raíz del proyecto `./next.config.ts`
- **Descripción**: Configuración completa de Next.js 15
- **Características**:
  - Headers de seguridad
  - Optimizaciones de webpack
  - Reescrituras de API
  - Manejo de imágenes
  - Variables de entorno

#### 3. **tsconfig.json**
- **Ubicación**: Raíz del proyecto `./tsconfig.json`
- **Descripción**: Configuración TypeScript en modo ESTRICTO
- **Características**:
  - `strict: true`
  - Path aliases configurados
  - TypeScript 5+ con características modernas

#### 4. **tailwind.config.ts**
- **Ubicación**: Raíz del proyecto `./tailwind.config.ts`
- **Descripción**: Configuración de Tailwind CSS v4
- **Características**:
  - Colores personalizados (brand, status, neutral)
  - Tipografía escalable
  - Paleta de z-index estructurada
  - Animaciones personalizadas
  - Dark mode support

#### 5. **postcss.config.js**
- **Ubicación**: Raíz del proyecto `./postcss.config.js`
- **Descripción**: Configuración de PostCSS para Tailwind
- **Características**: Integración con Tailwind nesting

#### 6. **.env.example**
- **Ubicación**: Raíz del proyecto `./.env.example`
- **Descripción**: Template de variables de entorno
- **Instrucción**: Copiar a `.env.local` y editar valores
- **Contiene**:
  - URL de API backend
  - Zona horaria Bolivia
  - Feature flags
  - Configuraciones de integración

#### 7. **package.json.template**
- **Ubicación**: `./frontend-config/package.json.template`
- **Descripción**: Template con todas las dependencias correctas
- **Nota**: Se sobrescribe automaticamente con `create-next-app`

---

### 📄 ARCHIVOS DE APLICACIÓN (src/)

#### 8. **src/app/layout.tsx**
- **Ubicación**: `src/app/layout.tsx`
- **Descripción**: Root layout de la aplicación
- **Características**:
  - Meta tags SEO
  - PWA configuration
  - Providers wrapper
  - Metadata Next.js 15

#### 9. **src/app/page.tsx**
- **Ubicación**: `src/app/page.tsx`
- **Descripción**: Home page / Landing page
- **Características**: Página de bienvenida con links a login

---

### 🔐 PROVIDERS (Contexto y Configuración Global)

#### 10. **src/providers/index.tsx**
- **Ubicación**: `src/providers/index.tsx`
- **Descripción**: Agregador de todos los providers
- **Orden de aplicación**:
  1. ThemeProvider (next-themes)
  2. QueryProvider (TanStack Query)
  3. AuthProvider (Autenticación)

#### 11. **src/providers/query-provider.tsx**
- **Ubicación**: `src/providers/query-provider.tsx`
- **Descripción**: Proveedor de TanStack Query v5
- **Características**:
  - Configuración de caché (5 min stale, 10 min gc)
  - Reintentos automáticos
  - React Query DevTools
  - Optimizaciones para datos del servidor

#### 12. **src/providers/auth-provider.tsx**
- **Ubicación**: `src/providers/auth-provider.tsx`
- **Descripción**: Proveedor de autenticación
- **Características**:
  - Inicialización de sesión
  - Lectura de token del localStorage
  - Sincronización con IndexedDB

---

### 🪝 CUSTOM HOOKS

#### 13. **src/hooks/useAuth.ts**
- **Ubicación**: `src/hooks/useAuth.ts`
- **Descripción**: Hook centralizado de autenticación
- **Proporciona**:
  - Estado de usuario y token
  - Métodos `login()` y `logout()`
  - Verificación de roles y permisos
  - `hasPermission()`, `hasAnyPermission()`, `hasAllPermissions()`
- **Usa**: TanStack Query + Zustand

#### 14. **src/hooks/usePreciseMath.ts**
- **Ubicación**: `src/hooks/usePreciseMath.ts`
- **Descripción**: Hook para operaciones financieras con precisión
- **Proporciona**: Acceso a todas las funciones de `decimal-utils`
- **Memoizado**: Para optimización de renderizados

#### 15. **src/hooks/useOfflineQueue.ts**
- **Ubicación**: `src/hooks/useOfflineQueue.ts`
- **Descripción**: Hook para gestión de cola offline (PWA)
- **Proporciona**:
  - Estado de conexión (online/offline)
  - Métodos `enqueueRequest()`, `retrySync()`
  - Sincronización automática cuando hay conexión

---

### 📚 LIBRERÍAS Y UTILIDADES (lib/)

#### 16. **src/lib/api-client.ts**
- **Ubicación**: `src/lib/api-client.ts`
- **Descripción**: Cliente HTTP centralizado (Axios)
- **Características**:
  - Patrón Singleton
  - Inyección automática de JWT en headers
  - Interceptores de request/response
  - Manejo centralizado de errores 401, 403, 500+
  - Helpers: `apiGet`, `apiPost`, `apiPut`, `apiDelete`, `apiPatch`
- **Uso**: `import { apiClient, apiGet, apiPost } from "@/lib/api-client"`

#### 17. **src/lib/decimal-utils.ts**
- **Ubicación**: `src/lib/decimal-utils.ts`
- **Descripción**: Utilidades para cálculos financieros precisos
- **Características**:
  - Usa `decimal.js` (NO números flotantes)
  - Operaciones: suma, resta, multiplicación, división
  - Manejo de porcentajes
  - Formateo de moneda (Bolivianos Bs.)
  - Cálculos de IVA (13% Bolivia)
  - Precisión: 20 decimales, redondeo HALF_UP
- **Funciones principales**:
  - `sum()`, `subtract()`, `multiply()`, `divide()`
  - `calculatePercentage()`, `applyPercentage()`, `removePercentage()`
  - `formatCurrency()`, `withIVA()`, `extractIVA()`
  - `toFixed()`, `compare()`, `isZero()`, `isNegative()`, `isPositive()`

#### 18. **src/lib/date-utils.ts**
- **Ubicación**: `src/lib/date-utils.ts`
- **Descripción**: Utilidades para manejo de fechas con zona Bolivia
- **Características**:
  - Zona horaria: `America/La_Paz` (UTC-4)
  - Usa `date-fns` + `date-fns-tz`
  - Locale: es-BO (Español - Bolivia)
- **Funciones principales**:
  - `getNowInBolivia()`, `toBoliviaTime()`, `toUTC()`
  - `formatShortDate()`, `formatLongDate()`, `formatDateTime()`
  - `formatRelative()` (relativo: "Hace 2 horas", "Ayer")
  - Diferencias: `getDaysDifference()`, `getHoursDifference()`
  - Rangos: `getMonthRange()`, `getYearRange()`
  - Utilidades: `getWeekNumber()`, `getAge()`, `isWeekend()`

---

### 📦 ESTADO GLOBAL (Zustand Stores)

#### 19. **src/store/ui-store.ts**
- **Ubicación**: `src/store/ui-store.ts`
- **Descripción**: Store de estado de UI local
- **Estado manejado**:
  - Layout: `sidebarOpen`, `mobileMenuOpen`, `darkMode`
  - Modales: `confirmDialog`, `formModal`
  - Toasts/Notificaciones
  - Filtros dinámicos
  - Paginación: página actual, tamaño de página
- **Persistencia**: localStorage
- **Acciones**: `toggleSidebar()`, `addToast()`, `setFilter()`, etc.

#### 20. **src/store/auth-store.ts**
- **Ubicación**: `src/store/auth-store.ts`
- **Descripción**: Store de autenticación y tokens
- **Estado manejado**:
  - Usuario actual
  - Access token + Refresh token
  - Estado de inicialización
  - Flag de autenticado
- **Persistencia**: localStorage (solo tokens, no datos sensibles)
- **Métodos**: `setUser()`, `setToken()`, `logout()`, `initializeAuth()`

#### 21. **src/store/offline-store.ts**
- **Ubicación**: `src/store/offline-store.ts`
- **Descripción**: Store para cola offline (PWA)
- **Estado manejado**:
  - Cola de peticiones pendientes
  - Estado de conexión
  - Reintentos y estado de sincronización
- **Persistencia**: IndexedDB (con fallback a localStorage)
- **Métodos**: `addRequest()`, `removeRequest()`, `setIsOnline()`, `clearQueue()`

---

### 🏷️ TIPOS Y INTERFACES

#### 22. **src/types/auth.ts**
- **Ubicación**: `src/types/auth.ts`
- **Descripción**: Tipos compartidos de autenticación
- **Contiene**:
  - `AuthUser`, `LoginCredentials`, `LoginResponse`
  - `JWTPayload`, `TokenPair`
  - `UserRole`, `Permission` (enums de tipos)
  - `UserProfile`, `UserPreferences`
  - `AuthError`, `AuthErrorCode`
  - Interfaces para signup, forgot password, reset password

#### 23. **src/types/api.ts**
- **Ubicación**: `src/types/api.ts`
- **Descripción**: Tipos compartidos de API y modelos del ERP
- **Contiene**:
  - Respuestas genéricas: `ApiResponse<T>`, `PaginatedResponse<T>`
  - Modelos del ERP:
    - `Project` (Proyectos)
    - `Client` (Clientes)
    - `Contract` (Contratos)
    - `Property` (Inmuebles)
    - `Report` (Reportes)
  - Tipos de estado: `ProjectStatus`, `ContractStatus`, `ClientStatus`
  - Request bodies y response bodies
  - Paginación: `PaginationParams`, `FilterParams`

---

### 📖 DOCUMENTACIÓN

#### 24. **IMPLEMENTATION_GUIDE.md**
- **Ubicación**: `./frontend-config/IMPLEMENTATION_GUIDE.md`
- **Descripción**: Guía COMPLETA de implementación (15 páginas)
- **Contenidos**:
  - Descripción del proyecto
  - Stack tecnológico detallado
  - Arquitectura y principios de diseño
  - **Instalación paso a paso** (automatizada y manual)
  - Estructura de directorios completa
  - Convenciones de código
  - Variables de entorno
  - Comandos disponibles
  - Troubleshooting

#### 25. **QUICK_REFERENCE.md**
- **Ubicación**: `./frontend-config/QUICK_REFERENCE.md`
- **Descripción**: Referencia rápida para desarrolladores
- **Contenidos**:
  - Iniciar desarrollo en 3 pasos
  - Ejemplos de código (8 ejemplos completos)
  - Rutas de navegación
  - Comandos útiles
  - Checklist de configuración
  - Errores comunes y soluciones

#### 26. **Este Archivo - INDEX**
- **Ubicación**: `./frontend-config/INDEX.md`
- **Descripción**: Índice completo de archivos generados

---

## 🗺️ MAPA DE ARCHIVOS POR UBICACIÓN

### Raíz del Proyecto
```
frontend/
├── setup-frontend.sh         ← Script automatizado
├── next.config.ts            ← Configuración Next.js
├── tsconfig.json             ← Configuración TypeScript
├── tailwind.config.ts        ← Configuración Tailwind
├── postcss.config.js         ← Configuración PostCSS
├── .env.example              ← Template variables entorno
└── package.json              ← Dependencias
```

### Configuración y Documentación
```
frontend-config/
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── .env.example
├── package.json.template
├── IMPLEMENTATION_GUIDE.md
├── QUICK_REFERENCE.md
└── INDEX.md                  ← Este archivo
```

### Archivos de Aplicación
```
src/
├── app/
│   ├── layout.tsx
│   └── page.tsx
│
├── providers/
│   ├── index.tsx
│   ├── query-provider.tsx
│   └── auth-provider.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── usePreciseMath.ts
│   └── useOfflineQueue.ts
│
├── lib/
│   ├── api-client.ts
│   ├── decimal-utils.ts
│   └── date-utils.ts
│
├── store/
│   ├── ui-store.ts
│   ├── auth-store.ts
│   └── offline-store.ts
│
└── types/
    ├── auth.ts
    └── api.ts
```

---

## 🚀 CÓMO USAR ESTOS ARCHIVOS

### Opción 1: Automatizada (Recomendada)

```bash
# 1. Ubicarse en el directorio raíz del proyecto
cd /path/to/INVESTCO

# 2. Ejecutar el script
bash setup-frontend.sh

# 3. Esperar a que termine (toma ~5-10 minutos)
# El script automáticamente:
# - Crea estructura Next.js
# - Instala todas las dependencias
# - Configura Tailwind CSS
# - Instala componentes shadcn/ui
# - Crea estructura de directorios

# 4. Copiar archivos de configuración
# Los archivos en frontend-config/ ir a frontend/src/

# 5. Iniciar desarrollo
cd frontend
npm run dev
```

### Opción 2: Manual (Paso a Paso)

```bash
# Ver IMPLEMENTATION_GUIDE.md para instrucciones detalladas
# La guía incluye:
# - Creación manual de proyecto
# - Instalación de dependencias
# - Copia de archivos
# - Configuración paso a paso
```

### Opción 3: Solo Copiar Archivos

Si ya tienes un proyecto Next.js configurado:

```bash
# 1. Copiar archivos de configuración a raíz
cp frontend-config/next.config.ts frontend/
cp frontend-config/tsconfig.json frontend/
cp frontend-config/tailwind.config.ts frontend/
cp frontend-config/postcss.config.js frontend/
cp frontend-config/.env.example frontend/

# 2. Copiar archivos de src/
cp frontend-config/src-* frontend/src/

# 3. Instalar dependencias faltantes
cd frontend
npm install decimal.js date-fns date-fns-tz
```

---

## 📊 RESUMEN DE CONTENIDO

| Categoría | Cantidad | Archivos |
|-----------|----------|----------|
| Configuración | 6 | next.config.ts, tsconfig.json, tailwind.config.ts, etc. |
| App (React) | 2 | app/layout.tsx, app/page.tsx |
| Providers | 3 | query-provider, auth-provider, index |
| Hooks | 3 | useAuth, usePreciseMath, useOfflineQueue |
| Librerías | 3 | api-client, decimal-utils, date-utils |
| Stores | 3 | ui-store, auth-store, offline-store |
| Tipos | 2 | auth.ts, api.ts |
| Documentación | 3 | IMPLEMENTATION_GUIDE, QUICK_REFERENCE, este INDEX |
| **TOTAL** | **28** | **Archivos + 1 Script** |

---

## ✅ CHECKLIST DE VALIDACIÓN

Después de copiar/ejecutar los archivos:

- [ ] `npm install` ejecutado sin errores
- [ ] `.env.local` creado con valores correctos
- [ ] `npm run type-check` sin errores
- [ ] `npm run lint` sin errores críticos
- [ ] `npm run dev` inicia sin errores
- [ ] http://localhost:3000 abre correctamente
- [ ] TypeScript detecta todas las rutas en `tsconfig.json`
- [ ] Tailwind CSS estilos aplicados correctamente
- [ ] Backend (NestJS) está corriendo en puerto 3001
- [ ] JWT token se envía correctamente en headers

---

## 🔗 PRÓXIMOS PASOS RECOMENDADOS

1. **Ejecutar script de setup**: `bash setup-frontend.sh`
2. **Copiar archivos de infraestructura**: Los archivos en `src/`
3. **Crear páginas de autenticación**: 
   - `src/app/(auth)/login/page.tsx`
   - `src/app/(auth)/recuperar-password/page.tsx`
4. **Crear páginas de dashboard**:
   - `src/app/(dashboard)/page.tsx` (inicio)
   - `src/app/(dashboard)/inmuebles/page.tsx`
   - etc.
5. **Implementar componentes**: 
   - Navbar, Sidebar, Breadcrumbs
   - Forms validados
   - Tablas con TanStack Table
6. **Crear servicios**: 
   - `src/services/projectService.ts`
   - `src/services/clientService.ts`
   - etc.

---

## 📞 SOPORTE Y REFERENCIAS

### Documentación Interna
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Guía completa
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Referencia rápida

### Documentación Externa
- [Next.js 15](https://nextjs.org/docs) - Framework
- [React 19](https://react.dev) - Librería UI
- [TypeScript 5](https://www.typescriptlang.org/docs/) - Lenguaje
- [Tailwind CSS 4](https://tailwindcss.com) - Estilos
- [shadcn/ui](https://ui.shadcn.com) - Componentes
- [TanStack Query](https://tanstack.com/query/latest) - Estado servidor
- [Zustand](https://github.com/pmndrs/zustand) - Estado cliente
- [React Hook Form](https://react-hook-form.com) - Formularios
- [Zod](https://zod.dev) - Validación
- [Decimal.js](https://mikemcl.github.io/decimal.js/) - Precisión decimal
- [date-fns](https://date-fns.org) - Manejo de fechas

---

## 📝 NOTAS IMPORTANTES

1. **Modo Estricto TypeScript**: Todos los errores TS deben resolverse
2. **Precisión Financiera**: NUNCA usar `number` para dinero, usar `Decimal` siempre
3. **Zona Horaria**: Bolivia es `America/La_Paz` (UTC-4), no cambiar
4. **PWA**: Funcionalidad offline configurada con IndexedDB
5. **Autenticación**: JWT tokens almacenados en localStorage
6. **CORS**: Configurar en backend para permitir http://localhost:3000

---

## 🔐 Seguridad

✅ **Implementado**:
- Headers de seguridad en next.config.ts
- JWT en Authorization headers
- Validación con Zod
- TypeScript strict mode
- CORS configurado
- Manejo de errores 401/403

⚠️ **Verificar en Backend**:
- CORS permitir http://localhost:3000
- Endpoints autenticados requieran JWT
- Rate limiting implementado
- Refresh token endpoint disponible

---

## 🎯 ARQUITECTURA FINAL

```
┌─────────────────────────────────────────────────────────┐
│        INVESTCO ERP FRONTEND - ARQUITECTURA LIMPIA      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────┐        │
│  │         COMPONENTES (React 19)               │        │
│  │  - Server Components (por defecto)          │        │
│  │  - Client Components ("use client")         │        │
│  │  - Componentes UI (shadcn/ui)               │        │
│  └────────────┬────────────────────────────────┘        │
│               │                                           │
│  ┌────────────▼────────────────────────────────┐        │
│  │  CUSTOM HOOKS + ESTADO LOCAL                │        │
│  │  - useAuth(), usePreciseMath()              │        │
│  │  - useOfflineQueue()                        │        │
│  │  - Zustand (useUIStore, useAuthStore)      │        │
│  └────────────┬────────────────────────────────┘        │
│               │                                           │
│  ┌────────────▼────────────────────────────────┐        │
│  │  CAPAS DE NEGOCIO                          │        │
│  │  - Services (projectService.ts, etc.)       │        │
│  │  - TanStack Query (caching, sync)           │        │
│  │  - React Hook Form + Zod (validación)      │        │
│  └────────────┬────────────────────────────────┘        │
│               │                                           │
│  ┌────────────▼────────────────────────────────┐        │
│  │  CLIENTE API CENTRALIZADO                  │        │
│  │  - Axios con interceptores                 │        │
│  │  - JWT inyectado automáticamente           │        │
│  │  - Manejo de errores centralizado          │        │
│  └────────────┬────────────────────────────────┘        │
│               │                                           │
│  ┌────────────▼────────────────────────────────┐        │
│  │  BACKEND NestJS (http://localhost:3001)    │        │
│  │  - API REST autenticada                    │        │
│  │  - Base de datos Prisma                    │        │
│  └─────────────────────────────────────────────┘        │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

**Versión**: 1.0.0  
**Fecha**: 22 de Mayo de 2026  
**Autor**: Arquitecto Senior Frontend  
**Timezone**: America/La_Paz (Bolivia)

---

*Para comenzar: Lee [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) o ejecuta `bash setup-frontend.sh`*
