import { PrismaClient, RoleCode } from '@prisma/client';
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

async function main(): Promise<void> {
  console.log('Seeding roles...');
  for (const r of ROLE_DEFS) {
    await prisma.role.upsert({
      where: { code: r.code },
      update: { name: r.name, description: r.description },
      create: r,
    });
  }
  console.log(`Seeded ${ROLE_DEFS.length} roles.`);

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@investco.local';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin123!';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const adminRole = await prisma.role.findUnique({ where: { code: 'ADMIN' } });
  if (!adminRole) throw new Error('ADMIN role not found after upsert');

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      fullName: 'Administrador Investco',
      isActive: true,
    },
  });

  await prisma.roleAssignment.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });

  console.log(`Admin user ready: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
