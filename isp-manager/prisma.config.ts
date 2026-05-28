import { defineConfig } from "prisma/config";

const DB_URL =
  process.env.DATABASE_URL ??
  "postgresql://isp:isp123@localhost:5434/isp_manager?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: DB_URL,
  },
});
