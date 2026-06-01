import { describe, it, expect, vi, beforeEach } from "vitest";

// Mockeamos la DB para no instanciar Prisma ni tocar Postgres.
vi.mock("@/lib/db", () => ({
  db: { auditLog: { create: vi.fn() } },
}));

import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

describe("logAudit", () => {
  beforeEach(() => vi.clearAllMocks());

  it("escribe en auditLog en el caso normal", async () => {
    vi.mocked(db.auditLog.create).mockResolvedValueOnce({} as never);

    await logAudit({ accion: "LOGIN_EXITOSO", modulo: "AUTH", empleadoId: "e1" });

    expect(db.auditLog.create).toHaveBeenCalledOnce();
  });

  it("no lanza cuando la escritura falla, pero registra el error", async () => {
    vi.mocked(db.auditLog.create).mockRejectedValueOnce(new Error("DB caída"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      logAudit({ accion: "LOGIN_FALLIDO", modulo: "AUTH" })
    ).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});
