import dns from 'node:dns';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Resilience for local environments: If local ISP DNS (e.g. Jio / local router) fails to resolve *.neon.tech,
// fallback to trusted public resolvers (1.1.1.1 / 8.8.8.8).
const originalLookup = dns.lookup;
const resolver = new dns.Resolver();
resolver.setServers(['1.1.1.1', '8.8.8.8']);

dns.lookup = (hostname, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  if (hostname && typeof hostname === 'string' && hostname.includes('neon.tech')) {
    resolver.resolve4(hostname, (err, addresses) => {
      if (err || !addresses || !addresses.length) {
        return originalLookup(hostname, options, callback);
      }
      if (options && options.all) {
        return callback(null, addresses.map(addr => ({ address: addr, family: 4 })));
      }
      return callback(null, addresses[0], 4);
    });
  } else {
    originalLookup(hostname, options, callback);
  }
};

const connectionString = process.env.DATABASE_URL;

export const pool = new pg.Pool({
  connectionString,
  ssl: connectionString ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

// Ensure database table for ER diagrams exists
let isInitialized = false;
export async function initDb() {
  if (isInitialized) return;
  if (!connectionString) {
    console.warn('DATABASE_URL is not set. Neon Postgres features will be offline.');
    return;
  }

  const client = await pool.connect();
  try {
    // 1. Users table for persistent Google logins
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(128) PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        name VARCHAR(255),
        picture TEXT,
        provider VARCHAR(32) DEFAULT 'google',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_login TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 2. Saved diagrams table with user ownership & guest tracking
    await client.query(`
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
    `);

    // Ensure columns exist if table was already created earlier
    await client.query(`
      ALTER TABLE saved_diagrams ADD COLUMN IF NOT EXISTS user_id VARCHAR(128) DEFAULT 'public';
      ALTER TABLE saved_diagrams ADD COLUMN IF NOT EXISTS user_email VARCHAR(255) DEFAULT '';
      ALTER TABLE saved_diagrams ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE;
    `);

    isInitialized = true;
    console.log('Neon Postgres initialized: "users" & "saved_diagrams" tables ready.');
  } finally {
    client.release();
  }
}

export async function query(text, params) {
  await initDb();
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  return { ...res, duration };
}
