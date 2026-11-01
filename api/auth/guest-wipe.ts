import { getDb } from '../_db';
import { getSessionUser, clearSessionCookie } from '../_auth';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSessionUser(req);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized: Session required for guest wipe' });
    }

    if (session.type !== 'guest') {
      return res.status(403).json({ error: 'Forbidden: Only guest sessions can be wiped' });
    }

    const sql = getDb();
    const rows = await sql`
      DELETE FROM saved_diagrams 
      WHERE user_id = ${session.id} AND is_guest = TRUE 
      RETURNING id
    `;

    clearSessionCookie(res);

    return res.status(200).json({
      success: true,
      message: 'Guest session wiped successfully.',
      deletedCount: rows.length
    });
  } catch (err: any) {
    console.error('Guest wipe error:', err);
    return res.status(500).json({ error: 'Failed to wipe guest data.' });
  }
}
