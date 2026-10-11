import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@localhost:5432/proofcheck";

// For queries and migrations
export const sqlClient = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 5,
  onnotice: () => {}, // suppress verbose notices
});

export const db = drizzle(sqlClient, { schema });

/**
 * Checks database connectivity without throwing unhandled exceptions.
 */
export async function checkDbConnection(): Promise<boolean> {
  try {
    await sqlClient`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export { schema };
