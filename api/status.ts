import { neon } from '@neondatabase/serverless';

export default async function handler(req: any, res: any) {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return res.status(503).json({ error: 'DATABASE_URL is not set' });
    }
    const sql = neon(databaseUrl);
    const rows = await sql`SELECT current_database() as database, version() as version, NOW() as server_time`;
    return res.status(200).json({
      status: 'connected',
      provider: 'Neon Postgres (Serverless)',
      data: rows[0]
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
