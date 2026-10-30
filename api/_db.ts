import { neon } from '@neondatabase/serverless';

const DEFAULT_DATABASE_URL = 'postgresql://neondb_owner:npg_9bNiKeExT7yW@ep-square-smoke-b4yppib2-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

export function getDb() {
  const connectionString = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
  return neon(connectionString);
}

let isInitialized = false;

export async function ensureTables(sql: ReturnType<typeof neon>) {
  if (isInitialized) return;

  try {
    // 1. Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(128) PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        name VARCHAR(255),
        picture TEXT,
        provider VARCHAR(32) DEFAULT 'google',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_login TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    // 2. Saved diagrams table
    await sql`
      CREATE TABLE IF NOT EXISTS saved_diagrams (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        entities JSONB NOT NULL DEFAULT '[]'::jsonb,
        relationships JSONB NOT NULL DEFAULT '[]'::jsonb,
        user_id VARCHAR(128) DEFAULT 'public',
        user_email VARCHAR(255) DEFAULT '',
        is_guest BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    // 3. Ensure columns exist
    await sql`ALTER TABLE saved_diagrams ADD COLUMN IF NOT EXISTS user_id VARCHAR(128) DEFAULT 'public';`;
    await sql`ALTER TABLE saved_diagrams ADD COLUMN IF NOT EXISTS user_email VARCHAR(255) DEFAULT '';`;
    await sql`ALTER TABLE saved_diagrams ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE;`;

    isInitialized = true;
  } catch (err) {
    console.warn('Table initialization warning:', err);
  }
}
