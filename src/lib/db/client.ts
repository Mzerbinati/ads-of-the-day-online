import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

let sql: ReturnType<typeof postgres> | null = null;
let db: Db | null = null;

export function getDb(): Db {
  if (db) return db;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL non impostata. Copia .env.local.example in .env.local e inserisci la connection string Supabase."
    );
  }

  // prepare: false works with Supabase pooler; ssl required for direct connections.
  sql = postgres(url, { prepare: false, max: 10, ssl: "require" });
  db = drizzle(sql, { schema });
  return db;
}

export async function closeDb(): Promise<void> {
  if (sql) {
    await sql.end({ timeout: 5 });
    sql = null;
    db = null;
  }
}
