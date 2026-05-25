import {
  PrismaClient,
  RoleCode,
  PropertyType,
  PropertyStatus,
  ClientStatus,
  ReservationStatus,
  ContractStatus,
  ProjectStatus,
  ProjectStage,
  ActivityStage,
  ActivityCategory,
  ActivityStatus,
  POStatus,
  PaymentType,
  WorkerType,
  BudgetCategory,
  FindingSeverity,
  FindingStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ROLE_DEFS: Array<{ code: RoleCode; name: string; description: string }> = [
  { code: 'ADMIN', name: 'Administrador', description: 'Acceso total al sistema' },
  { code: 'GERENTE', name: 'Gerente', description: 'Gestión estratégica y aprobaciones' },
  { code: 'SECRETARIA', name: 'Secretaria', description: 'Gestión de citas y registro de clientes' },
  { code: 'VENDEDOR', name: 'Vendedor', description: 'Atención comercial y contratos' },
  { code: 'INGENIERO', name: 'Ingeniero', description: 'Cálculos estructurales y supervisión técnica' },
  { code: 'ARQUITECTO', name: 'Arquitecto', description: 'Diseño arquitectónico y planos' },
  { code: 'ENCARG_PROYECTO', name: 'Encargado de Proyecto', description: 'Coordinación de obra' },
  { code: 'ENCARG_CALIDAD', name: 'Encargado de Calidad', description: 'Inspecciones y control de calidad' },
  { code: 'ENCARG_PRESUPUESTO', name: 'Encargado de Presupuesto', description: 'Control presupuestario' },
  { code: 'ENCARG_COMPRAS', name: 'Encargado de Compras', description: 'Gestión de órdenes de compra' },
  { code: 'CONTRATISTA', name: 'Contratista', description: 'Subcontrato de actividades' },
  { code: 'OBRERO', name: 'Obrero', description: 'Ejecución de actividades en obra' },
  { code: 'PROVEEDOR', name: 'Proveedor', description: 'Suministro de materiales' },
  { code: 'CLIENTE', name: 'Cliente', description: 'Comprador de inmueble' },
  { code: 'SUPERVISOR', name: 'Supervisor', description: 'Supervisión cruzada de obras' },
];

const DEMO_USERS: Array<{
  email: string;
  password: string;
  fullName: string;
  roles: RoleCode[];
}> = [
  { email: 'gerente@investco.local', password: 'Admin123!', fullName: 'Laura Mendoza Vargas', roles: ['GERENTE'] },
  { email: 'ventas@investco.local', password: 'Admin123!', fullName: 'Carlos Suárez Rojas', roles: ['VENDEDOR'] },
  { email: 'proyecto@investco.local', password: 'Admin123!', fullName: 'Miguel Aliaga Cortez', roles: ['ENCARG_PROYECTO'] },
  { email: 'calidad@investco.local', password: 'Admin123!', fullName: 'Andrea Salazar Peña', roles: ['ENCARG_CALIDAD', 'INGENIERO'] },
  { email: 'compras@investco.local', password: 'Admin123!', fullName: 'Sergio Velasco Pinto', roles: ['ENCARG_COMPRAS'] },
];

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function daysAhead(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function seedRoles(): Promise<Record<RoleCode, string>> {
  console.log('Seeding roles...');
  const ids: Partial<Record<RoleCode, string>> = {};
  for (const r of ROLE_DEFS) {
    const role = await prisma.role.upsert({
      where: { code: r.code },
      update: { name: r.name, description: r.description },
      create: r,
    });
    ids[r.code] = role.id;
  }
  console.log(`Seeded ${ROLE_DEFS.length} roles.`);
  return ids as Record<RoleCode, string>;
}

async function seedUsers(roleIds: Record<RoleCode, string>): Promise<Record<string, string>> {
  console.log('Seeding users...');
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@investco.local';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin123!';
  const adminHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash: adminHash, fullName: 'Administrador Investco', isActive: true },
  });
  await prisma.roleAssignment.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: roleIds.ADMIN } },
    update: {},
    create: { userId: admin.id, roleId: roleIds.ADMIN },
  });

  const map: Record<string, string> = { admin: admin.id };

  for (const u of DEMO_USERS) {
    const hash = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { email: u.email, passwordHash: hash, fullName: u.fullName, isActive: true },
    });
    for (const r of u.roles) {
      await prisma.roleAssignment.upsert({
        where: { userId_roleId: { userId: user.id, roleId: roleIds[r] } },
        update: {},
        create: { userId: user.id, roleId: roleIds[r] },
      });
    }
    map[u.email.split('@')[0]] = user.id;
  }
  console.log(`Seeded ${DEMO_USERS.length + 1} users.`);
  return map;
}

async function seedDemoData(userIds: Record<string, string>): Promise<void> {
  const existing = await prisma.property.count();
  if (existing > 0) {
    console.log(`Demo data already present (${existing} properties). Skipping demo seed.`);
    return;
  }
  console.log('Seeding demo data...');

  // ---------- PROPERTIES ----------
  const propertyDefs: Array<{
    code: string;
    type: PropertyType;
    address: string;
    zone: string;
    m2: number;
    status: PropertyStatus;
  }> = [
    { code: 'P-A101', type: 'DEPTO', address: 'Torre Piraí, Av. Cristo Redentor #210, Piso 1', zone: 'Equipetrol', m2: 78, status: 'VENDIDO' },
    { code: 'P-A102', type: 'DEPTO', address: 'Torre Piraí, Av. Cristo Redentor #210, Piso 1', zone: 'Equipetrol', m2: 78, status: 'EN_CONSTRUCCION' },
    { code: 'P-A201', type: 'DEPTO', address: 'Torre Piraí, Av. Cristo Redentor #210, Piso 2', zone: 'Equipetrol', m2: 92, status: 'RESERVADO' },
    { code: 'P-A202', type: 'DEPTO', address: 'Torre Piraí, Av. Cristo Redentor #210, Piso 2', zone: 'Equipetrol', m2: 92, status: 'DISPONIBLE' },
    { code: 'P-A301', type: 'DEPTO', address: 'Torre Piraí, Av. Cristo Redentor #210, Piso 3', zone: 'Equipetrol', m2: 110, status: 'DISPONIBLE' },
    { code: 'P-A302', type: 'DEPTO', address: 'Torre Piraí, Av. Cristo Redentor #210, Piso 3', zone: 'Equipetrol', m2: 110, status: 'VENDIDO' },
    { code: 'P-B101', type: 'CASA', address: 'Cond. Las Palmeras, Mz. B, Lote 1', zone: 'Urubó', m2: 220, status: 'EN_CONSTRUCCION' },
    { code: 'P-B102', type: 'CASA', address: 'Cond. Las Palmeras, Mz. B, Lote 2', zone: 'Urubó', m2: 220, status: 'ENTREGADO' },
    { code: 'P-B103', type: 'CASA', address: 'Cond. Las Palmeras, Mz. B, Lote 3', zone: 'Urubó', m2: 240, status: 'RESERVADO' },
    { code: 'P-B104', type: 'CASA', address: 'Cond. Las Palmeras, Mz. B, Lote 4', zone: 'Urubó', m2: 240, status: 'DISPONIBLE' },
    { code: 'P-B105', type: 'CASA', address: 'Cond. Las Palmeras, Mz. B, Lote 5', zone: 'Urubó', m2: 260, status: 'DISPONIBLE' },
    { code: 'P-C001', type: 'LOTE', address: 'Urbanización Los Tajibos, Mz. C, Lote 1', zone: 'Norte', m2: 360, status: 'DISPONIBLE' },
    { code: 'P-C002', type: 'LOTE', address: 'Urbanización Los Tajibos, Mz. C, Lote 2', zone: 'Norte', m2: 360, status: 'DISPONIBLE' },
    { code: 'P-C003', type: 'LOTE', address: 'Urbanización Los Tajibos, Mz. C, Lote 3', zone: 'Norte', m2: 380, status: 'VENDIDO' },
    { code: 'P-D001', type: 'DUPLEX', address: 'Cond. Vista Verde, Casa 01', zone: 'Sur', m2: 165, status: 'EN_CONSTRUCCION' },
    { code: 'P-D002', type: 'DUPLEX', address: 'Cond. Vista Verde, Casa 02', zone: 'Sur', m2: 165, status: 'RESERVADO' },
    { code: 'P-D003', type: 'DUPLEX', address: 'Cond. Vista Verde, Casa 03', zone: 'Sur', m2: 165, status: 'DISPONIBLE' },
    { code: 'P-D004', type: 'DUPLEX', address: 'Cond. Vista Verde, Casa 04', zone: 'Sur', m2: 180, status: 'ENTREGADO' },
    { code: 'P-D005', type: 'DUPLEX', address: 'Cond. Vista Verde, Casa 05', zone: 'Sur', m2: 180, status: 'DISPONIBLE' },
    { code: 'P-D006', type: 'DUPLEX', address: 'Cond. Vista Verde, Casa 06', zone: 'Sur', m2: 180, status: 'DISPONIBLE' },
  ];
  const properties = await Promise.all(
    propertyDefs.map((p) =>
      prisma.property.create({
        data: { ...p, m2: p.m2 },
      }),
    ),
  );
  console.log(`  ${properties.length} properties`);

  // ---------- CLIENTS ----------
  const clientDefs: Array<{
    ci: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    status: ClientStatus;
  }> = [
    { ci: '7654321', firstName: 'Roberto', lastName: 'Paz Aguilera', phone: '70011223', email: 'roberto.paz@mail.bo', status: 'FIRMADO' },
    { ci: '7654322', firstName: 'Carmen', lastName: 'Rojas Quispe', phone: '70011224', email: 'carmen.rojas@mail.bo', status: 'FIRMADO' },
    { ci: '7654323', firstName: 'Andrés', lastName: 'Núñez Velarde', phone: '70011225', email: 'andres.nunez@mail.bo', status: 'ENTREGADO' },
    { ci: '7654324', firstName: 'Patricia', lastName: 'López Soliz', phone: '70011226', email: 'patricia.lopez@mail.bo', status: 'ENTREGADO' },
    { ci: '7654325', firstName: 'Diego', lastName: 'Vargas Quiroga', phone: '70011227', email: 'diego.vargas@mail.bo', status: 'RESERVADO' },
    { ci: '7654326', firstName: 'Sofía', lastName: 'Mamani Choque', phone: '70011228', email: 'sofia.mamani@mail.bo', status: 'RESERVADO' },
    { ci: '7654327', firstName: 'Luis', lastName: 'Rivera Castro', phone: '70011229', email: 'luis.rivera@mail.bo', status: 'RESERVADO' },
    { ci: '7654328', firstName: 'María', lastName: 'Saavedra Torrico', phone: '70011230', email: 'maria.saavedra@mail.bo', status: 'PROSPECTO' },
    { ci: '7654329', firstName: 'Jorge', lastName: 'Camacho Vaca', phone: '70011231', email: 'jorge.camacho@mail.bo', status: 'PROSPECTO' },
    { ci: '7654330', firstName: 'Daniela', lastName: 'Ortiz Aramayo', phone: '70011232', email: 'daniela.ortiz@mail.bo', status: 'PROSPECTO' },
    { ci: '7654331', firstName: 'Pablo', lastName: 'Vaca Diez', phone: '70011233', email: 'pablo.vacadiez@mail.bo', status: 'LEAD' },
    { ci: '7654332', firstName: 'Verónica', lastName: 'Justiniano Roca', phone: '70011234', email: 'veronica.justiniano@mail.bo', status: 'LEAD' },
    { ci: '7654333', firstName: 'Renzo', lastName: 'Antezana Pinto', phone: '70011235', email: 'renzo.antezana@mail.bo', status: 'LEAD' },
    { ci: '7654334', firstName: 'Karen', lastName: 'Salvatierra Yapur', phone: '70011236', email: 'karen.salvatierra@mail.bo', status: 'LEAD' },
    { ci: '7654335', firstName: 'Iván', lastName: 'Suárez Banzer', phone: '70011237', email: 'ivan.suarez@mail.bo', status: 'LEAD' },
  ];
  const clients = await Promise.all(
    clientDefs.map((c) => prisma.client.create({ data: { ...c, source: 'Demo seed' } })),
  );
  console.log(`  ${clients.length} clients`);

  // ---------- RESERVATIONS ----------
  // Map by property code for clarity
  const byCode = Object.fromEntries(properties.map((p) => [p.code, p]));
  const byCI = Object.fromEntries(clients.map((c) => [c.ci, c]));

  const reservationDefs: Array<{ propertyCode: string; clientCi: string; deposit: number; status: ReservationStatus; daysOld: number }> = [
    // Activas (matching RESERVADO properties)
    { propertyCode: 'P-A201', clientCi: '7654325', deposit: 35000, status: 'ACTIVA', daysOld: 8 },
    { propertyCode: 'P-B103', clientCi: '7654326', deposit: 60000, status: 'ACTIVA', daysOld: 12 },
    { propertyCode: 'P-D002', clientCi: '7654327', deposit: 45000, status: 'ACTIVA', daysOld: 5 },
    // Convertidas (clientes FIRMADO / ENTREGADO)
    { propertyCode: 'P-A101', clientCi: '7654321', deposit: 30000, status: 'CONVERTIDA', daysOld: 90 },
    { propertyCode: 'P-A302', clientCi: '7654322', deposit: 40000, status: 'CONVERTIDA', daysOld: 75 },
    { propertyCode: 'P-B102', clientCi: '7654323', deposit: 55000, status: 'CONVERTIDA', daysOld: 200 },
    { propertyCode: 'P-D004', clientCi: '7654324', deposit: 45000, status: 'CONVERTIDA', daysOld: 180 },
    { propertyCode: 'P-C003', clientCi: '7654321', deposit: 18000, status: 'CONVERTIDA', daysOld: 110 },
    // Vencida (sin contrato)
    { propertyCode: 'P-A202', clientCi: '7654328', deposit: 20000, status: 'VENCIDA', daysOld: 60 },
    // Cancelada
    { propertyCode: 'P-D005', clientCi: '7654329', deposit: 15000, status: 'CANCELADA', daysOld: 45 },
  ];

  for (const r of reservationDefs) {
    await prisma.reservation.create({
      data: {
        propertyId: byCode[r.propertyCode].id,
        clientId: byCI[r.clientCi].id,
        depositAmount: r.deposit,
        currency: 'BOB',
        validityDays: 30,
        reservationDate: daysAgo(r.daysOld),
        expiresAt: r.status === 'ACTIVA' ? daysAhead(30 - r.daysOld) : daysAgo(r.daysOld - 30),
        status: r.status,
      },
    });
  }
  console.log(`  ${reservationDefs.length} reservations`);

  // ---------- CONTRACTS ----------
  const contractDefs: Array<{
    propertyCode: string;
    clientCi: string;
    total: number;
    status: ContractStatus;
    daysOld: number;
    deadlineDaysAhead: number;
  }> = [
    { propertyCode: 'P-A101', clientCi: '7654321', total: 285000, status: 'FIRMADO', daysOld: 85, deadlineDaysAhead: 180 },
    { propertyCode: 'P-A302', clientCi: '7654322', total: 380000, status: 'FIRMADO', daysOld: 70, deadlineDaysAhead: 220 },
    { propertyCode: 'P-B102', clientCi: '7654323', total: 520000, status: 'FIRMADO', daysOld: 195, deadlineDaysAhead: -10 },
    { propertyCode: 'P-D004', clientCi: '7654324', total: 410000, status: 'FIRMADO', daysOld: 175, deadlineDaysAhead: -5 },
    { propertyCode: 'P-C003', clientCi: '7654321', total: 165000, status: 'FIRMADO', daysOld: 105, deadlineDaysAhead: 90 },
    { propertyCode: 'P-A102', clientCi: '7654328', total: 290000, status: 'REVISION', daysOld: 12, deadlineDaysAhead: 240 },
    { propertyCode: 'P-B101', clientCi: '7654329', total: 540000, status: 'BORRADOR', daysOld: 4, deadlineDaysAhead: 300 },
  ];

  const contracts: Array<{ id: string; propertyCode: string }> = [];
  for (const c of contractDefs) {
    const created = await prisma.contract.create({
      data: {
        propertyId: byCode[c.propertyCode].id,
        clientId: byCI[c.clientCi].id,
        totalAmount: c.total,
        currency: 'BOB',
        deliveryDeadline: daysAhead(c.deadlineDaysAhead),
        signedDate: c.status === 'FIRMADO' ? daysAgo(c.daysOld - 5) : null,
        status: c.status,
        createdAt: daysAgo(c.daysOld),
      },
    });
    contracts.push({ id: created.id, propertyCode: c.propertyCode });
  }
  console.log(`  ${contractDefs.length} contracts`);

  // ---------- PROJECTS ----------
  // Projects only on EN_CONSTRUCCION or ENTREGADO properties with a signed contract
  const projectDefs: Array<{
    code: string;
    propertyCode: string;
    status: ProjectStatus;
    stage: ProjectStage;
    daysSinceStart: number;
    endInDays?: number;
  }> = [
    { code: 'PRJ-TPI-A102', propertyCode: 'P-A102', status: 'EN_EJECUCION', stage: 'OBRA_BRUTA', daysSinceStart: 70 },
    { code: 'PRJ-LPA-B101', propertyCode: 'P-B101', status: 'EN_EJECUCION', stage: 'OBRA_FINA', daysSinceStart: 150 },
    { code: 'PRJ-VVE-D001', propertyCode: 'P-D001', status: 'EN_EJECUCION', stage: 'PRELIMINARES', daysSinceStart: 25 },
    { code: 'PRJ-LPA-B102', propertyCode: 'P-B102', status: 'FINALIZADO', stage: 'ENTREGA', daysSinceStart: 240, endInDays: -10 },
    { code: 'PRJ-VVE-D004', propertyCode: 'P-D004', status: 'FINALIZADO', stage: 'ENTREGA', daysSinceStart: 220, endInDays: -5 },
  ];

  const projects: Array<{ id: string; code: string }> = [];
  for (const p of projectDefs) {
    const contract = contracts.find((c) => c.propertyCode === p.propertyCode);
    if (!contract) continue;
    const created = await prisma.project.create({
      data: {
        code: p.code,
        propertyId: byCode[p.propertyCode].id,
        contractId: contract.id,
        startDate: daysAgo(p.daysSinceStart),
        endDate: p.endInDays !== undefined ? daysAhead(p.endInDays) : null,
        currentStage: p.stage,
        status: p.status,
        projectManagerId: userIds.proyecto,
        qualityManagerId: userIds.calidad,
        budgetManagerId: userIds.gerente,
      },
    });
    projects.push({ id: created.id, code: p.code });
  }
  console.log(`  ${projects.length} projects`);

  // ---------- ACTIVITIES & PROGRESS ----------
  // Add a small set of activities per project with progress percent reflecting stage
  const activityTemplates: Array<{
    stage: ActivityStage;
    category: ActivityCategory;
    name: string;
    weight: number;
  }> = [
    { stage: 'BRUTA', category: 'PRELIMINARES', name: 'Limpieza y replanteo', weight: 1 },
    { stage: 'BRUTA', category: 'ALBANILERIA', name: 'Cimentación', weight: 3 },
    { stage: 'BRUTA', category: 'ALBANILERIA', name: 'Muros estructurales', weight: 4 },
    { stage: 'BRUTA', category: 'ELECTRICIDAD', name: 'Instalación eléctrica gruesa', weight: 2 },
    { stage: 'FINA', category: 'PLOMERIA', name: 'Plomería fina', weight: 2 },
    { stage: 'FINA', category: 'ACABADOS', name: 'Pisos y revestimientos', weight: 3 },
    { stage: 'FINA', category: 'PINTURA', name: 'Pintura interior y exterior', weight: 2 },
    { stage: 'FINA', category: 'CARPINTERIA', name: 'Carpintería de puertas', weight: 1 },
  ];

  function progressFor(stage: ProjectStage, idx: number): { pct: number; status: ActivityStatus } {
    // 8 activities; how many are done depends on stage
    const order = idx;
    const map: Record<ProjectStage, number> = {
      PRELIMINARES: 1,
      OBRA_BRUTA: 4,
      OBRA_FINA: 7,
      ENTREGA: 8,
    };
    const doneUpTo = map[stage];
    if (order < doneUpTo) return { pct: 100, status: 'TERMINADA' };
    if (order === doneUpTo) return { pct: 45, status: 'EN_CURSO' };
    return { pct: 0, status: 'PENDIENTE' };
  }

  for (const project of projects) {
    const proj = projectDefs.find((p) => p.code === project.code)!;
    for (let i = 0; i < activityTemplates.length; i++) {
      const t = activityTemplates[i];
      const { pct, status } = progressFor(proj.stage, i);
      const start = daysAgo(proj.daysSinceStart - i * 8);
      const end = daysAhead(20 + (activityTemplates.length - i) * 6);
      const activity = await prisma.activity.create({
        data: {
          projectId: project.id,
          stage: t.stage,
          category: t.category,
          name: t.name,
          plannedStart: start,
          plannedEnd: end,
          actualStart: status !== 'PENDIENTE' ? start : null,
          actualEnd: status === 'TERMINADA' ? daysAgo(proj.daysSinceStart - (i + 1) * 8) : null,
          weight: t.weight,
          status,
          plannedQuantity: 100,
          actualQuantity: pct,
          unit: '%',
        },
      });
      if (pct > 0) {
        await prisma.activityProgress.create({
          data: {
            activityId: activity.id,
            percentComplete: pct,
            quantityCompleted: pct,
            reportedBy: userIds.proyecto,
            reportDate: daysAgo(2),
            notes: `Avance reportado al ${pct}%`,
          },
        });
      }
    }
  }
  console.log(`  activities + progress for ${projects.length} projects`);

  // ---------- QUALITY INSPECTIONS ----------
  for (const project of projects) {
    const insp = await prisma.qualityInspection.create({
      data: {
        projectId: project.id,
        inspectorId: userIds.calidad,
        stage: 'BRUTA',
        scope: 'Inspección integral estructural',
        inspectionDate: daysAgo(10),
      },
    });
    await prisma.qualityFinding.create({
      data: {
        inspectionId: insp.id,
        severity: 'MEDIA',
        description: 'Fisura capilar en muro este. Aplicar resane.',
        correctiveAction: 'Resane epóxico y pintura',
        status: 'RESUELTA',
        closedDate: daysAgo(3),
      },
    });
    await prisma.qualityFinding.create({
      data: {
        inspectionId: insp.id,
        severity: 'LEVE',
        description: 'Acabado deficiente en zócalo de ingreso',
        status: 'EN_CORRECCION',
      },
    });
  }

  // ---------- MATERIALS & SUPPLIERS ----------
  const materialDefs = [
    { code: 'MAT-CEM', name: 'Cemento Portland 50kg', unit: 'sc', referencePrice: 65, category: 'Construcción' },
    { code: 'MAT-LAD', name: 'Ladrillo 6 huecos', unit: 'un', referencePrice: 1.8, category: 'Construcción' },
    { code: 'MAT-ARN', name: 'Arena fina', unit: 'm3', referencePrice: 90, category: 'Construcción' },
    { code: 'MAT-GRA', name: 'Grava 3/4"', unit: 'm3', referencePrice: 120, category: 'Construcción' },
    { code: 'MAT-FIE', name: 'Fierro corrugado 12mm', unit: 'kg', referencePrice: 8.5, category: 'Estructural' },
    { code: 'MAT-PIN', name: 'Pintura látex 18L', unit: 'cb', referencePrice: 280, category: 'Acabados' },
    { code: 'MAT-CAB', name: 'Cable THW 12 AWG', unit: 'm', referencePrice: 4.2, category: 'Eléctrico' },
    { code: 'MAT-TUB', name: 'Tubería PVC 1/2"', unit: 'm', referencePrice: 9, category: 'Plomería' },
  ];
  const materials = await Promise.all(
    materialDefs.map((m) => prisma.material.create({ data: m })),
  );

  const supplierDefs = [
    { name: 'Cementos Warnes SA', contact: 'Mario Suárez', phone: '33445566', email: 'ventas@cementoswarnes.bo', taxId: '1001234567', rating: 5 },
    { name: 'Aceros del Este', contact: 'Sandra Núñez', phone: '33445577', email: 'ventas@acerosdeleste.bo', taxId: '1001234568', rating: 4 },
    { name: 'Pinturas Boliviana SRL', contact: 'Ramiro Paz', phone: '33445588', email: 'pedidos@pinturasbo.bo', taxId: '1001234569', rating: 4 },
    { name: 'Eléctricos Santa Cruz', contact: 'Luz Aramayo', phone: '33445599', email: 'ventas@electricossc.bo', taxId: '1001234570', rating: 3 },
  ];
  const suppliers = await Promise.all(
    supplierDefs.map((s) => prisma.supplier.create({ data: s })),
  );

  // ---------- PURCHASE ORDERS ----------
  const poDefs: Array<{
    project: string;
    supplier: string;
    status: POStatus;
    lines: Array<{ materialCode: string; qty: number }>;
    daysOld: number;
  }> = [
    { project: 'PRJ-TPI-A102', supplier: 'Cementos Warnes SA', status: 'RECIBIDA_TOTAL', daysOld: 40, lines: [{ materialCode: 'MAT-CEM', qty: 200 }, { materialCode: 'MAT-ARN', qty: 25 }] },
    { project: 'PRJ-TPI-A102', supplier: 'Aceros del Este', status: 'ENVIADA', daysOld: 8, lines: [{ materialCode: 'MAT-FIE', qty: 1200 }] },
    { project: 'PRJ-LPA-B101', supplier: 'Pinturas Boliviana SRL', status: 'APROBADA', daysOld: 6, lines: [{ materialCode: 'MAT-PIN', qty: 24 }] },
    { project: 'PRJ-LPA-B101', supplier: 'Eléctricos Santa Cruz', status: 'EN_APROBACION', daysOld: 3, lines: [{ materialCode: 'MAT-CAB', qty: 800 }, { materialCode: 'MAT-TUB', qty: 200 }] },
    { project: 'PRJ-VVE-D001', supplier: 'Cementos Warnes SA', status: 'BORRADOR', daysOld: 1, lines: [{ materialCode: 'MAT-CEM', qty: 80 }, { materialCode: 'MAT-LAD', qty: 5000 }] },
  ];

  const supplierByName = Object.fromEntries(suppliers.map((s) => [s.name, s]));
  const materialByCode = Object.fromEntries(materials.map((m) => [m.code, m]));
  const projectByCode = Object.fromEntries(projects.map((p) => [p.code, p]));

  for (const po of poDefs) {
    const total = po.lines.reduce((acc, l) => acc + l.qty * Number(materialByCode[l.materialCode].referencePrice), 0);
    const created = await prisma.purchaseOrder.create({
      data: {
        projectId: projectByCode[po.project].id,
        supplierId: supplierByName[po.supplier].id,
        status: po.status,
        totalAmount: total,
        currency: 'BOB',
        orderDate: daysAgo(po.daysOld),
        approvedAt: ['APROBADA', 'ENVIADA', 'RECIBIDA_PARCIAL', 'RECIBIDA_TOTAL'].includes(po.status) ? daysAgo(po.daysOld - 1) : null,
        approvedBy: ['APROBADA', 'ENVIADA', 'RECIBIDA_PARCIAL', 'RECIBIDA_TOTAL'].includes(po.status) ? userIds.gerente : null,
        sentAt: ['ENVIADA', 'RECIBIDA_PARCIAL', 'RECIBIDA_TOTAL'].includes(po.status) ? daysAgo(Math.max(0, po.daysOld - 2)) : null,
      },
    });
    for (const l of po.lines) {
      const mat = materialByCode[l.materialCode];
      await prisma.purchaseOrderLine.create({
        data: {
          purchaseOrderId: created.id,
          materialId: mat.id,
          quantity: l.qty,
          unitPrice: mat.referencePrice,
          lineTotal: Number(mat.referencePrice) * l.qty,
        },
      });
    }
  }
  console.log(`  ${poDefs.length} purchase orders`);

  // ---------- BUDGET LINES (samples) ----------
  for (const project of projects) {
    const lines = [
      { category: 'MATERIAL' as BudgetCategory, description: 'Material estructural', planned: 85000, actualPct: 0.65 },
      { category: 'MANO_OBRA' as BudgetCategory, description: 'Mano de obra obreros', planned: 60000, actualPct: 0.55 },
      { category: 'EQUIPO' as BudgetCategory, description: 'Alquiler de equipos', planned: 18000, actualPct: 0.40 },
      { category: 'SUBCONTRATO' as BudgetCategory, description: 'Subcontrato eléctrico', planned: 25000, actualPct: 0.30 },
      { category: 'GENERAL' as BudgetCategory, description: 'Gastos generales', planned: 12000, actualPct: 0.50 },
    ];
    for (const l of lines) {
      await prisma.budgetLine.create({
        data: {
          projectId: project.id,
          category: l.category,
          description: l.description,
          plannedAmount: l.planned,
          actualAmount: l.planned * l.actualPct,
        },
      });
    }
  }

  // ---------- PAYMENTS ----------
  const paymentSamples: Array<{
    project?: string;
    type: PaymentType;
    amount: number;
    daysAgo: number;
  }> = [
    { project: 'PRJ-TPI-A102', type: 'PAGO_PROVEEDOR', amount: 18500, daysAgo: 35 },
    { project: 'PRJ-TPI-A102', type: 'PAGO_CONTRATISTA', amount: 12000, daysAgo: 28 },
    { project: 'PRJ-LPA-B101', type: 'PAGO_PROVEEDOR', amount: 22000, daysAgo: 24 },
    { project: 'PRJ-LPA-B101', type: 'PAGO_CONTRATISTA', amount: 18000, daysAgo: 18 },
    { project: 'PRJ-LPA-B101', type: 'PAGO_PROVEEDOR', amount: 9500, daysAgo: 12 },
    { project: 'PRJ-VVE-D001', type: 'PAGO_PROVEEDOR', amount: 7400, daysAgo: 9 },
    { project: 'PRJ-TPI-A102', type: 'PAGO_PROVEEDOR', amount: 11200, daysAgo: 7 },
    { project: 'PRJ-LPA-B102', type: 'PAGO_CONTRATISTA', amount: 28000, daysAgo: 50 },
  ];
  for (const p of paymentSamples) {
    await prisma.payment.create({
      data: {
        projectId: p.project ? projectByCode[p.project].id : null,
        type: p.type,
        amount: p.amount,
        currency: 'BOB',
        paymentDate: daysAgo(p.daysAgo),
      },
    });
  }
  console.log(`  ${paymentSamples.length} payments`);

  // ---------- WORKERS ----------
  await prisma.worker.createMany({
    data: [
      { type: 'INTERNO', userId: userIds.proyecto, speciality: 'Encargado de proyecto', dailyRate: 350, hourlyRate: 44, isActive: true },
      { type: 'EXTERNO', speciality: 'Albañil', dailyRate: 180, hourlyRate: 22, isActive: true, contractorCompany: 'Cuadrilla Soliz' },
      { type: 'EXTERNO', speciality: 'Electricista', dailyRate: 230, hourlyRate: 28, isActive: true, contractorCompany: 'Eléctricos Suárez' },
      { type: 'EXTERNO', speciality: 'Plomero', dailyRate: 210, hourlyRate: 26, isActive: true, contractorCompany: 'Hidro & Sani' },
      { type: 'EXTERNO', speciality: 'Pintor', dailyRate: 170, hourlyRate: 21, isActive: true, contractorCompany: 'Acabados Vega' },
    ],
  });

  console.log('Demo data seeded.');
}

async function main(): Promise<void> {
  const roleIds = await seedRoles();
  const userIds = await seedUsers(roleIds);
  await seedDemoData(userIds);
  console.log('\nLogin admin: admin@investco.local / Admin123!');
  console.log('Login demo:  gerente@investco.local / Admin123!  (otros: ventas/proyecto/calidad/compras)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
