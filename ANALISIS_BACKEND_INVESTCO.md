# Análisis Profundo y Diseño de Backend — Sistema de Control de Obra Investco

**Versión:** 1.1
**Fecha:** 2026-05-19
**Stack objetivo:** NestJS + PostgreSQL + Prisma
**Alcance:** 29 casos de uso del documento original + casos de uso faltantes identificados
**Contexto:** Proyecto universitario (materia SI414). Integraciones externas (banco, pasarelas de pago, firma digital) se implementan como **mocks** para la presentación. Si el sistema avanza a producción real, los mocks se reemplazan por adaptadores reales sin cambiar el dominio.

---

## 1. Resumen Ejecutivo

El documento base "Proyecto Control de obra Sistemas de información l.2025.pdf" presenta una **buena fotografía del dominio de negocio** de Investco (constructora de viviendas a medida), pero como **especificación funcional para construir un backend serio tiene gaps severos**:

- Modelo de dominio: placeholder (link Lucidchart muerto). Cero entidades formales.
- 6 inconsistencias actor/proceso detectadas entre los 29 CUs.
- Cero matriz RBAC pese a declarar 14 actores.
- Sin requisitos no funcionales cuantificados (concurrencia, latencia, retención).
- State machines de los objetos centrales (Inmueble, Proyecto, Contrato, Pedido) inexistentes.
- 12 CUs implícitos en la prosa pero nunca formalizados (auth, verificación crédito bancario, pagos de cuotas, entrega final, etc.).
- Métrica de "avance de obra" sin fórmula → reportes irrealizables.
- Concurrencia en planos colaborativos sin política (lock vs versionado vs CRDT).

Este documento **resuelve esas falencias** y deja la base para implementar el backend.

---

## 2. Inconsistencias Detectadas en el Documento Original

| # | Caso de uso | Problema | Corrección propuesta |
|---|-------------|----------|----------------------|
| 1 | CU#1 Gestionar inmuebles | Actor = Gerente General | Actor real = **Administrador / Secretaría** (gerente no hace data entry) |
| 2 | CU#3 Fusionar inmuebles | Actor row dice "Gerente General", resumen dice "ingeniero o arquitecto" | Actor = **Arquitecto / Ingeniero Civil** (consistente con CU#2 Dividir) |
| 3 | CU#19 Controlar trabajadores | Menciona "supervisor de obra" nunca declarado en sección 5.1 Actores | Agregar **Supervisor de Obra** como actor #15, o renombrar a "Encargado de Proyecto" |
| 4 | CU#23 Elaborar presupuesto | Actor = Encargado de Presupuesto, curso básico dice "Encargado del Proyecto" | Actor = **Encargado de Presupuesto** (consistente con CU#29) |
| 5 | CU#28 Generar reporte de cronograma | Actor = Encargado de Control de Calidad — no tiene sentido | Actor = **Encargado del Proyecto** |
| 6 | CU#9 Elaborar contrato | Actor = Vendedor pero el flujo requiere validación legal/financiera | Actor primario = **Vendedor**, actor secundario = **Administración** (revisa cláusulas) |
| 7 | Numeración duplicada | Secciones 6.24.5/6.24.6/6.25.x mezcladas con 6.25/6.26 — el doc tiene desfase entre numeración de secciones y números de CU | Renumerar a CU#1..#29 secuencial, secciones 6.1..6.29 |
| 8 | CU#15 vs CU#17 | Controlar avance obra bruta y fina son casi idénticos. Misma lógica con flag de etapa | Considerar un **único CU "Controlar avance de obra"** parametrizado por etapa |
| 9 | CU#16 vs CU#18 | Gestionar actividades obra bruta y fina son idénticos | Misma observación que #8 — unificar |
| 10 | "Verificar capacidad de crédito bancario" | Mencionado en sección 4.2 Relaciones como paso del flujo, nunca formalizado como CU | Agregar **CU#30 Verificar capacidad crediticia** (ver §6) |

---

## 3. Casos de Uso Corregidos (29) — Tabla Maestra

Lista normalizada con actor canónico, módulo backend, complejidad y prioridad MVP:

| # | Nombre | Actor canónico | Módulo backend | Complejidad | MVP |
|---|--------|----------------|----------------|-------------|-----|
| 1 | Gestionar inmuebles | Administración | `properties` | Baja | ★ |
| 2 | Dividir inmuebles | Arquitecto / Ing. Civil | `properties` | Media | ★ |
| 3 | Fusionar inmuebles | Arquitecto / Ing. Civil | `properties` | Media | ★ |
| 4 | Gestionar planos vivienda modelo | Arquitecto + Ing. Civil | `blueprints` | Alta (colab) | ★ |
| 5 | Actualizar planos vivienda modelo | Arquitecto / Ing. Civil | `blueprints` | Media | ★ |
| 6 | Gestionar clientes | Secretaría | `clients` | Baja | ★ |
| 7 | Gestionar reunión con cliente | Secretaría | `meetings` | Baja | ★ |
| 8 | Gestionar reserva | Vendedor | `reservations` | Media | ★ |
| 9 | Elaborar contrato de venta | Vendedor + Admin | `contracts` | Alta | ★ |
| 10 | Actualizar contrato de venta | Vendedor + Admin | `contracts` | Media | ★ |
| 11 | Gestionar personal del proyecto | Encarg. Proyecto + Contratistas | `staffing` | Media | ★ |
| 12 | Gestionar materiales del proyecto | Encarg. Proyecto | `materials-planning` | Media | ★ |
| 13 | Gestionar pedido/compra materiales | Encarg. Compras | `purchases` | Alta | ★ |
| 14 | Gestionar preliminares obra bruta | Encarg. Proyecto + Ing. Civil | `site-prep` | Media | ★ |
| 15 | Controlar avance obra bruta | Encarg. Proyecto + Contratistas | `progress` | Alta | ★ |
| 16 | Gestionar actividades obra bruta | Encarg. Proyecto | `activities` | Media | ★ |
| 17 | Controlar avance obra fina | Encarg. Proyecto + Contratistas | `progress` | Alta | ★ |
| 18 | Gestionar actividades obra fina | Encarg. Proyecto | `activities` | Media | ★ |
| 19 | Controlar trabajadores en base al avance | Encarg. Proyecto | `workforce` | Alta | ★ |
| 20 | Controlar calidad de obra | Encarg. Control Calidad | `quality` | Alta | ★ |
| 21 | Controlar uso del material | Encarg. Proyecto | `inventory` | Alta | ★ |
| 22 | Gestionar cronograma de avance | Encarg. Proyecto | `schedule` | Alta | ★ |
| 23 | Elaborar presupuesto de avance | Encarg. Presupuesto | `budget` | Alta | ★ |
| 24 | Reporte control de calidad | Encarg. Control Calidad | `reports` | Media | ★ |
| 25 | Reporte avance de obra | Ingeniero / Encarg. Proyecto | `reports` | Media | ★ |
| 26 | Reporte material según avance | Encarg. Proyecto | `reports` | Media | ★ |
| 27 | Reporte mano de obra | Encarg. Proyecto | `reports` | Media | ★ |
| 28 | Reporte cronograma | Encarg. Proyecto | `reports` | Media | ★ |
| 29 | Reporte presupuesto | Encarg. Presupuesto | `reports` | Media | ★ |

---

## 4. Casos de Uso FALTANTES (Críticos para Backend Funcional)

Implícitos en la prosa del documento original pero nunca formalizados. Sin estos, el sistema **no funciona**:

| # | Nombre | Justificación |
|---|--------|---------------|
| **30** | **Autenticación y gestión de sesiones** | 14 actores no pueden coexistir sin login. Sin esto el resto colapsa. |
| **31** | **Gestionar usuarios y roles (RBAC)** | Crear/dar de baja usuarios, asignar roles, revocar permisos. |
| **32** | **Verificar capacidad crediticia bancaria** ⚠️ MOCK | Mencionado en sec. 4.2 Relaciones, no en CUs. Define si la venta procede. **Implementación: módulo `credit-checks` con `BankAdapter` interface; entrega trae `MockBankAdapter` que devuelve aprobaciones simuladas. Adaptador real (REST/SOAP del banco) se conecta luego.** |
| **33** | **Gestionar pagos del cliente (cuotas/desembolsos)** ⚠️ MOCK PARCIAL | Recibir desembolsos bancarios + pagos cliente. **Pagos manuales (registro de transferencia/efectivo): reales. Desembolsos bancarios automáticos: mock (botón "simular desembolso") para la presentación.** |
| **34** | **Recibir materiales (≠ pedir)** | Pedido envía orden; recepción confirma llegada + actualiza stock real. CU#13 sólo cubre pedido. |
| **35** | **Gestionar proveedores** | Mencionado como actor, no como CU. Alta proveedor, evaluación, catálogo. |
| **36** | **Gestionar catálogo de materiales** | Catálogo central de materiales (independiente de cada proyecto), con precio referencial. |
| **37** | **Registrar asistencia diaria de trabajadores** | CU#19 menciona "control de asistencia" sin formalizar el registro diario. |
| **38** | **Gestionar entrega final del inmueble** | Mencionado como final del flujo, nunca como CU. Acta entrega, garantías. |
| **39** | **Notificaciones (email/in-app)** | "Envía recibo por correo" mencionado en CU#8 sin servicio definido. |
| **40** | **Gestionar versiones de planos / contratos** | Colaboración multi-usuario requiere versionado explícito. |
| **41** | **Auditoría (audit log)** | Quién modificó qué y cuándo. Imprescindible para contratos, presupuestos, calidad. |

**Total final propuesto: 41 casos de uso** (29 originales corregidos + 12 nuevos).

---

## 5. Modelo de Dominio (Entidades Centrales)

### 5.1 Diagrama conceptual (texto)

```
User ──< RoleAssignment >── Role ──< Permission

Client ──< Meeting
Client ──< Reservation >── Property
Client ──< Contract >── Property
Client ──< CreditCheck

Property (lote|casa|depto|duplex)
  ├──< PropertyDivision  (1 lote → N unidades)
  ├──< PropertyMerge     (N inmuebles → 1)
  └──── BlueprintModel (vivienda modelo)
              └──< BlueprintVersion (versiones)
                        └──< BlueprintInstallation (eléctrica/plomería/etc.)

Project (= obra de un inmueble vendido)
  ├──< Stage (preliminares, obra_bruta, obra_fina, entrega)  [state machine]
  ├──< Activity (albañilería/electricidad/plomería/...)
  │       └──< ActivityProgress (avance %, fecha, evidencia foto)
  ├──< StaffAssignment ── Worker (interno) / Contractor (externo)
  ├──< MaterialRequirement (planificado)
  │       └──< MaterialUsage (consumo real)
  ├──< PurchaseOrder ── Supplier
  │       └──< PurchaseOrderLine ── Material
  │       └──< MaterialReception
  ├──< QualityInspection
  │       └──< QualityFinding (no conformidad)
  ├──< ScheduleItem (Gantt)
  ├──< BudgetLine (planificado vs ejecutado)
  ├──< Payment (desembolso banco / pago cliente)
  └──< Delivery (entrega final)

Document (planos, contratos PDF, recibos, fotos) — polymorphic
Notification ── User
AuditLog (poly) — User, action, entity, before, after, timestamp
```

### 5.2 Entidades clave — atributos esenciales

**User**
- id (uuid), email (unique), passwordHash, fullName, phone, isActive, createdAt
- Relación: tiene N RoleAssignment

**Role**
- id, code (enum: ADMIN, SECRETARIA, GERENTE, INGENIERO, ARQUITECTO, OBRERO, PROVEEDOR, ENCARG_PROYECTO, ENCARG_CALIDAD, CONTRATISTA, ENCARG_PRESUPUESTO, ENCARG_COMPRAS, CLIENTE, VENDEDOR, SUPERVISOR)
- name, description

**Property**
- id, code (auto), type (LOTE|CASA|DEPTO|DUPLEX), address, zone, m2, status (DISPONIBLE|RESERVADO|VENDIDO|EN_CONSTRUCCION|ENTREGADO), parentPropertyId (para divisiones)
- modelBlueprintId (FK opcional a BlueprintModel)
- createdAt, updatedAt

**Client**
- id, ci (unique), firstName, lastName, phone, email, source (red social), status (LEAD|PROSPECTO|RESERVADO|FIRMADO|ENTREGADO)
- userId (FK nullable — si el cliente tiene login)

**Reservation**
- id, propertyId, clientId, depositAmount, depositCurrency (Bs), validityDays, reservationDate, expiresAt, status (ACTIVA|VENCIDA|CONVERTIDA|CANCELADA), refundConditions (text)
- receiptDocumentId (FK Document)

**Contract**
- id, propertyId, clientId, version (int), totalAmount, deliveryDeadline, signedDate, status (BORRADOR|REVISION|FIRMADO|MODIFICADO|RESCINDIDO), specialClauses (text/jsonb)
- previousContractId (FK self — para historial)
- contractDocumentId (FK Document)

**Project**
- id, propertyId (1:1 con inmueble vendido), contractId, code, startDate, endDate, currentStage (enum), status (PLANIFICADO|EN_EJECUCION|PAUSADO|FINALIZADO|CANCELADO)
- projectManagerId (FK User)
- qualityManagerId (FK User)
- budgetManagerId (FK User)

**Activity**
- id, projectId, stage (BRUTA|FINA), category (ALBAÑILERIA|ELECTRICIDAD|PLOMERIA|CARPINTERIA|VIDRIERIA|HERRERIA|MUEBLES|JARDINERIA|PINTURA|ACABADOS)
- name, plannedStart, plannedEnd, actualStart, actualEnd
- plannedQuantity, actualQuantity, unit, unitPrice, totalPlannedCost, totalActualCost
- contractorId (FK User/Contractor)
- weight (peso ponderado para cálculo de %)
- status (PENDIENTE|EN_CURSO|TERMINADA|BLOQUEADA)

**ActivityProgress**
- id, activityId, reportDate, percentComplete (0-100), quantityCompleted, reportedBy (FK User), notes, photoDocumentIds[]

**Material** (catálogo)
- id, code, name, unit, referencePrice, category, description, isActive

**MaterialRequirement** (por proyecto)
- id, projectId, materialId, plannedQuantity, plannedUnitPrice, plannedTotal

**MaterialUsage**
- id, projectId, materialId, quantityUsed, usageDate, activityId (FK), reportedBy

**PurchaseOrder**
- id, projectId, supplierId, orderDate, status (BORRADOR|APROBADA|ENVIADA|RECIBIDA_PARCIAL|RECIBIDA_TOTAL|CANCELADA), totalAmount, currency
- approvedBy (FK User), approvedAt, sentAt

**PurchaseOrderLine**
- id, purchaseOrderId, materialId, quantity, unitPrice, lineTotal

**MaterialReception**
- id, purchaseOrderId, receivedDate, receivedBy, quantityReceived, qualityNotes
- updates stock + closes/partials the PO

**QualityInspection**
- id, projectId, inspectionDate, inspectorId (FK User), stage, scope (description)

**QualityFinding**
- id, inspectionId, severity (LEVE|MEDIA|GRAVE|CRITICA), description, correctiveAction, status (ABIERTA|EN_CORRECCION|RESUELTA|RECHAZADA), targetDate, closedDate

**ScheduleItem** (Gantt)
- id, projectId, name, plannedStart, plannedEnd, actualStart, actualEnd, dependencies[] (array of ScheduleItem ids), activityId (nullable)

**BudgetLine**
- id, projectId, category (MATERIAL|MANO_OBRA|EQUIPO|SUBCONTRATO|GENERAL), description, plannedAmount, actualAmount, variance (computed)

**Payment**
- id, projectId, type (DESEMBOLSO_BANCO|PAGO_CLIENTE|PAGO_PROVEEDOR|PAGO_CONTRATISTA), amount, currency, paymentDate, reference, documentId

**Worker / Contractor**
- id, type (INTERNO|EXTERNO), userId, speciality, dailyRate, hourlyRate, isActive
- contractorCompany (nullable, para externos)

**StaffAssignment**
- id, projectId, workerId, role, startDate, endDate, isActive

**Attendance**
- id, workerId, projectId, date, hoursWorked, status (PRESENTE|FALTA|PERMISO|VACACION)

**Document** (polimórfico)
- id, ownerType (PROPERTY|BLUEPRINT|CONTRACT|RESERVATION|PROGRESS|QUALITY|...), ownerId, filename, mimeType, sizeBytes, storagePath, version, uploadedBy, uploadedAt
- isCurrentVersion (boolean para versionado)

**Notification**
- id, userId, type, title, body, channels[] (EMAIL|IN_APP|SMS), readAt, sentAt, payload (jsonb)

**AuditLog**
- id, userId, action (CREATE|UPDATE|DELETE|APPROVE|...), entityType, entityId, beforeJson, afterJson, ip, userAgent, timestamp

---

## 6. Matriz RBAC (Rol × Caso de Uso)

Leyenda: **C**=Create, **R**=Read, **U**=Update, **D**=Delete, **A**=Approve, **—**=sin acceso

| CU | Admin | Gerente | Secretaria | Vendedor | Ing | Arq | EncargProy | EncargCal | EncargPres | EncargComp | Contratista | Obrero | Cliente | Proveedor |
|----|:-----:|:-------:|:----------:|:--------:|:---:|:---:|:----------:|:---------:|:----------:|:----------:|:-----------:|:------:|:-------:|:---------:|
| 1 Gestionar inmuebles | CRUD | R | CRUD | R | R | R | R | R | R | — | — | — | — | — |
| 2 Dividir | R | R | — | — | CU | CU | R | — | — | — | — | — | — | — |
| 3 Fusionar | R | R | — | — | CU | CU | R | — | — | — | — | — | — | — |
| 4 Crear planos | R | R | — | — | CU | CU | R | — | — | — | — | — | — | — |
| 5 Actualizar planos | R | R | — | — | CU | CU | R | — | — | — | — | — | — | — |
| 6 Clientes | R | R | CRUD | CRU | — | — | — | — | — | — | — | — | R(self) | — |
| 7 Reuniones | R | R | CRUD | CR | — | — | — | — | — | — | — | — | R(self) | — |
| 8 Reservas | R | R | R | CRUD | — | — | — | — | — | — | — | — | R(self) | — |
| 9 Contrato (crear) | A | A | R | C | — | — | — | — | — | — | — | — | R(self) | — |
| 10 Contrato (actualizar) | A | A | R | CU | — | — | — | — | — | — | — | — | R(self) | — |
| 11 Personal proyecto | R | R | — | — | R | R | CRUD | — | — | — | R(self) | R(self) | — | — |
| 12 Materiales proyecto | R | R | — | — | R | R | CRUD | — | R | R | — | — | — | — |
| 13 Pedido compra | A | A | — | — | — | — | R | — | R | CRUD | — | — | — | R(own) |
| 14 Preliminares | R | R | — | — | CU | — | CRUD | — | — | — | — | — | — | — |
| 15 Avance obra bruta | R | R | — | — | R | — | RU | R | — | — | RU(own) | RU(own) | R(self) | — |
| 16 Actividades obra bruta | R | R | — | — | R | — | CRUD | — | — | — | R | — | — | — |
| 17 Avance obra fina | R | R | — | — | R | — | RU | R | — | — | RU(own) | RU(own) | R(self) | — |
| 18 Actividades obra fina | R | R | — | — | R | — | CRUD | — | — | — | R | — | — | — |
| 19 Trabajadores avance | R | R | — | — | R | — | CRUD | — | — | — | R(self) | R(self) | — | — |
| 20 Calidad | R | R | — | — | R | — | R | CRUD | — | — | — | — | — | — |
| 21 Uso material | R | R | — | — | R | — | CRUD | — | R | R | RU(own) | — | — | — |
| 22 Cronograma | R | R | — | — | R | — | CRUD | R | R | — | — | — | — | — |
| 23 Presupuesto | R | A | — | — | R | — | R | — | CRUD | — | — | — | — | — |
| 24 Rep. calidad | R | R | — | — | R | — | R | CR | — | — | — | — | — | — |
| 25 Rep. avance | R | R | — | — | CR | — | CR | R | R | — | — | — | R(self) | — |
| 26 Rep. material | R | R | — | — | — | — | CR | — | R | R | — | — | — | — |
| 27 Rep. mano obra | R | R | — | — | — | — | CR | — | R | — | — | — | — | — |
| 28 Rep. cronograma | R | R | — | — | — | — | CR | R | R | — | — | — | — | — |
| 29 Rep. presupuesto | R | R | — | — | — | — | R | — | CR | — | — | — | — | — |
| **30 Auth login** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **31 Usuarios/roles** | CRUD | R | — | — | — | — | — | — | — | — | — | — | — | — |
| **32 Crédito banco** | R | R | R | CR | — | — | — | — | R | — | — | — | R(self) | — |
| **33 Pagos** | A | A | R | R | — | — | R | — | CRUD | — | — | — | R(self) | — |
| **34 Recibir materiales** | R | R | — | — | — | — | R | — | — | CRU | — | — | — | R(own) |
| **35 Proveedores** | CRUD | R | — | — | — | — | R | — | — | CRU | — | — | — | — |
| **36 Catálogo materiales** | CRUD | R | — | — | — | — | R | — | R | CRU | — | — | — | — |
| **37 Asistencia** | R | R | — | — | — | — | CRU | — | — | — | CR(own team) | R(self) | — | — |
| **38 Entrega final** | A | A | — | — | R | R | CRU | R | — | — | — | — | R(self) | — |
| **39 Notificaciones** | R(all) | R(self) | R(self) | R(self) | R(self) | R(self) | R(self) | R(self) | R(self) | R(self) | R(self) | R(self) | R(self) | R(self) |
| **40 Versiones planos/contratos** | R | R | — | R | R | R | R | — | — | — | — | — | — | — |
| **41 Auditoría** | R | R | — | — | — | — | — | — | — | — | — | — | — | — |

> Filtros adicionales: `R(self)` = solo registros propios. `R(own)` = solo registros donde el rol es dueño/asignado. `R(own team)` = team del contratista.

---

## 7. Máquinas de Estado (los 5 críticos)

### 7.1 Inmueble (Property)

```
DISPONIBLE ──(crear reserva)──> RESERVADO
RESERVADO  ──(firmar contrato)──> VENDIDO
RESERVADO  ──(vencimiento|cancelación)──> DISPONIBLE
VENDIDO    ──(inicio obra)──> EN_CONSTRUCCION
EN_CONSTRUCCION ──(entrega final)──> ENTREGADO
ENTREGADO  ── [estado terminal]
```

### 7.2 Cliente

```
LEAD ──(registro)──> PROSPECTO
PROSPECTO ──(firma reserva)──> RESERVADO
RESERVADO ──(firma contrato)──> FIRMADO
FIRMADO   ──(entrega)──> ENTREGADO
LEAD/PROSPECTO/RESERVADO ──(cancela)──> CERRADO
```

### 7.3 Reserva

```
ACTIVA ──(firma contrato)──> CONVERTIDA   [terminal]
ACTIVA ──(vence sin contrato)──> VENCIDA  [reembolso según política]
ACTIVA ──(cliente cancela)──> CANCELADA   [reembolso parcial/total]
```

### 7.4 Contrato

```
BORRADOR ──(genera)──> REVISION
REVISION ──(aprueba ambas partes)──> FIRMADO
FIRMADO  ──(necesita cambio)──> MODIFICADO  (genera nueva version, mantiene historial)
MODIFICADO ──(aprueba)──> FIRMADO
* ──(ruptura)──> RESCINDIDO  [terminal, requiere acción legal]
```

### 7.5 Proyecto

```
PLANIFICADO ──(preliminares completos)──> EN_EJECUCION (stage=BRUTA)
EN_EJECUCION(BRUTA) ──(obra bruta 100%)──> EN_EJECUCION(FINA)
EN_EJECUCION(FINA)  ──(obra fina 100%)──> EN_EJECUCION(ENTREGA)
EN_EJECUCION(ENTREGA) ──(acta entrega firmada)──> FINALIZADO
* ──(decisión gerencia)──> PAUSADO ──(resume)──> EN_EJECUCION
* ──(decisión gerencia/legal)──> CANCELADO
```

### 7.6 Orden de Compra

```
BORRADOR ──(envía aprobación)──> EN_APROBACION
EN_APROBACION ──(aprueba)──> APROBADA
APROBADA ──(envía proveedor)──> ENVIADA
ENVIADA  ──(recepción parcial)──> RECIBIDA_PARCIAL
RECIBIDA_PARCIAL ──(recepción final)──> RECIBIDA_TOTAL
* ──(cancelación)──> CANCELADA
```

---

## 8. Requisitos No Funcionales — Cuantificados

| Categoría | Requisito | Valor objetivo |
|-----------|-----------|----------------|
| **Concurrencia** | Usuarios simultáneos pico | 200 |
| **Latencia** | P95 endpoints CRUD | < 300 ms |
| **Latencia** | P95 reportes complejos | < 3 s (asíncronos > 30s) |
| **Throughput** | Requests/segundo sostenido | 100 RPS |
| **Disponibilidad** | SLA mensual | 99.5% |
| **Retención** | Logs de auditoría | 7 años (contratos requieren legal) |
| **Retención** | Backups DB | Diario 30 días, semanal 1 año |
| **RPO** | Punto recuperación | < 24 h |
| **RTO** | Tiempo recuperación | < 4 h |
| **Seguridad** | Auth | JWT (access 15min) + refresh token (7 días) |
| **Seguridad** | Passwords | bcrypt cost 12, complejidad min 12 chars |
| **Seguridad** | Transport | TLS 1.3 obligatorio |
| **Seguridad** | Datos sensibles | CI, dirección, montos → encriptados en reposo (pgcrypto / column-level) |
| **Seguridad** | Rate limit | 100 req/min por IP, 1000 req/min por usuario auth |
| **Auditoría** | Cobertura | Toda mutación de Contract, Budget, Payment, Property, Project |
| **Móvil** | Soporte offline | Sí, módulo `progress` y `attendance` con sync diferido |
| **i18n** | Idiomas | Español (default), preparado para inglés |
| **Moneda** | Currency | Bs. (BOB) principal, USD multi-moneda opcional |
| **Storage** | Documentos | S3-compatible (AWS S3 o MinIO local), límite 50 MB/archivo |
| **Storage** | Imágenes obra | 10 MB/foto, compresión auto a WebP |
| **Email** | Recibos/notificaciones | Cola asíncrona (BullMQ + Redis), retry 3x |
| **Escalado** | Horizontal | Stateless API + sticky session opcional para WebSockets |

---

## 9. Arquitectura Backend — NestJS Modular

### 9.1 Estructura de módulos

```
src/
├── main.ts                          # bootstrap
├── app.module.ts                    # root module
├── common/                          # shared
│   ├── decorators/                  # @Roles(), @CurrentUser(), @Public()
│   ├── filters/                     # exception filters
│   ├── guards/                      # JwtAuthGuard, RolesGuard, OwnershipGuard
│   ├── interceptors/                # AuditLogInterceptor, TransformInterceptor
│   ├── pipes/                       # ValidationPipe global
│   └── dto/                         # base DTOs
├── config/                          # config service (env vars)
├── prisma/                          # PrismaService, schema.prisma
├── auth/                            # CU#30 Auth (login, refresh, logout)
├── users/                           # CU#31 Users + roles
├── properties/                      # CU#1,2,3
├── blueprints/                      # CU#4,5,40 (versionado)
├── clients/                         # CU#6
├── meetings/                        # CU#7
├── credit-checks/                   # CU#32
├── reservations/                    # CU#8
├── contracts/                       # CU#9,10,40 (versionado)
├── projects/                        # base proyecto (CRUD)
├── staffing/                        # CU#11
├── workers/                         # CU#37 attendance
├── workforce-control/               # CU#19
├── materials-catalog/               # CU#36
├── materials-planning/              # CU#12
├── suppliers/                       # CU#35
├── purchases/                       # CU#13,34
├── inventory/                       # CU#21
├── site-prep/                       # CU#14
├── activities/                      # CU#16,18 (unificado por stage)
├── progress/                        # CU#15,17 (unificado por stage)
├── quality/                         # CU#20
├── schedule/                        # CU#22
├── budget/                          # CU#23
├── payments/                        # CU#33
├── delivery/                        # CU#38
├── reports/                         # CU#24,25,26,27,28,29
├── notifications/                   # CU#39
├── documents/                       # storage abstracto (S3/MinIO)
├── audit/                           # CU#41
└── jobs/                            # BullMQ workers (email, report generation, etc.)
```

### 9.2 Capas dentro de cada módulo

```
<feature>/
├── <feature>.module.ts        # NestJS module
├── <feature>.controller.ts    # HTTP layer (REST)
├── <feature>.service.ts       # business logic
├── <feature>.repository.ts    # data access (wraps Prisma)
├── dto/                       # request/response DTOs con class-validator
├── entities/                  # types
├── events/                    # eventos de dominio
└── tests/
```

### 9.3 Decisiones técnicas

| Aspecto | Decisión | Justificación |
|---------|----------|---------------|
| ORM | **Prisma** | Type-safe, migrations, schema único, ya elegido |
| Validación | **class-validator + class-transformer** | Estándar NestJS, decoradores en DTOs |
| Auth | **JWT (access + refresh) con Passport** | Stateless, escalable |
| Authz | **CASL** o guards custom | RBAC + ABAC para filtros `R(self)`, `R(own)` |
| Cache | **Redis (ioredis)** | Sessions, rate-limit, queue, pub/sub |
| Queue | **BullMQ** | Emails, generación reportes, notificaciones |
| Tiempo real | **Socket.IO** (NestJS Gateway) | Avance de obra en vivo, planos colaborativos |
| Logging | **Pino** | JSON estructurado, performance |
| API docs | **Swagger/OpenAPI** auto desde decoradores | Frontend genera client |
| Tests | **Jest** unit + **Supertest** e2e | Estándar NestJS |
| Migrations | **Prisma Migrate** | Versionado en repo |
| Seeds | **Prisma seed** | Datos iniciales: roles, materiales catálogo, admin user |
| Files | **AWS S3** o **MinIO** vía `@aws-sdk/client-s3` | Abstracto detrás de `DocumentsService` |
| PDF | **PDFKit** o **Puppeteer** | Recibos reserva, contratos, reportes |
| Excel | **ExcelJS** | Export reportes |
| Email | **Nodemailer** + provider configurable | SMTP local o SendGrid/SES |
| i18n | **nestjs-i18n** | ES/EN |
| Health | **@nestjs/terminus** | /health, /readiness |
| Métricas | **Prometheus** (`prom-client`) | Observabilidad |
| Containerización | **Docker + docker-compose** | API + Postgres + Redis + MinIO en dev |

### 9.4 Estrategia de concurrencia (planos colaborativos CU#4)

Tres opciones evaluadas:

| Opción | Pros | Contras | Decisión |
|--------|------|---------|----------|
| Lock pesimista (DB row lock) | Simple, sin conflictos | UX malo si arq y eng intentan a la vez | ✗ |
| Optimistic locking (version column + check on save) | Sin bloqueo, conflictos resolubles en UI | Requiere merge manual al conflicto | **✓ MVP** |
| CRDT / OT (Yjs / Automerge) | UX excelente (Figma-like) | Complejidad alta, no necesario para datos estructurados | ✗ (over-eng para MVP) |

**Decisión MVP:** Optimistic locking con columna `version` (int) en `Blueprint`, `Contract`, `Budget`. WebSocket notifica a otros usuarios "se ha actualizado, refresca".

---

## 10. Schema Prisma (Esqueleto)

> Archivo `prisma/schema.prisma` — esqueleto inicial, refinar al implementar.

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

// ======== AUTH & USERS ========
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  fullName     String
  phone        String?
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  roleAssignments RoleAssignment[]
  notifications   Notification[]
  auditLogs       AuditLog[]
}

enum RoleCode {
  ADMIN
  GERENTE
  SECRETARIA
  VENDEDOR
  INGENIERO
  ARQUITECTO
  ENCARG_PROYECTO
  ENCARG_CALIDAD
  ENCARG_PRESUPUESTO
  ENCARG_COMPRAS
  CONTRATISTA
  OBRERO
  PROVEEDOR
  CLIENTE
  SUPERVISOR
}

model Role {
  id          String  @id @default(uuid())
  code        RoleCode @unique
  name        String
  description String?
  assignments RoleAssignment[]
}

model RoleAssignment {
  id     String @id @default(uuid())
  userId String
  roleId String
  user   User @relation(fields: [userId], references: [id])
  role   Role @relation(fields: [roleId], references: [id])
  @@unique([userId, roleId])
}

// ======== INMUEBLES ========
enum PropertyType { LOTE CASA DEPTO DUPLEX }
enum PropertyStatus { DISPONIBLE RESERVADO VENDIDO EN_CONSTRUCCION ENTREGADO }

model Property {
  id            String         @id @default(uuid())
  code          String         @unique
  type          PropertyType
  address       String
  zone          String
  m2            Decimal
  status        PropertyStatus @default(DISPONIBLE)
  parentPropertyId String?     // for divisions
  parentProperty   Property?   @relation("PropertyHierarchy", fields: [parentPropertyId], references: [id])
  childProperties  Property[]  @relation("PropertyHierarchy")
  modelBlueprintId String?
  modelBlueprint   BlueprintModel? @relation(fields: [modelBlueprintId], references: [id])
  reservations  Reservation[]
  contracts     Contract[]
  project       Project?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// ======== PLANOS ========
model BlueprintModel {
  id        String   @id @default(uuid())
  name      String
  description String?
  properties Property[]
  versions  BlueprintVersion[]
  createdAt DateTime @default(now())
}

model BlueprintVersion {
  id              String @id @default(uuid())
  modelId         String
  versionNumber   Int
  documentId      String?  // FK Document (file)
  arquitectId     String   // FK User
  engineerId      String   // FK User
  architecturalDesign Json // detalles, distribución espacios
  structuralCalcs Json
  estimatedBudget Decimal?
  isCurrent       Boolean  @default(true)
  version         Int      @default(1) // optimistic lock
  createdAt       DateTime @default(now())
  model           BlueprintModel @relation(fields: [modelId], references: [id])
  installations   BlueprintInstallation[]
  @@unique([modelId, versionNumber])
}

enum InstallationType { ELECTRICA PLOMERIA CARPINTERIA VIDRIERIA HERRERIA }
model BlueprintInstallation {
  id          String @id @default(uuid())
  versionId   String
  type        InstallationType
  spec        Json
  version     BlueprintVersion @relation(fields: [versionId], references: [id])
}

// ======== CLIENTES Y VENTAS ========
enum ClientStatus { LEAD PROSPECTO RESERVADO FIRMADO ENTREGADO CERRADO }

model Client {
  id        String       @id @default(uuid())
  ci        String       @unique
  firstName String
  lastName  String
  phone     String
  email     String?
  source    String?      // red social
  status    ClientStatus @default(LEAD)
  userId    String?      @unique
  user      User?        @relation(fields: [userId], references: [id])
  meetings  Meeting[]
  reservations Reservation[]
  contracts Contract[]
  creditChecks CreditCheck[]
  createdAt DateTime @default(now())
}

model Meeting {
  id        String   @id @default(uuid())
  clientId  String
  scheduledAt DateTime
  durationMin Int
  notes     String?
  status    String   @default("PROGRAMADA")
  client    Client   @relation(fields: [clientId], references: [id])
}

model CreditCheck {
  id        String   @id @default(uuid())
  clientId  String
  bankName  String
  approvedAmount Decimal?
  status    String   // PENDIENTE|APROBADO|RECHAZADO
  checkDate DateTime
  notes     String?
  client    Client   @relation(fields: [clientId], references: [id])
}

enum ReservationStatus { ACTIVA VENCIDA CONVERTIDA CANCELADA }
model Reservation {
  id                String  @id @default(uuid())
  propertyId        String
  clientId          String
  depositAmount     Decimal
  currency          String  @default("BOB")
  validityDays      Int
  reservationDate   DateTime @default(now())
  expiresAt         DateTime
  status            ReservationStatus @default(ACTIVA)
  refundConditions  String?
  receiptDocumentId String?
  property          Property @relation(fields: [propertyId], references: [id])
  client            Client   @relation(fields: [clientId], references: [id])
}

enum ContractStatus { BORRADOR REVISION FIRMADO MODIFICADO RESCINDIDO }
model Contract {
  id                String @id @default(uuid())
  propertyId        String
  clientId          String
  version           Int    @default(1)
  totalAmount       Decimal
  currency          String @default("BOB")
  deliveryDeadline  DateTime
  signedDate        DateTime?
  status            ContractStatus @default(BORRADOR)
  specialClauses    Json?
  previousContractId String?
  previousContract  Contract? @relation("ContractHistory", fields: [previousContractId], references: [id])
  nextContracts     Contract[] @relation("ContractHistory")
  contractDocumentId String?
  optimisticVersion Int    @default(1)
  property          Property @relation(fields: [propertyId], references: [id])
  client            Client   @relation(fields: [clientId], references: [id])
  project           Project?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

// ======== PROYECTO Y OBRA ========
enum ProjectStatus { PLANIFICADO EN_EJECUCION PAUSADO FINALIZADO CANCELADO }
enum ProjectStage  { PRELIMINARES OBRA_BRUTA OBRA_FINA ENTREGA }
enum ActivityStage { BRUTA FINA }
enum ActivityCategory {
  ALBANILERIA ELECTRICIDAD PLOMERIA CARPINTERIA VIDRIERIA HERRERIA
  MUEBLES JARDINERIA PINTURA ACABADOS PRELIMINARES
}
enum ActivityStatus { PENDIENTE EN_CURSO TERMINADA BLOQUEADA }

model Project {
  id            String   @id @default(uuid())
  code          String   @unique
  propertyId    String   @unique
  contractId    String   @unique
  startDate     DateTime
  endDate       DateTime?
  currentStage  ProjectStage @default(PRELIMINARES)
  status        ProjectStatus @default(PLANIFICADO)
  projectManagerId  String
  qualityManagerId  String?
  budgetManagerId   String?
  property      Property @relation(fields: [propertyId], references: [id])
  contract      Contract @relation(fields: [contractId], references: [id])
  activities    Activity[]
  staffAssignments  StaffAssignment[]
  materialRequirements MaterialRequirement[]
  materialUsages    MaterialUsage[]
  purchaseOrders    PurchaseOrder[]
  qualityInspections QualityInspection[]
  scheduleItems     ScheduleItem[]
  budgetLines       BudgetLine[]
  payments          Payment[]
  delivery          Delivery?
  preliminaries     Preliminary[]
  attendances       Attendance[]
}

model Preliminary {
  id          String @id @default(uuid())
  projectId   String
  type        String  // ESTUDIO_SUELO|TOPOGRAFIA|INSTALACION_FAENAS|SERVICIOS_BASICOS
  description String
  completedAt DateTime?
  notes       String?
  project     Project @relation(fields: [projectId], references: [id])
}

model Activity {
  id            String @id @default(uuid())
  projectId     String
  stage         ActivityStage
  category      ActivityCategory
  name          String
  plannedStart  DateTime
  plannedEnd    DateTime
  actualStart   DateTime?
  actualEnd     DateTime?
  plannedQuantity Decimal?
  actualQuantity  Decimal @default(0)
  unit          String?
  unitPrice     Decimal?
  totalPlannedCost Decimal?
  totalActualCost  Decimal @default(0)
  contractorId  String?
  weight        Decimal @default(1) // peso ponderado
  status        ActivityStatus @default(PENDIENTE)
  project       Project @relation(fields: [projectId], references: [id])
  progresses    ActivityProgress[]
}

model ActivityProgress {
  id           String @id @default(uuid())
  activityId   String
  reportDate   DateTime @default(now())
  percentComplete Decimal // 0..100
  quantityCompleted Decimal?
  reportedBy   String
  notes        String?
  activity     Activity @relation(fields: [activityId], references: [id])
  photoDocs    Document[] @relation("ProgressPhotos")
}

// ======== MATERIALES & COMPRAS ========
model Material {
  id              String @id @default(uuid())
  code            String @unique
  name            String
  unit            String
  referencePrice  Decimal
  category        String
  description     String?
  isActive        Boolean @default(true)
  requirements    MaterialRequirement[]
  usages          MaterialUsage[]
  orderLines      PurchaseOrderLine[]
}

model Supplier {
  id        String @id @default(uuid())
  name      String
  contact   String?
  phone     String?
  email     String?
  taxId     String?
  rating    Int? // 1..5
  isActive  Boolean @default(true)
  orders    PurchaseOrder[]
}

model MaterialRequirement {
  id          String @id @default(uuid())
  projectId   String
  materialId  String
  plannedQuantity Decimal
  plannedUnitPrice Decimal
  plannedTotal     Decimal
  project     Project  @relation(fields: [projectId], references: [id])
  material    Material @relation(fields: [materialId], references: [id])
  @@unique([projectId, materialId])
}

model MaterialUsage {
  id          String @id @default(uuid())
  projectId   String
  materialId  String
  quantityUsed Decimal
  usageDate   DateTime @default(now())
  activityId  String?
  reportedBy  String
  project     Project  @relation(fields: [projectId], references: [id])
  material    Material @relation(fields: [materialId], references: [id])
}

enum POStatus { BORRADOR EN_APROBACION APROBADA ENVIADA RECIBIDA_PARCIAL RECIBIDA_TOTAL CANCELADA }
model PurchaseOrder {
  id          String @id @default(uuid())
  projectId   String
  supplierId  String
  orderDate   DateTime @default(now())
  status      POStatus @default(BORRADOR)
  totalAmount Decimal  @default(0)
  currency    String   @default("BOB")
  approvedBy  String?
  approvedAt  DateTime?
  sentAt      DateTime?
  project     Project  @relation(fields: [projectId], references: [id])
  supplier    Supplier @relation(fields: [supplierId], references: [id])
  lines       PurchaseOrderLine[]
  receptions  MaterialReception[]
}

model PurchaseOrderLine {
  id              String @id @default(uuid())
  purchaseOrderId String
  materialId      String
  quantity        Decimal
  unitPrice       Decimal
  lineTotal       Decimal
  purchaseOrder   PurchaseOrder @relation(fields: [purchaseOrderId], references: [id])
  material        Material      @relation(fields: [materialId], references: [id])
}

model MaterialReception {
  id              String @id @default(uuid())
  purchaseOrderId String
  receivedDate    DateTime @default(now())
  receivedBy      String
  quantityReceived Decimal
  qualityNotes    String?
  purchaseOrder   PurchaseOrder @relation(fields: [purchaseOrderId], references: [id])
}

// ======== PERSONAL ========
enum WorkerType { INTERNO EXTERNO }
model Worker {
  id           String @id @default(uuid())
  type         WorkerType
  userId       String? @unique
  speciality   String
  dailyRate    Decimal?
  hourlyRate   Decimal?
  isActive     Boolean @default(true)
  contractorCompany String?
  staffAssignments StaffAssignment[]
  attendances  Attendance[]
}

model StaffAssignment {
  id         String @id @default(uuid())
  projectId  String
  workerId   String
  role       String
  startDate  DateTime
  endDate    DateTime?
  isActive   Boolean @default(true)
  project    Project @relation(fields: [projectId], references: [id])
  worker     Worker  @relation(fields: [workerId], references: [id])
}

model Attendance {
  id         String @id @default(uuid())
  workerId   String
  projectId  String
  date       DateTime
  hoursWorked Decimal
  status     String // PRESENTE|FALTA|PERMISO|VACACION
  project    Project @relation(fields: [projectId], references: [id])
  worker     Worker  @relation(fields: [workerId], references: [id])
  @@unique([workerId, projectId, date])
}

// ======== CALIDAD ========
model QualityInspection {
  id           String @id @default(uuid())
  projectId    String
  inspectionDate DateTime @default(now())
  inspectorId  String
  stage        ActivityStage
  scope        String
  project      Project @relation(fields: [projectId], references: [id])
  findings     QualityFinding[]
}

enum FindingSeverity { LEVE MEDIA GRAVE CRITICA }
enum FindingStatus { ABIERTA EN_CORRECCION RESUELTA RECHAZADA }
model QualityFinding {
  id              String @id @default(uuid())
  inspectionId    String
  severity        FindingSeverity
  description     String
  correctiveAction String?
  status          FindingStatus @default(ABIERTA)
  targetDate      DateTime?
  closedDate      DateTime?
  inspection      QualityInspection @relation(fields: [inspectionId], references: [id])
}

// ======== CRONOGRAMA & PRESUPUESTO ========
model ScheduleItem {
  id            String @id @default(uuid())
  projectId     String
  name          String
  plannedStart  DateTime
  plannedEnd    DateTime
  actualStart   DateTime?
  actualEnd     DateTime?
  dependencies  String[] // ids
  activityId    String?
  project       Project @relation(fields: [projectId], references: [id])
}

enum BudgetCategory { MATERIAL MANO_OBRA EQUIPO SUBCONTRATO GENERAL }
model BudgetLine {
  id             String @id @default(uuid())
  projectId      String
  category       BudgetCategory
  description    String
  plannedAmount  Decimal
  actualAmount   Decimal @default(0)
  project        Project @relation(fields: [projectId], references: [id])
}

// ======== PAGOS ========
enum PaymentType { DESEMBOLSO_BANCO PAGO_CLIENTE PAGO_PROVEEDOR PAGO_CONTRATISTA REEMBOLSO }
model Payment {
  id          String @id @default(uuid())
  projectId   String?
  type        PaymentType
  amount      Decimal
  currency    String @default("BOB")
  paymentDate DateTime
  reference   String?
  documentId  String?
  project     Project? @relation(fields: [projectId], references: [id])
}

// ======== ENTREGA ========
model Delivery {
  id          String @id @default(uuid())
  projectId   String @unique
  deliveryDate DateTime
  signedByClient Boolean @default(false)
  signedByCompany Boolean @default(false)
  warrantyMonths Int @default(12)
  notes       String?
  actDocumentId String?
  project     Project @relation(fields: [projectId], references: [id])
}

// ======== DOCUMENTOS, NOTIFICACIONES, AUDITORÍA ========
model Document {
  id          String @id @default(uuid())
  ownerType   String
  ownerId     String
  filename    String
  mimeType    String
  sizeBytes   Int
  storagePath String
  version     Int    @default(1)
  uploadedBy  String
  uploadedAt  DateTime @default(now())
  isCurrentVersion Boolean @default(true)
  progressPhotos ActivityProgress? @relation("ProgressPhotos", fields: [progressPhotoId], references: [id])
  progressPhotoId String?
  @@index([ownerType, ownerId])
}

model Notification {
  id        String @id @default(uuid())
  userId    String
  type      String
  title     String
  body      String
  channels  String[]
  readAt    DateTime?
  sentAt    DateTime?
  payload   Json?
  createdAt DateTime @default(now())
  user      User @relation(fields: [userId], references: [id])
}

model AuditLog {
  id         String @id @default(uuid())
  userId     String?
  action     String
  entityType String
  entityId   String
  beforeJson Json?
  afterJson  Json?
  ip         String?
  userAgent  String?
  timestamp  DateTime @default(now())
  user       User? @relation(fields: [userId], references: [id])
  @@index([entityType, entityId])
  @@index([timestamp])
}
```

---

## 11. Contrato API REST (Overview)

> Convención: prefijo `/api/v1`. Auth: `Authorization: Bearer <jwt>`. Errores RFC 7807 (Problem Details).

### 11.1 Endpoints principales por módulo

| Módulo | Endpoint base | Métodos |
|--------|---------------|---------|
| Auth | `/auth` | POST `/login`, POST `/refresh`, POST `/logout`, GET `/me` |
| Users | `/users` | CRUD + POST `/:id/roles` |
| Properties | `/properties` | CRUD + POST `/:id/divide`, POST `/merge` |
| Blueprints | `/blueprint-models`, `/blueprint-models/:id/versions` | CRUD + POST `/:id/versions/:v/installations` |
| Clients | `/clients` | CRUD |
| Meetings | `/meetings` | CRUD + `?clientId=` |
| CreditChecks | `/credit-checks` | CRUD + POST `/:id/approve` |
| Reservations | `/reservations` | CRUD + POST `/:id/convert-to-contract`, POST `/:id/cancel` |
| Contracts | `/contracts` | CRUD + POST `/:id/sign`, POST `/:id/new-version` |
| Projects | `/projects` | CRUD + POST `/:id/advance-stage`, POST `/:id/pause`, POST `/:id/resume` |
| Preliminaries | `/projects/:id/preliminaries` | CRUD |
| Activities | `/projects/:id/activities` | CRUD + GET `?stage=BRUTA\|FINA` |
| Progress | `/activities/:id/progress` | POST + GET. `/projects/:id/progress-summary` GET |
| Staffing | `/projects/:id/staff` | CRUD |
| Workers | `/workers` | CRUD |
| Attendance | `/attendance` | POST (bulk diario), GET `?projectId=&from=&to=` |
| Suppliers | `/suppliers` | CRUD |
| Materials | `/materials` (catálogo), `/projects/:id/material-requirements` | CRUD |
| Purchases | `/purchase-orders` | CRUD + POST `/:id/approve`, POST `/:id/send`, POST `/:id/receive` |
| Inventory | `/projects/:id/inventory`, `/projects/:id/material-usage` | GET, POST |
| Quality | `/projects/:id/inspections`, `/inspections/:id/findings` | CRUD |
| Schedule | `/projects/:id/schedule` | CRUD |
| Budget | `/projects/:id/budget`, `/projects/:id/budget/lines` | CRUD |
| Payments | `/payments` | CRUD + `?projectId=&type=` |
| Delivery | `/projects/:id/delivery` | GET, POST, PATCH (firmar) |
| Reports | `/reports/:type` | POST (genera async, devuelve jobId), GET `/jobs/:id` (status + download URL) |
| Notifications | `/notifications` | GET + PATCH `/:id/read` |
| Documents | `/documents` | POST (upload), GET `/:id` (signed URL), GET `?ownerType=&ownerId=` |
| Audit | `/audit-logs` | GET (filtrado) |
| Health | `/health`, `/readiness` | GET |

### 11.2 Convenciones

- Paginación: `?page=1&pageSize=20`, response `{ data, meta: { page, pageSize, total, totalPages } }`
- Filtros: query params específicos del recurso (`?status=`, `?projectId=`, `?from=`, `?to=`)
- Sorting: `?sort=field` o `?sort=-field` (desc)
- Soft delete: `DELETE` setea `deletedAt`, no borra físico. Recovery con `POST /:id/restore`
- Versioning API: prefijo `/api/v1`. Breaking changes → `/api/v2`
- Idempotency: POST de cobros/pagos aceptan header `Idempotency-Key`

### 11.3 Eventos WebSocket (NestJS Gateway)

| Canal | Evento | Payload |
|-------|--------|---------|
| `project:{id}` | `progress.updated` | `{ activityId, percent, reportedBy }` |
| `project:{id}` | `stage.changed` | `{ newStage }` |
| `blueprint:{id}` | `version.updated` | `{ newVersion, updatedBy }` |
| `user:{id}` | `notification` | `{ id, title, body }` |
| `project:{id}` | `quality.finding.created` | `{ findingId, severity }` |

---

## 12. Fórmulas Críticas (Que el Documento Omitía)

### 12.1 Cálculo de avance de obra (CU#15, #17)

```
project.progressBruta = Σ(activity.weight × activity.lastReportedPercent) / Σ(activity.weight)
                        para activities donde stage = BRUTA

project.progressFina = idem para stage = FINA

project.overallProgress =
   stage=PRELIMINARES → 0..15% (según preliminaries completadas)
   stage=OBRA_BRUTA   → 15 + (progressBruta × 0.45)  = 15..60%
   stage=OBRA_FINA    → 60 + (progressFina × 0.35)   = 60..95%
   stage=ENTREGA      → 95..100%
```

Pesos por defecto sugeridos (configurables):
- Preliminares: 15%
- Obra bruta: 45%
- Obra fina: 35%
- Entrega: 5%

### 12.2 Desviación de presupuesto

```
budgetLine.variance     = budgetLine.actualAmount - budgetLine.plannedAmount
budgetLine.variancePct  = variance / plannedAmount × 100
project.totalVariance   = Σ(lines.variance)
project.healthBudget    = OK if |variancePct| ≤ 5%, WARN if ≤ 15%, CRITICAL if > 15%
```

### 12.3 Adherencia a cronograma

```
scheduleItem.delayDays = max(0, today - plannedEnd)  si no terminado
project.scheduleHealth = OK si ningún item con delayDays > 7, WARN ≤ 14, CRITICAL > 14
```

### 12.4 Consumo material vs avance

```
expectedUsage = materialRequirement.plannedQuantity × project.overallProgress
actualUsage   = Σ materialUsage.quantityUsed
materialEfficiency = expectedUsage / actualUsage  (≈1 ideal)
```

---

## 13. Recomendaciones para el Frontend

> **Premisa:** el backend expone REST + WebSocket + Swagger/OpenAPI. El frontend tiene libertad de stack, pero estas recomendaciones aseguran encaje natural.

### 13.1 Stack frontend sugerido

| Pieza | Recomendado | Alternativa |
|-------|-------------|-------------|
| Framework | **Next.js 15 (App Router)** + React 19 | Vite + React 19 SPA |
| Lenguaje | TypeScript estricto | — |
| Estilos | **Tailwind CSS v4 + shadcn/ui** | Mantine, MUI |
| Estado server | **TanStack Query (React Query)** | SWR |
| Estado UI | Zustand o Context API según escala | Redux Toolkit |
| Forms | **React Hook Form + Zod** | Formik |
| Tablas | **TanStack Table** | AG Grid |
| Charts | **Recharts** o **Chart.js** | Visx |
| Gantt | **gantt-task-react** o **frappe-gantt** | — |
| WebSocket | **socket.io-client** | — |
| API client | Generado desde Swagger con **openapi-typescript-codegen** | Manual axios |
| Auth | NextAuth.js (custom credentials provider que llama `/auth/login`) o middleware propio | — |
| Maps (zonas/lotes) | Leaflet + OpenStreetMap | Mapbox |
| Móvil obra | **PWA + Service Worker** con IndexedDB para offline | React Native si nativo |
| i18n | next-intl | react-i18next |
| Tests | Vitest + Playwright | Jest + Cypress |

### 13.2 Estructura de rutas sugerida (Next.js App Router)

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── recover/page.tsx
├── (dashboard)/
│   ├── layout.tsx                    # sidebar con permisos
│   ├── page.tsx                      # home con widgets por rol
│   ├── inmuebles/
│   │   ├── page.tsx                  # listado + filtros
│   │   ├── [id]/page.tsx             # detalle
│   │   ├── nuevo/page.tsx
│   │   └── [id]/dividir|fusionar/page.tsx
│   ├── planos/
│   │   ├── modelos/page.tsx
│   │   └── modelos/[id]/versiones/[v]/page.tsx  # editor colaborativo
│   ├── clientes/
│   ├── reservas/
│   ├── contratos/
│   ├── proyectos/
│   │   ├── [id]/
│   │   │   ├── page.tsx              # tablero proyecto
│   │   │   ├── preliminares/page.tsx
│   │   │   ├── actividades/page.tsx
│   │   │   ├── personal/page.tsx
│   │   │   ├── materiales/page.tsx
│   │   │   ├── compras/page.tsx
│   │   │   ├── calidad/page.tsx
│   │   │   ├── cronograma/page.tsx   # Gantt
│   │   │   ├── presupuesto/page.tsx
│   │   │   └── entrega/page.tsx
│   ├── reportes/
│   │   ├── calidad/page.tsx
│   │   ├── avance/page.tsx
│   │   ├── materiales/page.tsx
│   │   ├── mano-obra/page.tsx
│   │   ├── cronograma/page.tsx
│   │   └── presupuesto/page.tsx
│   ├── admin/
│   │   ├── usuarios/page.tsx
│   │   ├── roles/page.tsx
│   │   ├── proveedores/page.tsx
│   │   ├── catalogo-materiales/page.tsx
│   │   └── auditoria/page.tsx
│   └── perfil/page.tsx
├── api/                              # opcional, proxy si Next mismo
└── obra-mobile/                      # PWA section para sitio
    ├── asistencia/page.tsx
    ├── avance/page.tsx
    └── fotos/page.tsx
```

### 13.3 Patrones UI clave a implementar

1. **Layout adaptativo por rol**: sidebar filtra módulos según `currentUser.roles`. El backend expone `GET /auth/me` con `permissions[]`.
2. **Tablero de proyecto** (página principal `/proyectos/[id]`):
   - Header con: nombre, % avance overall (anillo), salud presupuesto (semáforo), salud cronograma (semáforo).
   - Tabs: Resumen | Preliminares | Actividades | Personal | Materiales | Compras | Calidad | Cronograma | Presupuesto | Documentos | Entrega.
3. **Editor colaborativo de planos** (CU#4,5): canvas con tools, mostrar quién está conectado en tiempo real (presence vía WebSocket), warning si otro usuario guardó (optimistic lock → 409 Conflict → "Hay cambios nuevos, refrescá").
4. **Tablero Gantt** (CU#22): drag-to-resize tareas, dependencias visuales, hoy en línea roja, items atrasados en color.
5. **Galería de avance**: timeline visual de fotos por actividad/fecha.
6. **Asistente de reserva** (wizard CU#8): step 1 buscar cliente, 2 elegir inmueble, 3 monto depósito, 4 condiciones, 5 confirmar → genera PDF recibo automático.
7. **Generador de reportes**: form con filtros + botón "Generar". Como es async, frontend recibe `jobId`, hace polling o suscribe via WS al evento `report.ready` y descarga.
8. **Notification bell**: dropdown con últimas 10 notificaciones, badge con count no leídas, WS update en vivo.
9. **PWA mobile site mode** (`/obra-mobile`): UI grande, touch-friendly, captura foto + GPS, cola offline → sync.

### 13.4 Decisiones que el frontend debe respetar

- **Nunca** asumir orden de roles del backend; siempre revisar `permissions[]` del endpoint `/auth/me`.
- **Decimal money**: backend devuelve strings (`"1234.56"`) para `Decimal` (Prisma) — frontend debe usar lib (`decimal.js` o `dinero.js`) para aritmética monetaria, **nunca `Number`**.
- **Fechas**: ISO 8601 UTC en API. Frontend convierte a TZ local (Bolivia = UTC-4) usando `date-fns-tz` o `dayjs`.
- **Idempotency-Key** en POSTs de pagos/cobros (UUID v4 generado en cliente, persistido si el form se re-envía).
- **File upload**: POST `/documents/upload` con `multipart/form-data`, devuelve `documentId`. Luego asociar al recurso (ej. `PATCH /contracts/:id { documentId }`).
- **Versionado planos/contratos**: al editar, el frontend envía el `optimisticVersion` actual. Si el server responde 409, mostrar diff y dejar al usuario resolver.
- **WebSocket reconnect**: auto-reconnect con backoff exponencial. Mostrar indicador offline.
- **Cache invalidation**: TanStack Query keys deben incluir filtros aplicados (`['projects', { status: 'EN_EJECUCION' }]`). Invalidar tras mutación con `queryClient.invalidateQueries(['projects'])`.

### 13.5 Componentes reutilizables sugeridos

- `<UserAvatar />`, `<RoleBadge />`, `<StatusBadge variant={...} />`
- `<MoneyDisplay amount={...} currency="BOB" />`
- `<DateDisplay value={...} variant="short|long|relative" />`
- `<ProgressRing percent={...} />`, `<HealthSemaphore status="OK|WARN|CRITICAL" />`
- `<PermissionGate permission="contract.approve">…</PermissionGate>`
- `<DataTable columns={...} query={useQuery(...)} />` (con sorting, paginación, filtros incluidos)
- `<DocumentUploader ownerType="..." ownerId="..." />`
- `<PhotoGallery documents={...} />`
- `<GanttChart items={...} />`, `<BudgetVarianceChart lines={...} />`

---

## 14. Roadmap de Implementación (Sugerido)

Fases ordenadas por dependencia. Cada fase = entregable funcional y verificable.

| Fase | Contenido | Duración aprox | Dependencias |
|------|-----------|----------------|---------------|
| **0. Bootstrap** | Repo, Docker, Prisma init, Auth (CU#30), Users/Roles (CU#31), Audit (CU#41) base | 1 sem | — |
| **1. Catálogos base** | Inmuebles (CU#1,2,3), Clientes (CU#6), Proveedores (CU#35), Materiales catálogo (CU#36) | 1.5 sem | F0 |
| **2. Ciclo venta** | Reuniones (CU#7), CreditCheck (CU#32), Reservas (CU#8), Contratos (CU#9,10), Documentos | 1.5 sem | F1 |
| **3. Planos** | BlueprintModel+versiones (CU#4,5,40), Instalaciones, WebSocket presence | 1 sem | F1 |
| **4. Proyecto core** | Project (CRUD), Preliminares (CU#14), Actividades (CU#16,18), Personal (CU#11) | 1.5 sem | F2 |
| **5. Materiales & compras** | Materiales planning (CU#12), Compras (CU#13), Recepción (CU#34), Inventario (CU#21) | 1.5 sem | F4 |
| **6. Avance & calidad** | Avance obra bruta+fina (CU#15,17), Asistencia (CU#37), Control trabajadores (CU#19), Calidad (CU#20) | 1.5 sem | F4 |
| **7. Cronograma & presupuesto** | Schedule (CU#22), Budget (CU#23), Payments (CU#33) | 1 sem | F4,F5 |
| **8. Reportes** | 6 reportes (CU#24-29) con job async + Excel/PDF | 1 sem | F6,F7 |
| **9. Entrega + notificaciones** | Delivery (CU#38), Notifications (CU#39), Email worker | 0.5 sem | F8 |
| **10. Hardening** | Tests e2e completos, performance tuning, observability, docs OpenAPI publicada | 1 sem | All |

**Total estimado:** ~12 semanas para un dev senior o 16-20 para un equipo junior-mid.

---

## 15. Riesgos y Mitigaciones

| Riesgo | Severidad | Mitigación |
|--------|:---------:|------------|
| Modelo dominio cambia tras feedback de usuario real Investco | Alta | Iterar con prototipo por fases; cada fase entrega valor independiente |
| Concurrencia en planos genera frustración | Media | MVP con optimistic lock + WS presence; CRDT solo si feedback lo exige |
| Reportes lentos por volumen de datos | Media | Generación asíncrona (BullMQ) + materialized views Postgres para agregaciones |
| Offline en sitio de obra | Media | PWA + IndexedDB para módulos críticos (asistencia, avance, fotos) |
| Cambios contractuales legales (Bolivia) | Media | Versionado de contratos + audit log inmutable de aprobaciones |
| Permisos demasiado granulares = configuración inmanejable | Baja | RBAC fijo por rol; ABAC sólo para filtros `self`/`own`. No exponer config de permisos al cliente |
| Migración de datos legacy (Excel actuales de Investco) | Media | Script ETL dedicado en fase 0 + dataset de prueba |

---

## 15.5 Estrategia de Mocks (Proyecto Universitario)

> El sistema debe ser **demoable end-to-end** sin dependencia de servicios externos reales. Pero el diseño debe permitir **reemplazar mocks por integraciones reales sin tocar dominio** (Hexagonal / Ports & Adapters).

### Patrón: Adapter detrás de interface

Cada integración externa vive detrás de una interface en el dominio. Implementaciones intercambiables vía `ConfigService` (`USE_MOCKS=true` en `.env` de desarrollo).

| Integración | Interface (port) | Adapter mock | Adapter real (futuro) |
|-------------|------------------|--------------|-----------------------|
| Verificación crédito banco | `BankCreditPort` | `MockBankAdapter` (genera respuestas según reglas simples: monto ≤ 100k aprobado, > 500k rechazado, intermedio random con delay) | REST/SOAP del banco real |
| Desembolso bancario | `BankDisbursementPort` | `MockDisbursementAdapter` (botón "simular desembolso" en UI dispara evento) | Banco real / pasarela |
| Firma digital de contratos | `DigitalSignaturePort` | `MockSignatureAdapter` (genera PDF con sello/imagen "FIRMADO MOCK") | DocuSign / firma electrónica boliviana |
| Email | `MailerPort` | `MockMailerAdapter` (escribe a tabla `sent_emails` para inspección en UI) | SMTP / SendGrid / SES |
| SMS notificaciones | `SmsPort` | `MockSmsAdapter` (log + tabla) | Twilio / proveedor local |
| Storage archivos | `StoragePort` | `LocalStorageAdapter` (carpeta `./storage/`) | S3 / MinIO en producción |
| Generación PDF | `PdfGeneratorPort` | `PdfKitAdapter` (real, no requiere mock) | — |

### Variables de entorno relevantes

```env
USE_MOCKS=true
MOCK_BANK_AUTO_APPROVE_THRESHOLD=100000
MOCK_BANK_AUTO_REJECT_THRESHOLD=500000
MOCK_BANK_DELAY_MS=1500
MOCK_DISBURSEMENT_AUTO_EXECUTE=false
STORAGE_DRIVER=local                # local|s3|minio
MAILER_DRIVER=mock                  # mock|smtp|sendgrid
```

### Indicador en UI

El frontend debe mostrar un **banner persistente "MODO DEMO — Integraciones simuladas"** cuando `USE_MOCKS=true`, para que durante la presentación quede claro qué partes son simuladas.

### Ventaja académica

Esta separación demuestra patrones GRASP (alta cohesión, bajo acoplamiento, Indirección) y Pure Fabrication — directamente alineado con el material del curso (Larman, capítulos 16-23 presentes en la carpeta del proyecto).

---

## 16. Próximos Pasos

1. **Validar este documento** con stakeholder (docente / equipo). Ajustar inconsistencias detectadas.
2. **Refinar modelo de dominio** con feedback (¿faltan campos? ¿relaciones no contempladas?).
3. **Inicializar repo NestJS + Prisma**: `nest new investco-backend`, agregar Prisma, Docker compose.
4. **Implementar Fase 0** (Bootstrap: Auth + Users + Audit base).
5. **Documentar API en Swagger** con cada endpoint que entre.
6. **Empezar frontend en paralelo** con stack sugerido, consumiendo `/auth` y `/users` desde día 1.

---

## Apéndice A — Glosario

- **Obra bruta**: estructura básica (cimientos, muros, techo, instalaciones tendidas)
- **Obra fina**: acabados (pintura, vidriería, carpintería, jardinería, muebles)
- **Faenas**: instalaciones temporales en sitio (oficina móvil, almacén)
- **Pto.**: punto (unidad de medida en costos de electricidad/plomería)
- **Ml.**: metro lineal
- **MZZ**: manzana (división urbana de un terreno)
- **Bs**: bolivianos (moneda)
- **Encargado de Proyecto** = Project Manager
- **Contratista**: especialista externo subcontratado por área (albañilería, plomería, etc.)
