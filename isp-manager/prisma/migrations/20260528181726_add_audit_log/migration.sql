-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "empleadoId" TEXT,
    "accion" TEXT NOT NULL,
    "modulo" TEXT NOT NULL,
    "entidadId" TEXT,
    "entidadNombre" TEXT,
    "detalles" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_empleadoId_idx" ON "AuditLog"("empleadoId");

-- CreateIndex
CREATE INDEX "AuditLog_modulo_idx" ON "AuditLog"("modulo");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE SET NULL ON UPDATE CASCADE;
