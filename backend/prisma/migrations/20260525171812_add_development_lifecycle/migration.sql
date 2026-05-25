-- CreateEnum
CREATE TYPE "DevelopmentStatus" AS ENUM ('PLANIFICACION', 'ADQUISICION', 'PERMISOS', 'EN_CONSTRUCCION', 'COMERCIALIZACION', 'COMPLETADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "AcquisitionStatus" AS ENUM ('NEGOCIACION', 'FIRMADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "PermitType" AS ENUM ('MUNICIPAL', 'BOMBEROS', 'AMBIENTAL', 'CATASTRAL', 'SERVICIOS');

-- CreateEnum
CREATE TYPE "PermitStatus" AS ENUM ('GESTIONANDO', 'APROBADO', 'RECHAZADO', 'VENCIDO');

-- CreateEnum
CREATE TYPE "ProjectKind" AS ENUM ('CONSTRUCTION_MASTER', 'UNIT_SALE');

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_contractId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_propertyId_fkey";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "developmentId" TEXT,
ADD COLUMN     "kind" "ProjectKind" NOT NULL DEFAULT 'UNIT_SALE',
ALTER COLUMN "propertyId" DROP NOT NULL,
ALTER COLUMN "contractId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "developmentId" TEXT;

-- CreateTable
CREATE TABLE "Development" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "description" TEXT,
    "acquisitionBudget" DECIMAL(65,30) NOT NULL,
    "constructionBudget" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BOB',
    "estimatedUnits" INTEGER NOT NULL DEFAULT 1,
    "startDate" TIMESTAMP(3) NOT NULL,
    "estimatedCompletion" TIMESTAMP(3),
    "status" "DevelopmentStatus" NOT NULL DEFAULT 'PLANIFICACION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Development_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcquisitionContract" (
    "id" TEXT NOT NULL,
    "developmentId" TEXT NOT NULL,
    "sellerName" TEXT NOT NULL,
    "sellerCi" TEXT,
    "sellerPhone" TEXT,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BOB',
    "signedDate" TIMESTAMP(3),
    "notes" TEXT,
    "status" "AcquisitionStatus" NOT NULL DEFAULT 'NEGOCIACION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcquisitionContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permit" (
    "id" TEXT NOT NULL,
    "developmentId" TEXT NOT NULL,
    "type" "PermitType" NOT NULL,
    "permitNumber" TEXT,
    "issuedDate" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "status" "PermitStatus" NOT NULL DEFAULT 'GESTIONANDO',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Development_code_key" ON "Development"("code");

-- CreateIndex
CREATE INDEX "Development_status_idx" ON "Development"("status");

-- CreateIndex
CREATE INDEX "Development_deletedAt_idx" ON "Development"("deletedAt");

-- CreateIndex
CREATE INDEX "AcquisitionContract_developmentId_idx" ON "AcquisitionContract"("developmentId");

-- CreateIndex
CREATE INDEX "AcquisitionContract_status_idx" ON "AcquisitionContract"("status");

-- CreateIndex
CREATE INDEX "Permit_developmentId_idx" ON "Permit"("developmentId");

-- CreateIndex
CREATE INDEX "Permit_status_idx" ON "Permit"("status");

-- CreateIndex
CREATE INDEX "Project_kind_idx" ON "Project"("kind");

-- CreateIndex
CREATE INDEX "Project_developmentId_idx" ON "Project"("developmentId");

-- CreateIndex
CREATE INDEX "Property_developmentId_idx" ON "Property"("developmentId");

-- AddForeignKey
ALTER TABLE "AcquisitionContract" ADD CONSTRAINT "AcquisitionContract_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permit" ADD CONSTRAINT "Permit_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_developmentId_fkey" FOREIGN KEY ("developmentId") REFERENCES "Development"("id") ON DELETE SET NULL ON UPDATE CASCADE;
