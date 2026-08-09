import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

function createPool(): Pool {
  if (!databaseUrl) {
    // Return a dummy pool that will throw clear errors on actual usage
    // This prevents crash during static page generation at build time
    return new Proxy({} as Pool, {
      get(_, prop) {
        if (prop === "query" || prop === "connect") {
          return () => {
            throw new Error(
              "DATABASE_URL is not set. Please add it to your environment variables."
            );
          };
        }
        return undefined;
      },
    });
  }

  if (globalForDb.__arenaNextJsPostgresqlPool) {
    return globalForDb.__arenaNextJsPostgresqlPool;
  }

  const isSSL =
    databaseUrl.includes("sslmode=require") ||
    databaseUrl.includes("neon.tech") ||
    databaseUrl.includes("supabase");

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: isSSL ? { rejectUnauthorized: false } : undefined,
  });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }

  return pool;
}

export const pool = createPool();
export const db = drizzle(pool);
