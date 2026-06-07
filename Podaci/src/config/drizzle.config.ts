import type { Config } from "drizzle-kit";
import dotenv from "dotenv";
dotenv.config();

export default ({
  schema: ["./src/database/schema/schemapg.ts"],
  out: "./src/database/migrations",
  dialect: "postgresql",
  verbose: true,
  dbCredentials: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432, // 👈 pretvori string u broj
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "srpski",
    ssl: false,
  },

}) satisfies Config;