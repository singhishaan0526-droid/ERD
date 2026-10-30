import { getDb, ensureTables } from '../_db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-User-Id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Diagram ID is required.' });
  }

  const sql = getDb();
  await ensureTables(sql);

  if (req.method === 'GET') {
    try {
      const rows = await sql`
        SELECT id, name, description, entities, relationships, user_id, user_email, is_guest, created_at, updated_at 
        FROM saved_diagrams WHERE id = ${String(id)}
      `;

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Diagram not found.' });
      }

      return res.status(200).json({ diagram: rows[0] });
    } catch (err: any) {
      console.error('Error fetching diagram in Vercel function:', err);
      return res.status(500).json({ error: err.message || 'Failed to fetch diagram.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const rows = await sql`DELETE FROM saved_diagrams WHERE id = ${String(id)} RETURNING id`;

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Diagram not found.' });
      }

      return res.status(200).json({ success: true, deletedId: id });
    } catch (err: any) {
      console.error('Error deleting diagram in Vercel function:', err);
      return res.status(500).json({ error: err.message || 'Failed to delete diagram.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
