import { neon } from '@neondatabase/serverless';

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

let isInitialized = false;

export async function ensureTables(sql: ReturnType<typeof neon>) {
  if (isInitialized) return;

  try {
    // 1. Users table (indexed by id = Google sub)
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(128) PRIMARY KEY,
        email VARCHAR(255),
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
        user_id VARCHAR(128) NOT NULL,
        user_email VARCHAR(255) DEFAULT '',
        is_guest BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    // 3. Ensure columns and indexes exist
    await sql`ALTER TABLE saved_diagrams ADD COLUMN IF NOT EXISTS user_id VARCHAR(128) DEFAULT 'public';`;
    await sql`ALTER TABLE saved_diagrams ADD COLUMN IF NOT EXISTS user_email VARCHAR(255) DEFAULT '';`;
    await sql`ALTER TABLE saved_diagrams ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE;`;
    await sql`CREATE INDEX IF NOT EXISTS idx_saved_diagrams_user_id ON saved_diagrams(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_saved_diagrams_guest ON saved_diagrams(is_guest);`;

    isInitialized = true;
  } catch (err) {
    console.warn('Table initialization warning:', err);
  }
}
