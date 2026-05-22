# 🏗️ INVESTCO ERP FRONTEND - MAPA VISUAL COMPLETO

## 📍 Ubicación de Todos los Archivos

```
INVESTCO/
│
├── 📄 README.md (original)
├── 📦 backend/ (NestJS - no modificar)
├── 📁 docs/
│
└── 🚀 setup-frontend.sh  ◄─── SCRIPT AUTOMATIZADO
    │
    └── Crea automáticamente:
        │
        ├── frontend/                           ◄─── PROYECTO NEXT.JS
        │   ├── src/
        │   │   ├── app/
        │   │   │   ├── (auth)/
        │   │   │   ├── (dashboard)/
        │   │   │   ├── obra-mobile/
        │   │   │   ├── layout.tsx              ◄─── 📄 app/layout.tsx
        │   │   │   └── page.tsx                ◄─── 📄 app/page.tsx
        │   │   │
        │   │   ├── components/
        │   │   │   ├── ui/          (shadcn/ui)
        │   │   │   ├── shared/      (Navbar, Sidebar)
        │   │   │   ├── forms/       (Formularios)
        │   │   │   └── charts/      (Recharts)
        │   │   │
        │   │   ├── hooks/
        │   │   │   ├── useAuth.ts                ◄─── 📄 Hook autenticación
        │   │   │   ├── usePreciseMath.ts         ◄─── 📄 Hook cálculos
        │   │   │   └── useOfflineQueue.ts        ◄─── 📄 Hook offline
        │   │   │
        │   │   ├── lib/
        │   │   │   ├── api-client.ts             ◄─── 📄 Cliente HTTP
        │   │   │   ├── decimal-utils.ts          ◄─── 📄 Math Financiero
        │   │   │   └── date-utils.ts             ◄─── 📄 Fechas (Bolivia)
        │   │   │
        │   │   ├── providers/
        │   │   │   ├── index.tsx                 ◄─── 📄 Agregador
        │   │   │   ├── query-provider.tsx        ◄─── 📄 TanStack Query
        │   │   │   └── auth-provider.tsx         ◄─── 📄 Auth Context
        │   │   │
        │   │   ├── store/
        │   │   │   ├── ui-store.ts               ◄─── 📄 UI State
        │   │   │   ├── auth-store.ts             ◄─── 📄 Auth State
        │   │   │   └── offline-store.ts          ◄─── 📄 Offline State
        │   │   │
        │   │   ├── types/
        │   │   │   ├── auth.ts                   ◄─── 📄 Auth Types
        │   │   │   └── api.ts                    ◄─── 📄 API Types
        │   │   │
        │   │   ├── services/                 ◄─── (Crear después)
        │   │   ├── utils/                    ◄─── (Crear después)
        │   │   ├── constants/                ◄─── (Crear después)
        │   │   ├── middleware/               ◄─── (Crear después)
        │   │   │
        │   │   └── styles/
        │   │       └── globals.css
        │   │
        │   ├── public/
        │   ├── next.config.ts                     ◄─── 📄 Configuración
        │   ├── tsconfig.json                      ◄─── 📄 TypeScript
        │   ├── tailwind.config.ts                 ◄─── 📄 Tailwind
        │   ├── postcss.config.js                  ◄─── 📄 PostCSS
        │   ├── .env.example                       ◄─── 📄 Template env
        │   ├── .env.local                     ◄─── (Crear manualmente)
        │   ├── package.json                   ◄─── (Auto-generado)
        │   └── README.md                      ◄─── (Auto-generado)
        │
        └── frontend-config/              ◄─── CARPETA FUENTE (archivos de referencia)
            ├── next.config.ts
            ├── tsconfig.json
            ├── tailwind.config.ts
            ├── postcss.config.js
            ├── .env.example
            ├── package.json.template
            │
            ├── src-app-layout.tsx            (→ copiar a src/app/layout.tsx)
            ├── src-app-page.tsx              (→ copiar a src/app/page.tsx)
            ├── providers-index.tsx           (→ copiar a src/providers/)
            ├── providers-query-provider.tsx
            ├── providers-auth-provider.tsx
            ├── hooks-useAuth.ts
            ├── hooks-usePreciseMath.ts
            ├── hooks-useOfflineQueue.ts
            ├── lib-api-client.ts
            ├── lib-decimal-utils.ts
            ├── lib-date-utils.ts
            ├── store-ui-store.ts
            ├── store-auth-store.ts
            ├── store-offline-store.ts
            ├── types-auth.ts
            ├── types-api.ts
            │
            ├── IMPLEMENTATION_GUIDE.md        (15 pág - Guía completa)
            ├── QUICK_REFERENCE.md            (8 pág - Referencia rápida)
            ├── INDEX.md                      (10 pág - Índice)
            └── README_RESUMEN.md             (Este resumen)
```

---

## 🎯 FLUJO DE INSTALACIÓN

```
┌──────────────────────────────────────────────────────┐
│ PASO 1: Ejecutar Script Automatizado                 │
│ $ bash setup-frontend.sh                             │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ├─ ✓ Crea frontend/ con Next.js
                  ├─ ✓ Instala dependencias
                  ├─ ✓ Configura Tailwind CSS
                  ├─ ✓ Instala shadcn/ui
                  └─ ✓ Crea estructura básica
                  │
┌─────────────────▼──────────────────────────────────────┐
│ PASO 2: Copiar Archivos de Infraestructura            │
│ Source: /frontend-config/src-*                        │
│ Dest:   /frontend/src/                                │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ├─ Copiar providers/
                  ├─ Copiar hooks/
                  ├─ Copiar lib/
                  ├─ Copiar store/
                  ├─ Copiar types/
                  └─ Copiar app/(layout.tsx, page.tsx)
                  │
┌─────────────────▼──────────────────────────────────────┐
│ PASO 3: Configurar Variables de Entorno               │
│ $ cp frontend/.env.example frontend/.env.local        │
│ $ nano frontend/.env.local                            │
└─────────────────┬──────────────────────────────────────┘
                  │
                  └─ Editar valores de API_URL, TIMEZONE, etc.
                  │
┌─────────────────▼──────────────────────────────────────┐
│ PASO 4: Iniciar Desarrollo                            │
│ $ cd frontend                                         │
│ $ npm run dev                                         │
└─────────────────┬──────────────────────────────────────┘
                  │
                  └─ ✓ Servidor en http://localhost:3000
```

---

## 📊 RESUMEN DE ARCHIVOS POR TIPO

### 📝 **Archivos de Configuración (6)**
```
✓ next.config.ts           Configuración Next.js 15
✓ tsconfig.json            TypeScript strict mode
✓ tailwind.config.ts       Tailwind CSS con temas personalizados
✓ postcss.config.js        Integración PostCSS
✓ .env.example             Template de variables de entorno
✓ package.json.template    Template de dependencias
```

### 🎨 **Archivos de Aplicación (8)**
```
✓ src/app/layout.tsx                 Root layout con metadata
✓ src/app/page.tsx                   Home page
✓ src/providers/index.tsx             Agregador de providers
✓ src/providers/query-provider.tsx    TanStack Query provider
✓ src/providers/auth-provider.tsx     Autenticación provider
✓ src/hooks/useAuth.ts                Hook de autenticación
✓ src/hooks/usePreciseMath.ts          Hook de cálculos financieros
✓ src/hooks/useOfflineQueue.ts        Hook de cola offline
```

### 🔧 **Archivos de Utilidades (3)**
```
✓ src/lib/api-client.ts               Cliente HTTP con Axios
✓ src/lib/decimal-utils.ts            Cálculos financieros precisos
✓ src/lib/date-utils.ts               Manejo de fechas (Bolivia)
```

### 💾 **Archivos de Estado (3)**
```
✓ src/store/ui-store.ts               UI local state (Zustand)
✓ src/store/auth-store.ts             Auth state (Zustand)
✓ src/store/offline-store.ts          Offline queue (Zustand + IndexedDB)
```

### 📚 **Archivos de Tipos (2)**
```
✓ src/types/auth.ts                   Tipos de autenticación
✓ src/types/api.ts                    Tipos de API y modelos ERP
```

### 📖 **Documentación (4)**
```
✓ IMPLEMENTATION_GUIDE.md              Guía completa (15 páginas)
✓ QUICK_REFERENCE.md                  Referencia rápida (8 páginas)
✓ INDEX.md                             Índice de archivos (10 páginas)
✓ README_RESUMEN.md                    Este resumen (1 página)
```

### 🚀 **Script Automatizado (1)**
```
✓ setup-frontend.sh                    Script bash que automatiza todo
```

---

## 🗂️ ESTRUCTURA DE DIRECTORIOS FINAL

```
frontend/
├── 📂 src/
│   ├── 📂 app/                          (Next.js App Router)
│   │   ├── 📂 (auth)/                   (Rutas de autenticación)
│   │   │   ├── 📂 login/
│   │   │   │   └── page.tsx
│   │   │   └── 📂 recuperar-password/
│   │   │       └── page.tsx
│   │   ├── 📂 (dashboard)/              (Rutas protegidas)
│   │   │   ├── 📂 inmuebles/
│   │   │   ├── 📂 clientes/
│   │   │   ├── 📂 contratos/
│   │   │   ├── 📂 proyectos/
│   │   │   │   └── 📂 [id]/
│   │   │   ├── 📂 reportes/
│   │   │   ├── 📂 admin/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── 📂 obra-mobile/              (PWA móvil)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   │
│   ├── 📂 components/
│   │   ├── 📂 ui/                       (shadcn/ui base)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ... (más componentes)
│   │   ├── 📂 shared/                   (Componentes compartidos)
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Breadcrumbs.tsx
│   │   ├── 📂 forms/                    (Formularios validados)
│   │   │   ├── ProjectForm.tsx
│   │   │   ├── ClientForm.tsx
│   │   │   └── ContractForm.tsx
│   │   └── 📂 charts/                   (Gráficos)
│   │       ├── BudgetChart.tsx
│   │       └── ProgressChart.tsx
│   │
│   ├── 📂 hooks/
│   │   ├── useAuth.ts
│   │   ├── usePreciseMath.ts
│   │   └── useOfflineQueue.ts
│   │
│   ├── 📂 lib/
│   │   ├── api-client.ts
│   │   ├── decimal-utils.ts
│   │   ├── date-utils.ts
│   │   └── schemas.ts (crear: Zod schemas)
│   │
│   ├── 📂 providers/
│   │   ├── index.tsx
│   │   ├── query-provider.tsx
│   │   └── auth-provider.tsx
│   │
│   ├── 📂 store/
│   │   ├── ui-store.ts
│   │   ├── auth-store.ts
│   │   └── offline-store.ts
│   │
│   ├── 📂 types/
│   │   ├── auth.ts
│   │   └── api.ts
│   │
│   ├── 📂 services/ (crear después)
│   │   ├── projectService.ts
│   │   ├── clientService.ts
│   │   ├── contractService.ts
│   │   └── ...
│   │
│   ├── 📂 utils/ (crear después)
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   └── helpers.ts
│   │
│   ├── 📂 constants/ (crear después)
│   │   ├── permissions.ts
│   │   ├── roles.ts
│   │   └── statuses.ts
│   │
│   └── 📂 middleware/ (crear después)
│       └── auth-middleware.ts
│
├── 📂 public/
│   ├── favicon.ico
│   └── apple-touch-icon.png
│
├── 📂 .next/ (auto-generado)
├── 📂 node_modules/ (auto-generado)
│
├── 📄 next.config.ts
├── 📄 tsconfig.json
├── 📄 tailwind.config.ts
├── 📄 postcss.config.js
├── 📄 package.json
├── 📄 package-lock.json
├── 📄 .env.local
├── 📄 .env.example
├── 📄 .gitignore
├── 📄 .eslintrc.json
├── 📄 .prettierrc
└── 📄 README.md
```

---

## 🎯 CHECKLIST DE VALIDACIÓN

Después de ejecutar el setup, verifica:

```
□ proyecto creado en /frontend/
□ node_modules instalado
□ npm run type-check sin errores
□ npm run lint sin errores críticos
□ npm run dev inicia sin errores
□ http://localhost:3000 accesible
□ TypeScript reconoce paths (@/*)
□ Tailwind CSS estilos aplicados
□ Backend corriendo en puerto 3001
□ .env.local con valores correctos
```

---

## 📞 REFERENCIAS RÁPIDAS

### **Documentación Generada**
- 📘 [IMPLEMENTATION_GUIDE.md](./frontend-config/IMPLEMENTATION_GUIDE.md) - Guía completa
- ⚡ [QUICK_REFERENCE.md](./frontend-config/QUICK_REFERENCE.md) - Referencia rápida
- 📑 [INDEX.md](./frontend-config/INDEX.md) - Índice de archivos

### **Documentación Externa**
- [Next.js 15](https://nextjs.org/docs)
- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

---

## 🚀 COMANDO FINAL

```bash
bash setup-frontend.sh && cd frontend && npm run dev
```

---

**Fecha**: 22 de Mayo de 2026  
**Versión**: 1.0.0  
**Timezone**: America/La_Paz (Bolivia)

**¡Listo para empezar! 🎉**
