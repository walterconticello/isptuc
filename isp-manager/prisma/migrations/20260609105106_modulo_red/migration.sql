-- CreateEnum
CREATE TYPE "FuenteOlt" AS ENUM ('PANEL', 'SNMP', 'TELNET');

-- AlterEnum
ALTER TYPE "Modulo" ADD VALUE 'RED';

-- CreateTable
CREATE TABLE "Olt" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "sucursal" TEXT,
    "ipGestion" TEXT,
    "vendor" TEXT,
    "tipoFuente" "FuenteOlt" NOT NULL DEFAULT 'PANEL',
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Olt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Onu" (
    "id" TEXT NOT NULL,
    "oltId" TEXT NOT NULL,
    "pon" TEXT,
    "idOnu" TEXT,
    "serial" TEXT,
    "ip" TEXT,
    "potenciaDbm" DECIMAL(6,2),
    "estado" TEXT,
    "vlan" TEXT,
    "pppoeUser" TEXT,
    "publicIdWispro" INTEGER,
    "leidoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Onu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContratoWispro" (
    "id" TEXT NOT NULL,
    "publicId" INTEGER NOT NULL,
    "nombreCliente" TEXT,
    "direccion" TEXT,
    "plan" TEXT,
    "estado" TEXT,
    "ip" TEXT,
    "pppoeUsername" TEXT,
    "sincronizadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContratoWispro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroConfiguracion" (
    "id" TEXT NOT NULL,
    "empleadoId" TEXT,
    "tecnicoNombre" TEXT,
    "publicIdWispro" INTEGER,
    "serialOnu" TEXT,
    "marca" TEXT,
    "accion" TEXT NOT NULL,
    "parametros" JSONB,
    "resultado" TEXT,
    "origen" TEXT NOT NULL DEFAULT 'vsol-config',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroConfiguracion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Onu_oltId_idx" ON "Onu"("oltId");

-- CreateIndex
CREATE INDEX "Onu_publicIdWispro_idx" ON "Onu"("publicIdWispro");

-- CreateIndex
CREATE INDEX "Onu_serial_idx" ON "Onu"("serial");

-- CreateIndex
CREATE UNIQUE INDEX "Onu_oltId_pon_idOnu_key" ON "Onu"("oltId", "pon", "idOnu");

-- CreateIndex
CREATE UNIQUE INDEX "ContratoWispro_publicId_key" ON "ContratoWispro"("publicId");

-- CreateIndex
CREATE INDEX "ContratoWispro_nombreCliente_idx" ON "ContratoWispro"("nombreCliente");

-- CreateIndex
CREATE INDEX "RegistroConfiguracion_empleadoId_idx" ON "RegistroConfiguracion"("empleadoId");

-- CreateIndex
CREATE INDEX "RegistroConfiguracion_publicIdWispro_idx" ON "RegistroConfiguracion"("publicIdWispro");

-- CreateIndex
CREATE INDEX "RegistroConfiguracion_createdAt_idx" ON "RegistroConfiguracion"("createdAt");

-- AddForeignKey
ALTER TABLE "Onu" ADD CONSTRAINT "Onu_oltId_fkey" FOREIGN KEY ("oltId") REFERENCES "Olt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroConfiguracion" ADD CONSTRAINT "RegistroConfiguracion_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE SET NULL ON UPDATE CASCADE;
