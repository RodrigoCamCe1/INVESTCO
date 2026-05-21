# Investco — Sistema de Control de Obra

Proyecto académico SI414 — Sistemas de Información, UTEPSA Grupo A.
ERP integral para constructora boliviana Investco.

**Equipo:**
- Bruno Paz Aguilera (2020114321)
- Rony Javier Rivero Paniagua (2022110749)
- Rodrigo Camacho Cedeño (2022212096)

**Docente:** Ing. Nancy Velasquez Suarez

---

## Estructura del repo

```
INVESTCO/
├── backend/      # API REST NestJS + Prisma + PostgreSQL
└── frontend/     # UI (pendiente)
```

## Backend

Ver `backend/README.md` para setup, endpoints, state machines, RBAC y guía completa de integración para el frontend.

**Stack:** NestJS 11 · TypeScript 5.7 · Prisma 6.19 · PostgreSQL 16 · JWT · Swagger

**Quickstart:**
```bash
cd backend
npm install
npm run db:up
npx prisma migrate dev --name init
npm run db:seed
npm run start:dev
```

Backend en `http://localhost:3000/api`, Swagger en `http://localhost:3000/api/docs`.

## Frontend

TBD. Stack sugerido: Next.js 14 / Vite + React, TanStack Query, shadcn/ui + Tailwind.
Detalles en `backend/README.md` sección "Sugerencias para el frontend".

---

## Documentación

- `backend/README.md` — guía técnica completa (setup, API, RBAC, patrones)
- `backend/ANALISIS_BACKEND_INVESTCO.md` — análisis del proyecto, casos de uso, modelo de dominio, fórmulas críticas
- `backend/prisma/schema.prisma` — schema DB (41 modelos)
- Swagger UI en runtime: `http://localhost:3000/api/docs`
