# Investco — Backend ERP de Control de Obra

Backend del sistema de gestión integral para constructora Investco. Cubre el ciclo completo: venta de inmuebles → reserva → contrato → ejecución de obra → calidad → entrega → control financiero.

> **Proyecto académico SI414** — Sistemas de Información, UTEPSA Grupo A.
> Equipo: Bruno Paz Aguilera (2020114321), Rony Javier Rivero Paniagua (2022110749), Rodrigo Camacho Cedeño (2022212096).

---

## Para el dev del frontend — leeme primero

Pana, este backend ya está corriendo y testeado end-to-end. Aquí está lo que necesitás saber para enchufar la UI:

1. **Base URL:** `http://localhost:3000/api`
2. **Auth:** JWT Bearer. Hacés `POST /auth/login`, guardás `accessToken`, lo mandás en header `Authorization: Bearer <token>` en todo lo demás.
3. **Validación:** todos los DTOs son estrictos. Si mandás campo extra → 400. Si falta uno requerido → 400 con mensaje específico.
4. **Errores:** formato NestJS estándar: `{ "statusCode": 400, "message": [...] | "...", "error": "Bad Request" }`.
5. **Swagger:** `http://localhost:3000/api/docs` — todos los endpoints documentados, podés probarlos ahí mismo con bearer auth.
6. **Modo demo:** todas las integraciones externas (banco, firma digital, email) están mockeadas. La UI debería mostrar banner "MODO DEMO" cuando `USE_MOCKS=true` (lee desde el backend o lo asumes).

---

## Stack

- **Runtime:** Node.js 24 + TypeScript 5.7
- **Framework:** NestJS 11
- **ORM:** Prisma 6.19 + PostgreSQL 16
- **Auth:** JWT (passport-jwt) + bcrypt
- **Validation:** class-validator + class-transformer (DTOs estrictos)
- **Docs:** Swagger / OpenAPI
- **Container:** Docker Compose (Postgres local)

---

## Setup local

### Requisitos

- Node.js ≥ 20 (testeado en 24)
- Docker Desktop (para Postgres) o un Postgres nativo
- npm 10+

### Pasos

```bash
# 1. Clonar
git clone https://github.com/RodrigoCamCe1/INVESTCO.git
cd INVESTCO

# 2. Dependencias
npm install

# 3. Postgres local
npm run db:up
# Espera 5-10 segundos hasta que healthcheck pase

# 4. Migrar schema + generar cliente Prisma
npx prisma migrate dev --name init
npx prisma generate

# 5. Seed: 15 roles + admin user
npm run db:seed

# 6. Run
npm run start:dev
```

Backend en `http://localhost:3000/api`. Swagger en `http://localhost:3000/api/docs`.

### Credenciales seed

```
email:    admin@investco.local
password: Admin123!
```

### Variables de entorno (.env)

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/investco?schema=public"
USE_MOCKS=true
JWT_SECRET="dev-secret-change-in-prod-investco-si414-2026"
JWT_EXPIRES_IN="12h"
ADMIN_EMAIL="admin@investco.local"
ADMIN_PASSWORD="Admin123!"
```

> **Nota:** Postgres del Docker Compose corre en puerto **5433** (no 5432) para evitar choques con Postgres nativos en Windows.

---

## Roles del sistema (RBAC)

15 roles. Frontend debería mostrar UI condicional según roles del JWT.

| Code | Nombre | Permisos típicos |
|------|--------|------------------|
| `ADMIN` | Administrador | Todo |
| `GERENTE` | Gerente | Aprobaciones, reportes, decisiones estratégicas |
| `SECRETARIA` | Secretaria | Clientes, meetings |
| `VENDEDOR` | Vendedor | Clientes, reservas, credit checks |
| `INGENIERO` | Ingeniero | Cálculos estructurales, activities, calidad |
| `ARQUITECTO` | Arquitecto | Planos, versiones |
| `ENCARG_PROYECTO` | Encargado de Proyecto | Project, activities, staff, attendance |
| `ENCARG_CALIDAD` | Encargado de Calidad | Inspections, findings |
| `ENCARG_PRESUPUESTO` | Encargado de Presupuesto | Budget, OC, requirements |
| `ENCARG_COMPRAS` | Encargado de Compras | OC, suppliers, receptions |
| `CONTRATISTA` | Contratista | Lectura asignaciones |
| `OBRERO` | Obrero | Lectura asistencia personal |
| `PROVEEDOR` | Proveedor | (Externo, sin login en demo) |
| `CLIENTE` | Cliente | Lectura propio expediente, firma delivery |
| `SUPERVISOR` | Supervisor | Inspecciones, attendance |

---

## Flujo de negocio principal

```
┌──────────────────────────────────────────────────────────────────────┐
│ 1. Crear cliente (LEAD)                                              │
│ 2. Crear inmueble (DISPONIBLE)                                       │
│ 3. Reservar → Property RESERVADO, Client RESERVADO                   │
│ 4. Crear contrato BORRADOR desde reserva                             │
│ 5. submit-review → REVISION                                          │
│ 6. sign → FIRMADO + Property VENDIDO + Client FIRMADO + Reserva CONV │
│ 7. Crear proyecto desde contrato → Property EN_CONSTRUCCION          │
│ 8. Activities, materials, workers, calidad...                        │
│ 9. Finalizar proyecto → ENTREGA stage                                │
│ 10. Crear delivery → sign-company + sign-client                      │
│ 11. Ambas firmas → Property ENTREGADO + Client ENTREGADO             │
└──────────────────────────────────────────────────────────────────────┘
```

---

## State machines

Frontend debería deshabilitar botones/acciones según el estado actual.

### Property
```
DISPONIBLE → RESERVADO → VENDIDO → EN_CONSTRUCCION → ENTREGADO
     ↑__________|
```

### Client
```
LEAD → {PROSPECTO, RESERVADO, CERRADO}
PROSPECTO → {RESERVADO, LEAD, CERRADO}
RESERVADO → {FIRMADO, PROSPECTO, CERRADO}
FIRMADO → {ENTREGADO, CERRADO}
ENTREGADO → CERRADO
```

### Reservation
```
ACTIVA → {VENCIDA, CONVERTIDA, CANCELADA}  (terminales)
```

### Contract
```
BORRADOR → REVISION → FIRMADO → {MODIFICADO, RESCINDIDO}
    ↑________|
```

### Project
```
Status: PLANIFICADO → EN_EJECUCION → {PAUSADO, FINALIZADO, CANCELADO}
                          ↕
                       PAUSADO

Stage: PRELIMINARES → OBRA_BRUTA → OBRA_FINA → ENTREGA
```

### Activity
```
PENDIENTE → EN_CURSO → TERMINADA
       ↘ BLOQUEADA ↗
```

### Purchase Order
```
BORRADOR → EN_APROBACION → APROBADA → ENVIADA → RECIBIDA_PARCIAL → RECIBIDA_TOTAL
                                                              ↘ (auto cuando líneas completas)
* → CANCELADA
```

### Quality Finding
```
ABIERTA → {EN_CORRECCION, RECHAZADA}
EN_CORRECCION → {RESUELTA, RECHAZADA, ABIERTA}
RESUELTA / RECHAZADA → terminal
```

---

## API Reference

Todos los endpoints excepto `/auth/login`, `/auth/register` y `/health` requieren header `Authorization: Bearer <token>`.

### Auth

```
POST   /api/auth/register                          Público
POST   /api/auth/login                             Público
GET    /api/auth/me                                Auth (devuelve user actual)
```

Login response:
```json
{
  "accessToken": "eyJ...",
  "tokenType": "Bearer",
  "expiresIn": "12h",
  "user": {
    "id": "uuid",
    "email": "admin@investco.local",
    "fullName": "Administrador Investco",
    "roles": ["ADMIN"]
  }
}
```

### Properties

```
GET    /api/properties                             Auth. Filtros: status, type, zone, parentPropertyId, page, limit
GET    /api/properties/:id                         Auth (incluye childProperties + modelBlueprint)
POST   /api/properties                             ADMIN, GERENTE
PATCH  /api/properties/:id                         ADMIN, GERENTE, ENCARG_PROYECTO
DELETE /api/properties/:id                         ADMIN (soft-delete)
POST   /api/properties/:id/divide                  ADMIN, GERENTE
```

### Clients + Meetings + Credit Checks

```
GET    /api/clients                                Auth. Filtros: status, q (búsqueda), page, limit
GET    /api/clients/:id                            Auth (incluye meetings + creditChecks)
POST   /api/clients                                ADMIN, GERENTE, SECRETARIA, VENDEDOR
PATCH  /api/clients/:id                            ADMIN, GERENTE, SECRETARIA, VENDEDOR
DELETE /api/clients/:id                            ADMIN, GERENTE

GET    /api/clients/:id/meetings
POST   /api/clients/:id/meetings                   ADMIN, GERENTE, SECRETARIA, VENDEDOR
PATCH  /api/clients/:id/meetings/:mid              + state PROGRAMADA → REALIZADA/CANCELADA/REPROGRAMADA
DELETE /api/clients/:id/meetings/:mid

GET    /api/clients/:id/credit-checks
POST   /api/clients/:id/credit-checks              ADMIN, GERENTE, VENDEDOR
                                                   → Llama al banco mock, devuelve APROBADO/PENDIENTE/RECHAZADO
```

### Reservations

```
GET    /api/reservations                           Auth. Filtros: status, clientId, propertyId
GET    /api/reservations/:id
POST   /api/reservations                           ADMIN, GERENTE, VENDEDOR
                                                   → atómico: Property→RESERVADO + Client→RESERVADO
PATCH  /api/reservations/:id/cancel                ADMIN, GERENTE, VENDEDOR
POST   /api/reservations/expire-due                ADMIN, GERENTE (vence todas con expiresAt < now)
```

### Contracts

```
GET    /api/contracts                              Auth. Filtros: status, clientId, propertyId
GET    /api/contracts/:id                          (incluye previousContract historial)
POST   /api/contracts                              ADMIN, GERENTE  (desde reservationId)
PATCH  /api/contracts/:id/submit-review            ADMIN, GERENTE, VENDEDOR
PATCH  /api/contracts/:id/sign                     ADMIN, GERENTE
                                                   → cascada: Property→VENDIDO, Client→FIRMADO, Res→CONVERTIDA
PATCH  /api/contracts/:id/rescind                  ADMIN, GERENTE
POST   /api/contracts/:id/amend                    ADMIN, GERENTE
                                                   Body: { expectedOptimisticVersion, totalAmount?, ... }
                                                   → crea nueva versión vinculada (previousContractId)
```

### Projects + Activities + Preliminaries

```
GET    /api/projects                               Auth. Filtros: status, currentStage
GET    /api/projects/:id                           (incluye activities + preliminaries)
POST   /api/projects                               ADMIN, GERENTE, ENCARG_PROYECTO
                                                   → atómico: Property→EN_CONSTRUCCION
                                                   projectManagerId DEBE tener rol ENCARG_PROYECTO
PATCH  /api/projects/:id                           ADMIN, GERENTE, ENCARG_PROYECTO

GET    /api/projects/:id/activities
POST   /api/projects/:id/activities                ADMIN, GERENTE, ENCARG_PROYECTO, INGENIERO
PATCH  /api/projects/:id/activities/:aid
DELETE /api/projects/:id/activities/:aid           (solo PENDIENTE)

POST   /api/projects/:id/activities/:aid/progress  ADMIN, GERENTE, ENCARG_PROYECTO, INGENIERO, SUPERVISOR
                                                   → auto-transición: 0%→EN_CURSO, 100%→TERMINADA
GET    /api/projects/:id/progress                  Auth (% ponderado por stage)

GET    /api/projects/:id/preliminaries
POST   /api/projects/:id/preliminaries             ADMIN, GERENTE, ENCARG_PROYECTO, INGENIERO
PATCH  /api/projects/:id/preliminaries/:pid/complete
DELETE /api/projects/:id/preliminaries/:pid
```

### Materials + Suppliers + Purchase Orders + Receptions

```
GET    /api/materials                              Auth. Filtros: category, q, isActive
POST   /api/materials                              ADMIN, GERENTE, ENCARG_COMPRAS, ENCARG_PRESUPUESTO
PATCH  /api/materials/:id
DELETE /api/materials/:id                          (deactivate si en uso)

GET    /api/suppliers
POST   /api/suppliers                              ADMIN, GERENTE, ENCARG_COMPRAS
PATCH  /api/suppliers/:id
DELETE /api/suppliers/:id                          (deactivate)

GET    /api/projects/:id/requirements
POST   /api/projects/:id/requirements              ADMIN, GERENTE, ENCARG_PRESUPUESTO, ENCARG_COMPRAS
                                                   (upsert por projectId+materialId)
DELETE /api/projects/:id/requirements/:rid

GET    /api/projects/:id/usages
POST   /api/projects/:id/usages                    Auth roles obra
GET    /api/projects/:id/material-analysis         Auth (consumo vs avance + warnings)

GET    /api/purchase-orders                        Filtros: status, projectId, supplierId
GET    /api/purchase-orders/:id                    (incluye lines + receptions)
POST   /api/purchase-orders                        ADMIN, GERENTE, ENCARG_COMPRAS, ENCARG_PRESUPUESTO
PATCH  /api/purchase-orders/:id/submit-approval
PATCH  /api/purchase-orders/:id/approve            ADMIN, GERENTE
PATCH  /api/purchase-orders/:id/send
PATCH  /api/purchase-orders/:id/cancel             ADMIN, GERENTE

GET    /api/purchase-orders/:id/receptions
POST   /api/purchase-orders/:id/receptions         ADMIN, GERENTE, ENCARG_COMPRAS, ENCARG_PROYECTO
                                                   → auto status RECIBIDA_PARCIAL/TOTAL
```

### Workers + Staff Assignments + Attendance

```
GET    /api/workers                                Auth. Filtros: type, speciality, isActive
POST   /api/workers                                ADMIN, GERENTE, ENCARG_PROYECTO
                                                   (INTERNO con userId | EXTERNO con contractorCompany)
PATCH  /api/workers/:id
DELETE /api/workers/:id                            (soft-deactivate)

GET    /api/projects/:id/staff-assignments
POST   /api/projects/:id/staff-assignments         ADMIN, GERENTE, ENCARG_PROYECTO
                                                   (rechaza overlap activo del mismo worker)
PATCH  /api/projects/:id/staff-assignments/:aid/end

GET    /api/projects/:id/attendances               Auth. Filtros: workerId, from, to
POST   /api/projects/:id/attendances               ADMIN, GERENTE, ENCARG_PROYECTO, SUPERVISOR
                                                   (unique workerId+projectId+date)
GET    /api/projects/:id/labor-cost                Auth (costo MO acumulado)
```

### Quality Inspections + Findings

```
GET    /api/projects/:id/quality-inspections
POST   /api/projects/:id/quality-inspections       ADMIN, GERENTE, ENCARG_CALIDAD, INGENIERO, SUPERVISOR
                                                   (inspectorId DEBE tener uno de esos roles)

GET    /api/quality-inspections/:id                (incluye findings)
POST   /api/quality-inspections/:id/findings       Mismos roles
PATCH  /api/quality-inspections/:id/findings/:fid  + ENCARG_PROYECTO
                                                   → auto closedDate al pasar a RESUELTA/RECHAZADA

GET    /api/projects/:id/quality-summary           Auth (stats + alertas críticos + overdue)
```

### Delivery

```
GET    /api/projects/:id/delivery                  Auth (incluye project + contract + client)
POST   /api/projects/:id/delivery                  ADMIN, GERENTE, ENCARG_PROYECTO
                                                   (requiere project FINALIZADO)
PATCH  /api/projects/:id/delivery/sign-client      ADMIN, GERENTE, ENCARG_PROYECTO, CLIENTE
PATCH  /api/projects/:id/delivery/sign-company     ADMIN, GERENTE, ENCARG_PROYECTO
                                                   → ambas firmas: Property+Client→ENTREGADO + stage→ENTREGA
```

### Payments

```
GET    /api/payments                               Auth. Filtros: type, projectId, clientId, supplierId, from, to
GET    /api/payments/:id                           (chain FKs)
POST   /api/payments                               ADMIN, GERENTE, ENCARG_PRESUPUESTO, ENCARG_COMPRAS, SECRETARIA

GET    /api/projects/:id/payments-summary          Auth (inflows/outflows/net/pendingFromContract)
```

Reglas FK por type:
- `DESEMBOLSO_BANCO` → requiere `contractId`
- `PAGO_CLIENTE` → requiere `clientId`
- `PAGO_PROVEEDOR` → requiere `supplierId`
- `PAGO_CONTRATISTA` → requiere `contractorWorkerId`
- `REEMBOLSO` → requiere `clientId`

### Budget

```
GET    /api/projects/:id/budget-lines              Auth
POST   /api/projects/:id/budget-lines              ADMIN, GERENTE, ENCARG_PRESUPUESTO
PATCH  /api/projects/:id/budget-lines/:bid
DELETE /api/projects/:id/budget-lines/:bid
GET    /api/projects/:id/budget-summary            Auth (planned vs actual por categoría + variance)
```

Categorías: `MATERIAL`, `MANO_OBRA`, `EQUIPO`, `SUBCONTRATO`, `GENERAL`.

### Schedule + Dependencies

```
GET    /api/projects/:id/schedule-items            Auth (con predecessors + successors)
POST   /api/projects/:id/schedule-items            ADMIN, GERENTE, ENCARG_PROYECTO, INGENIERO
PATCH  /api/projects/:id/schedule-items/:sid
DELETE /api/projects/:id/schedule-items/:sid

POST   /api/projects/:id/schedule-dependencies     Body: { predecessorId, successorId, type?, lagDays? }
                                                   Tipos: FS (default), SS, FF, SF
                                                   Rechaza self-deps y ciclos
DELETE /api/projects/:id/schedule-dependencies/:did
```

### Blueprints

```
GET    /api/blueprint-models                       Auth (con última versión)
GET    /api/blueprint-models/:id                   (con todas las versiones + installations)
POST   /api/blueprint-models                       ADMIN, GERENTE, ARQUITECTO

POST   /api/blueprint-models/:id/versions          ADMIN, GERENTE, ARQUITECTO, INGENIERO
                                                   arquitectId DEBE tener rol ARQUITECTO
                                                   engineerId DEBE tener rol INGENIERO
                                                   → auto-marca isCurrent, desmarca anterior
PATCH  /api/blueprint-versions/:vid                Body: { expectedOptimisticVersion, ... }
                                                   → optimistic lock (rechaza versiones stale con 409)
PATCH  /api/blueprint-models/:id/versions/:vid/set-current

POST   /api/blueprint-versions/:vid/installations  Tipos: ELECTRICA, PLOMERIA, CARPINTERIA, VIDRIERIA, HERRERIA
```

### Health

```
GET    /api/health                                 Público. Devuelve { status, db: 'up'|'down', timestamp }
```

---

## Patrones y convenciones

### Paginación

Endpoints con `?page=1&limit=20` devuelven:
```json
{
  "items": [...],
  "total": 123,
  "page": 1,
  "limit": 20
}
```

### Errores 400 detallados

class-validator devuelve array de mensajes:
```json
{
  "statusCode": 400,
  "message": [
    "firstName must be longer than or equal to 2 characters",
    "phone must be longer than or equal to 7 characters"
  ],
  "error": "Bad Request"
}
```

Errores de negocio devuelven string:
```json
{
  "statusCode": 400,
  "message": "Transición inválida cliente: LEAD → ENTREGADO. Permitidas desde LEAD: PROSPECTO, RESERVADO, CERRADO",
  "error": "Bad Request"
}
```

### Códigos HTTP

- `200` OK / `201` Created / `204` No Content
- `400` Validation / state machine inválida / reglas de negocio
- `401` Sin token o expirado
- `403` Sin rol permitido (`Roles` guard)
- `404` No existe (filtra deletedAt)
- `409` Conflicto (códigos dup, optimistic lock, recursos en estado terminal)

### Optimistic locking

Para `Contract.amend` y `BlueprintVersion.update`:
- Cliente envía `expectedOptimisticVersion`
- Si la del server difiere → 409
- Al actualizar, server incrementa `optimisticVersion`

Significa que el frontend debe guardar la version actual y mandarla en el PATCH. Si recibe 409, recargar entidad y reintentar.

### Soft delete

Algunas entidades (User, Property, Client, Contract, Project, PurchaseOrder) usan `deletedAt`. Las queries del listado filtran automáticamente. Al borrar, se setea `deletedAt = now`.

### Modo demo

Banner UI cuando `USE_MOCKS=true`. Los credit-checks devuelven respuesta simulada determinista (mismo CI = mismo resultado para reproducibilidad de presentación).

---

## Análisis y reportes (endpoints clave)

| Endpoint | Devuelve |
|----------|----------|
| `GET /api/projects/:id/progress` | % avance ponderado total + por stage |
| `GET /api/projects/:id/material-analysis` | Consumo vs planificado + warnings de sobreconsumo/desviación |
| `GET /api/projects/:id/labor-cost` | Costo MO acumulado (días + horas + total por worker) |
| `GET /api/projects/:id/quality-summary` | Stats severidad/status + críticos abiertos + overdue |
| `GET /api/projects/:id/payments-summary` | Inflows, outflows, net, saldo pendiente vs contrato |
| `GET /api/projects/:id/budget-summary` | Planned vs actual por categoría + variance % |

---

## Sugerencias para el frontend

### Stack recomendado

- **Next.js 14+** App Router o **Vite + React 18**
- **TanStack Query** para fetching/cache
- **Zustand** o React Context para estado global de auth
- **shadcn/ui** + Tailwind para componentes
- **React Hook Form + zod** para forms (los mensajes de error del backend ya vienen array-friendly)
- **Recharts** o **visx** para gráficos (progress %, budget variance, payments)

### Estructura de rutas sugerida

```
/login
/dashboard              → KPIs: # proyectos activos, ventas, alertas calidad críticas
/properties             → list + filters
/properties/:id         → detalle + actions (divide, status)
/clients                → list + search
/clients/:id            → meetings tab + credit-checks tab + reservations tab
/reservations           → list
/contracts/:id          → versión actual + historial
/projects               → list por status
/projects/:id           → tabs: overview / activities / staff / quality / budget / payments / delivery
/blueprints             → catalog
/blueprints/:id         → version timeline + diff visual
/admin/users            → gestión users + roles
/admin/materials        → catalog
/admin/suppliers        → catalog
```

### Componentes UI clave

1. **StatusBadge** — colorea según enum, con texto en español
2. **TransitionButton** — deshabilita si la transición no está permitida (lee del state machine)
3. **OptimisticForm** — wrapper para forms con `expectedOptimisticVersion` (Contracts, Blueprints)
4. **DemoBanner** — top banner amarillo cuando `USE_MOCKS=true`
5. **RoleGuard** — HOC que oculta acciones según roles del JWT
6. **MoneyDisplay** — formato BOB/USD según `currency`
7. **Decimal handling** — todos los campos numéricos vienen como string ("250.50"). Parseá con `Number()` o `Decimal.js`.

### Decimal precision

Prisma serializa `Decimal` como string. La UI:
- Al recibir: `Number(value)` o `new Decimal(value)` para mostrar
- Al enviar: número o string. Backend siempre acepta number.

### Fechas

- Backend acepta ISO 8601 con timezone (`2026-06-01T00:00:00.000Z`)
- Devuelve ISO con UTC
- Frontend muestra en zona local (`new Date(iso).toLocaleString('es-BO')`)

---

## Schema Prisma

Ver `prisma/schema.prisma`. 41 modelos. Resumen:

- **Auth**: User, Role, RoleAssignment
- **Inmuebles**: Property (jerarquía), BlueprintModel, BlueprintVersion, BlueprintInstallation
- **Comercial**: Client, Meeting, CreditCheck, Reservation, Contract
- **Obra**: Project, Activity, ActivityProgress, Preliminary
- **Compras**: Material, Supplier, MaterialRequirement, MaterialUsage, PurchaseOrder, PurchaseOrderLine, MaterialReception
- **Personal**: Worker, StaffAssignment, Attendance
- **Calidad**: QualityInspection, QualityFinding
- **Cronograma**: ScheduleItem, ScheduleDependency
- **Financiero**: BudgetLine, Payment
- **Entrega**: Delivery
- **Cross-cutting**: Document, Notification, AuditLog (modelos definidos, endpoints pendientes)

---

## Análisis técnico completo

Ver `ANALISIS_BACKEND_INVESTCO.md` en la raíz — incluye:
- 41 casos de uso (29 originales + 12 detectados como faltantes)
- Modelo de dominio completo
- Matriz RBAC (rol × CU)
- 6 state machines críticos
- Schema Prisma comentado
- Fórmulas críticas (avance, desviación presupuesto, consumo)
- Roadmap de implementación
- Recomendaciones detalladas para el frontend (sec 13)

---

## Scripts npm

```
npm run start              Arranca en modo prod (sin watch)
npm run start:dev          Arranca con watch
npm run build              Compila TS a dist/
npm run start:prod         Corre dist/main.js
npm run db:up              docker compose up postgres
npm run db:down            docker compose down
npm run db:seed            Seed 15 roles + admin user
npm run prisma:format      Formatea schema.prisma
npm run prisma:validate    Valida schema
npm run prisma:generate    Regenera cliente
npm run prisma:migrate     prisma migrate dev
npm run prisma:studio      UI web para explorar DB
```

---

## Contacto / equipo

- **Backend**: hecho por el equipo del proyecto SI414
- **Frontend**: TBD (vos, pana — manos a la obra 🛠️)
- **Docente**: Ing. Nancy Velasquez Suarez

Cualquier cosa que no entiendas del API, abrí Swagger (`/api/docs`), probás el endpoint con el botón "Authorize" y ya está.

---

## Licencia

Académico — Universidad UTEPSA, curso SI414, ciclo 2026. No para uso comercial sin autorización del equipo.
