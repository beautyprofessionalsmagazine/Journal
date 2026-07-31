import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const globalForDatabase = globalThis as typeof globalThis & {
  postgresClient?: ReturnType<typeof postgres>;
};

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return databaseUrl;
}

const postgresClient =
  globalForDatabase.postgresClient ??
  postgres(getDatabaseUrl(), {
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.postgresClient = postgresClient;
}

export const db = drizzle(postgresClient);
