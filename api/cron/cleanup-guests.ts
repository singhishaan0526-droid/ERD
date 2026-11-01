import { getDb } from '../_db';

export default async function handler(req: any, res: any) {
  // Vercel Cron authorization check
  const authHeader = req.headers?.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized cron invocation' });
  }

  try {
    const sql = getDb();
    const rows = await sql`
      DELETE FROM saved_diagrams 
      WHERE is_guest = TRUE AND created_at < NOW() - INTERVAL '24 hours'
      RETURNING id
    `;

    return res.status(200).json({
      success: true,
      cleanedGuestDiagrams: rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Cron guest cleanup error:', err);
    return res.status(500).json({ error: 'Failed to run guest cleanup' });
  }
}

