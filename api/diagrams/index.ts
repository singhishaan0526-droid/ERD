import { getDb, ensureTables } from '../_db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-User-Id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sql = getDb();
  await ensureTables(sql);

  if (req.method === 'GET') {
    try {
      const userId = req.query.userId || req.headers['x-user-id'];

      let rows;
      if (userId) {
        rows = await sql`
          SELECT 
            id, 
            name, 
            description, 
            user_id,
            user_email,
            is_guest,
            jsonb_array_length(entities) AS entity_count,
            jsonb_array_length(relationships) AS relationship_count,
            created_at, 
            updated_at
          FROM saved_diagrams
          WHERE user_id = ${String(userId)}
          ORDER BY updated_at DESC
        `;
      } else {
        rows = await sql`
          SELECT 
            id, 
            name, 
            description, 
            user_id,
            user_email,
            is_guest,
            jsonb_array_length(entities) AS entity_count,
            jsonb_array_length(relationships) AS relationship_count,
            created_at, 
            updated_at
          FROM saved_diagrams
          WHERE is_guest = FALSE OR is_guest IS NULL
          ORDER BY updated_at DESC
        `;
      }

      return res.status(200).json({ diagrams: rows });
    } catch (err: any) {
      console.error('Error fetching diagrams in Vercel function:', err);
      return res.status(500).json({ error: err.message || 'Failed to fetch diagrams.' });
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
        relationships = [],
        userId = 'public',
        userEmail = '',
        isGuest = false
      } = body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Diagram name is required.' });
      }

      if (!Array.isArray(entities)) {
        return res.status(400).json({ error: 'Entities must be an array.' });
      }

      const diagramId = id && typeof id === 'string' && id.trim()
        ? id.trim()
        : `diag_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      const rows = await sql`
        INSERT INTO saved_diagrams (id, name, description, entities, relationships, user_id, user_email, is_guest, updated_at)
        VALUES (
          ${diagramId},
          ${name.trim()},
          ${description.trim()},
          ${JSON.stringify(entities)},
          ${JSON.stringify(relationships)},
          ${String(userId)},
          ${String(userEmail)},
          ${Boolean(isGuest)},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          entities = EXCLUDED.entities,
          relationships = EXCLUDED.relationships,
          user_id = EXCLUDED.user_id,
          user_email = EXCLUDED.user_email,
          is_guest = EXCLUDED.is_guest,
          updated_at = NOW()
        RETURNING id, name, description, entities, relationships, user_id, user_email, is_guest, created_at, updated_at
      `;

      return res.status(200).json({
        diagram: rows[0],
        message: isGuest
          ? 'Diagram saved to temporary guest session.'
          : 'Diagram saved to your permanent Neon account successfully.'
      });
    } catch (err: any) {
      console.error('Error saving diagram in Vercel function:', err);
      return res.status(500).json({ error: err.message || 'Failed to save diagram.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
