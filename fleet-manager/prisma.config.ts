import { defineConfig } from "prisma/config"

// URL del container Docker local (ver docker-compose.yml)
const DB_URL = "postgresql://fleet:fleet123@localhost:5433/fleet_manager?schema=public"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: DB_URL,
  },
})
