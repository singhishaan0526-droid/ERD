import { getDb, ensureTables } from '../_db';

export default async function handler(req: any, res: any) {
  // Enable CORS
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
    const { id, email, name, picture } = body;

    if (!id || !email) {
      return res.status(400).json({ error: 'Missing Google user ID or email.' });
    }

    const userId = String(id).trim();
    const userEmail = String(email).toLowerCase().trim();
    const userName = name ? String(name).trim() : 'Google User';
    const userPicture = picture ? String(picture) : '';

    const sql = getDb();
    await ensureTables(sql);

    const rows = await sql`
      INSERT INTO users (id, email, name, picture, provider, last_login)
      VALUES (${userId}, ${userEmail}, ${userName}, ${userPicture}, 'google', NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        picture = EXCLUDED.picture,
        last_login = NOW()
      RETURNING id, email, name, picture, provider, created_at, last_login
    `;

    return res.status(200).json({ user: rows[0], success: true });
  } catch (err: any) {
    console.error('Google auth error in Vercel function:', err);
    return res.status(500).json({ error: err.message || 'Failed to authenticate user.' });
  }
}
