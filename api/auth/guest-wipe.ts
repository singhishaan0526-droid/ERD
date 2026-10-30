import { getDb, ensureTables } from '../_db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-User-Id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { guestId } = body;

    const sql = getDb();
    await ensureTables(sql);

    let rows;
    if (guestId) {
      rows = await sql`DELETE FROM saved_diagrams WHERE user_id = ${String(guestId)} OR (is_guest = TRUE AND user_id = ${String(guestId)}) RETURNING id`;
    } else {
      rows = await sql`DELETE FROM saved_diagrams WHERE is_guest = TRUE RETURNING id`;
    }

    return res.status(200).json({
      success: true,
      message: 'Guest session wiped completely.',
      deletedCount: rows.length
    });
  } catch (err: any) {
    console.error('Guest wipe error in Vercel function:', err);
    return res.status(500).json({ error: err.message || 'Failed to wipe guest data.' });
  }
}
