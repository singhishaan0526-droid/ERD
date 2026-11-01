import crypto from 'node:crypto';
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

  const sql = getDb();

  if (req.method === 'GET') {
    try {
      const rows = await sql`
        SELECT 
          id, 
          name, 
          description, 
          is_guest,
          jsonb_array_length(entities) AS entity_count,
          jsonb_array_length(relationships) AS relationship_count,
          created_at, 
          updated_at
        FROM saved_diagrams
        WHERE user_id = ${session.id}
        ORDER BY updated_at DESC
      `;

      return res.status(200).json({ diagrams: rows });
    } catch (err: any) {
      console.error('Error fetching diagrams:', err);
      return res.status(500).json({ error: 'Failed to fetch diagrams.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const {
        id,
        name,
        description = '',
        entities = [],
        relationships = []
      } = body;

      // Validation and caps
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Diagram name is required.' });
      }
      if (name.length > 150) {
        return res.status(400).json({ error: 'Diagram name is too long (maximum 150 characters).' });
      }

      if (typeof description !== 'string' || description.length > 2000) {
        return res.status(400).json({ error: 'Description must be under 2000 characters.' });
      }

      if (!Array.isArray(entities) || entities.length > 100) {
        return res.status(400).json({ error: 'Entities must be an array with at most 100 items.' });
      }

      if (!Array.isArray(relationships) || relationships.length > 100) {
        return res.status(400).json({ error: 'Relationships must be an array with at most 100 items.' });
      }

      const diagramId = id && typeof id === 'string' && id.trim()
        ? id.trim().slice(0, 64)
        : `diag_${crypto.randomUUID()}`;

      const rows = await sql`
        INSERT INTO saved_diagrams (id, name, description, entities, relationships, user_id, user_email, is_guest, updated_at)
        VALUES (
          ${diagramId},
          ${name.trim()},
          ${description.trim()},
          ${JSON.stringify(entities)},
          ${JSON.stringify(relationships)},
          ${session.id},
          ${session.email || ''},
          ${session.type === 'guest'},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          entities = EXCLUDED.entities,
          relationships = EXCLUDED.relationships,
          updated_at = NOW()
        WHERE saved_diagrams.user_id = EXCLUDED.user_id
        RETURNING id, name, description, entities, relationships, is_guest, created_at, updated_at
      `;

      if (rows.length === 0) {
        return res.status(403).json({ error: 'You do not have permission to overwrite this diagram.' });
      }

      return res.status(200).json({
        diagram: rows[0],
        message: session.type === 'guest'
          ? 'Diagram saved to temporary guest session.'
          : 'Diagram saved to your permanent Neon account successfully.'
      });
    } catch (err: any) {
      console.error('Error saving diagram:', err);
      return res.status(500).json({ error: 'Failed to save diagram.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
