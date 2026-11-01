import { getDb } from '../_db';
import { getSessionUser } from '../_auth';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Valid diagram ID is required.' });
  }

  const sql = getDb();

  if (req.method === 'GET') {
    try {
      const rows = await sql`
        SELECT id, name, description, entities, relationships, is_guest, created_at, updated_at 
        FROM saved_diagrams 
        WHERE id = ${id} AND user_id = ${session.id}
      `;

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Diagram not found.' });
      }

      return res.status(200).json({ diagram: rows[0] });
    } catch (err: any) {
      console.error('Error fetching diagram:', err);
      return res.status(500).json({ error: 'Failed to fetch diagram.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const rows = await sql`
        DELETE FROM saved_diagrams 
        WHERE id = ${id} AND user_id = ${session.id} 
        RETURNING id
      `;

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Diagram not found.' });
      }

      return res.status(200).json({ success: true, deletedId: id });
    } catch (err: any) {
      console.error('Error deleting diagram:', err);
      return res.status(500).json({ error: 'Failed to delete diagram.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
