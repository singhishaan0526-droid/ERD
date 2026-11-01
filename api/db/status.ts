import { getDb } from '../_db';
import { getSessionUser } from '../_auth';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
  }

  try {
    const start = Date.now();
    const sql = getDb();

    const rows = await sql`
      SELECT 1 as ping, 
             (SELECT COUNT(*) FROM saved_diagrams WHERE user_id = ${session.id}) AS user_diagrams
    `;

    const duration = Date.now() - start;
    const row = rows[0];

    return res.status(200).json({
      status: 'connected',
      provider: 'Neon Serverless Postgres',
      latencyMs: duration,
      userSavedDiagrams: parseInt(String(row?.user_diagrams || '0'), 10)
    });
  } catch (err: any) {
    console.error('Neon DB status check error:', err);
    return res.status(500).json({
      status: 'error',
      error: 'Database service unavailable.'
    });
  }
}
