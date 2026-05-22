# 🚀 REFERENCIA RÁPIDA - INVESTCO ERP FRONTEND

## Tabla de Contenidos Rápida
- [Iniciar Desarrollo](#iniciar-desarrollo)
- [Estructura de Carpetas](#estructura-de-carpetas)
- [Ejemplos de Código](#ejemplos-de-código)
- [Rutas de Navegación](#rutas-de-navegación)
- [Comandos Útiles](#comandos-útiles)

---

## 🔥 Iniciar Desarrollo

```bash
# 1. Instalar dependencias (primera vez)
npm install

# 2. Crear .env.local
cp .env.example .env.local

# 3. Iniciar servidor
npm run dev

# Acceder a: http://localhost:3000
```

---

## 📂 Estructura de Carpetas - Ubicación Rápida

| Carpeta | Propósito | Ejemplo |
|---------|-----------|---------|
| `src/app/` | Rutas y layouts (Next.js) | `(dashboard)/proyectos/page.tsx` |
| `src/components/` | Componentes React | `ProjectCard.tsx`, `Forms` |
| `src/hooks/` | Custom hooks | `useAuth()`, `usePreciseMath()` |
| `src/lib/` | Utilidades y helpers | `api-client.ts`, `decimal-utils.ts` |
| `src/store/` | Estado global (Zustand) | `ui-store`, `auth-store` |
| `src/types/` | TypeScript interfaces | `api.ts`, `auth.ts` |
| `src/services/` | Lógica de negocio | `projectService.ts` |
| `src/utils/` | Funciones auxiliares | `validators.ts`, `formatters.ts` |

---

## 💻 Ejemplos de Código

### 1️⃣ Crear un Componente de Servidor

```typescript
// src/app/(dashboard)/proyectos/page.tsx
import { getProjects } from "@/services/projectService";
import { ProjectList } from "@/components/ProjectList";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Proyectos</h1>
      <ProjectList projects={projects} />
    </div>
  );
}
```

### 2️⃣ Crear un Componente de Cliente con Hook

```typescript
// src/components/ProjectForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProjectSchema } from "@/lib/schemas";
import { apiPost } from "@/lib/api-client";

export function ProjectForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(ProjectSchema),
  });

  const onSubmit = async (data) => {
    try {
      await apiPost("/projects", data);
      // Éxito
    } catch (error) {
      // Error
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input
        {...register("name")}
        placeholder="Nombre del proyecto"
        className="w-full px-3 py-2 border rounded"
      />
      {errors.name && <span>{errors.name.message}</span>}
      <button type="submit">Crear</button>
    </form>
  );
}
```

### 3️⃣ Usar el Hook de Autenticación

```typescript
// src/components/UserMenu.tsx
"use client";

import { useAuth } from "@/hooks/useAuth";

export function UserMenu() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <a href="/auth/login">Login</a>;
  }

  return (
    <div>
      <p>Hola, {user?.firstName}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 4️⃣ Usar Cálculos Financieros Precisos

```typescript
// src/components/BudgetSummary.tsx
"use client";

import { usePreciseMath } from "@/hooks/usePreciseMath";

export function BudgetSummary({ budget, spent }) {
  const math = usePreciseMath();

  const remaining = math.subtract(budget, spent);
  const percentage = math.divide(
    math.multiply(spent, 100),
    budget
  );

  return (
    <div>
      <p>Presupuesto: {math.formatCurrency(budget)}</p>
      <p>Gastado: {math.formatCurrency(spent)}</p>
      <p>Disponible: {math.formatCurrency(remaining)}</p>
      <p>Porcentaje: {math.toFixed(percentage, 2)}%</p>
    </div>
  );
}
```

### 5️⃣ Usar TanStack Query para Datos del Servidor

```typescript
// src/components/ProjectsList.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import type { Project } from "@/types/api";

export function ProjectsList() {
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiGet<Project[]>("/projects"),
  });

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {projects?.map((project) => (
        <li key={project.id}>{project.name}</li>
      ))}
    </ul>
  );
}
```

### 6️⃣ Usar Zustand para Estado Local

```typescript
// Lectura desde componente
"use client";

import { useUIStore } from "@/store/ui-store";

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <>
      <button onClick={toggleSidebar}>Toggle Sidebar</button>
      {sidebarOpen && <nav>{/* ... */}</nav>}
    </>
  );
}
```

### 7️⃣ Usar Fechas con Zona de Bolivia

```typescript
// src/utils/reportUtils.ts
import {
  getNowInBolivia,
  formatDateTime,
  getMonthRange,
} from "@/lib/date-utils";

export function generateMonthlyReport(year: number, month: number) {
  const now = getNowInBolivia();
  const date = new Date(year, month - 1);
  const { start, end } = getMonthRange(date);

  return {
    period: `${formatDateTime(start)} - ${formatDateTime(end)}`,
    generatedAt: formatDateTime(now),
  };
}
```

### 8️⃣ Usar Cola Offline (PWA)

```typescript
// src/components/SyncStatus.tsx
"use client";

import { useOfflineQueue } from "@/hooks/useOfflineQueue";

export function SyncStatus() {
  const { isOnline, pendingRequestsCount, retrySync } = useOfflineQueue();

  return (
    <div>
      <p>
        Estado: {isOnline ? "🟢 Online" : "🔴 Offline"}
      </p>
      {pendingRequestsCount > 0 && (
        <button onClick={retrySync}>
          Sincronizar ({pendingRequestsCount} pendientes)
        </button>
      )}
    </div>
  );
}
```

---

## 🗺️ Rutas de Navegación

### Rutas Públicas
```
/                              # Home / Landing
/auth/login                    # Login
/auth/recuperar-password       # Recuperar contraseña
```

### Rutas Autenticadas (Dashboard)
```
/                              # Dashboard principal
/inmuebles                     # Gestión de inmuebles
/planos                        # Visualización de planos
/clientes                      # Gestión de clientes
/reservas                      # Reservas
/contratos                     # Contratos
/proyectos                     # Listado de proyectos
/proyectos/[id]                # Detalle de proyecto
/reportes                      # Reportes
/admin                         # Panel administrativo
```

### Rutas Móvil (PWA)
```
/obra-mobile                   # App móvil optimizada
```

---

## 📝 Comandos Útiles

### Desarrollo
```bash
npm run dev              # Servidor en modo desarrollo
npm run dev -- --turbo   # Con Turbopack (más rápido)
npm run build            # Build para producción
npm run start            # Iniciar servidor producción
```

### Validación
```bash
npm run type-check       # Verificar tipos TypeScript
npm run lint             # Ejecutar ESLint
npm run format           # Formatear código con Prettier
npm run validate         # Todas las validaciones
```

### Base de Datos / API
```bash
# Asegúrate que backend NestJS esté en http://localhost:3001
npm run build && npm start
```

---

## 🎯 Checklist - Primera Vez Configurando

- [ ] Clonar repositorio
- [ ] `npm install`
- [ ] `cp .env.example .env.local`
- [ ] Editar `.env.local` con valores correctos
- [ ] Verificar que backend (NestJS) esté corriendo en puerto 3001
- [ ] `npm run dev`
- [ ] Acceder a `http://localhost:3000`
- [ ] Verificar que no hay errores de TypeScript
- [ ] Verificar que ESLint no reporta problemas

---

## 🆘 Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `Cannot find module '@/...'` | Path alias no configurado | Revisar `tsconfig.json` paths |
| `SyntaxError: Unexpected token <` | Olvidó `"use client"` | Agregar `"use client"` al inicio |
| `ReferenceError: localStorage is undefined` | Accediendo localStorage en servidor | Usar `typeof window !== 'undefined'` |
| `Module not found: decimal.js` | Dependencia no instalada | `npm install decimal.js` |
| Puerto 3000 en uso | Otro proceso usando puerto | `npm run dev -- -p 3001` |

---

## 📚 Links Rápidos

- 🔗 [Documentación Completa](./IMPLEMENTATION_GUIDE.md)
- 📖 [Next.js Docs](https://nextjs.org/docs)
- ⚛️ [React Docs](https://react.dev)
- 🎨 [Tailwind CSS](https://tailwindcss.com)
- 🧩 [shadcn/ui](https://ui.shadcn.com)
- 🌍 [API Backend](http://localhost:3001)

---

**Última actualización**: 22 de mayo de 2026  
**Versión**: 1.0.0
