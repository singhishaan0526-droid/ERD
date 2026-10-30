import { getDb, ensureTables } from '../_db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const start = Date.now();
    const sql = getDb();
    await ensureTables(sql);

    const rows = await sql`
      SELECT 
        current_database() AS database,
        current_user AS user,
        version() AS version,
        NOW() AS server_time,
        (SELECT COUNT(*) FROM saved_diagrams) AS total_saved_diagrams
    `;

    const duration = Date.now() - start;
    const row = rows[0];

    return res.status(200).json({
      status: 'connected',
      provider: 'Neon Postgres (Serverless)',
      database: row.database,
      user: row.user,
      version: row.version,
      serverTime: row.server_time,
      totalSavedDiagrams: parseInt(String(row.total_saved_diagrams), 10),
      latencyMs: duration,
      branch: process.env.NEON_BRANCH || 'production'
    });
  } catch (err: any) {
    console.error('Neon DB status check error in Vercel function:', err);
    return res.status(500).json({
      status: 'error',
      error: err.message || 'Database connection error'
    });
  }
}
