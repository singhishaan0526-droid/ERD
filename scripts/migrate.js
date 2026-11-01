import dns from 'node:dns';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// DNS fallback for local environments
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
if (!connectionString) {
  console.error('Error: DATABASE_URL is not set in environment.');
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  console.log('Connecting to Neon PostgreSQL for database migration...');
  try {
    await client.connect();
    console.log('✓ Connected to Neon PostgreSQL.');

    // 1. Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(128) PRIMARY KEY,
        email VARCHAR(255),
        name VARCHAR(255),
        picture TEXT,
        provider VARCHAR(32) DEFAULT 'google',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_login TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✓ Table "users" verified.');

    // 2. Saved diagrams table
    await client.query(`
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
    `);
    console.log('✓ Table "saved_diagrams" verified.');

    // 3. Ensure columns and indexes exist
    await client.query(`ALTER TABLE saved_diagrams ADD COLUMN IF NOT EXISTS user_id VARCHAR(128) DEFAULT 'public';`);
    await client.query(`ALTER TABLE saved_diagrams ADD COLUMN IF NOT EXISTS user_email VARCHAR(255) DEFAULT '';`);
    await client.query(`ALTER TABLE saved_diagrams ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE;`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_saved_diagrams_user_id ON saved_diagrams(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_saved_diagrams_guest ON saved_diagrams(is_guest);`);
    console.log('✓ Indexes on "saved_diagrams" verified.');

    // 4. Verify existing tables and schemas
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('Current public tables:', tablesRes.rows.map(r => r.table_name).join(', '));

    console.log('\n=================================================');
    console.log('Neon database migration completed successfully!');
    console.log('=================================================\n');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
