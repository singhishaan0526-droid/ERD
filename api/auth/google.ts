import { OAuth2Client } from 'google-auth-library';
import { getDb } from '../_db';
import { createSessionToken, setSessionCookie } from '../_auth';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { credential } = body;

    if (!credential || typeof credential !== 'string') {
      return res.status(401).json({ error: 'Missing Google credential token' });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('GOOGLE_CLIENT_ID environment variable is missing.');
      return res.status(500).json({ error: 'Server authentication configuration error.' });
    }

    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
    } catch (verifyErr: any) {
      console.error('Google token verification failed:', verifyErr.message);
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email || !payload.email_verified) {
      return res.status(401).json({ error: 'Invalid Google token payload or unverified email' });
    }

    const userId = payload.sub;
    const userEmail = payload.email.toLowerCase().trim();
    const userName = payload.name || payload.given_name || 'Google User';
    const userPicture = payload.picture || '';

    const sql = getDb();
    const rows = await sql`
      INSERT INTO users (id, email, name, picture, provider, last_login)
      VALUES (${userId}, ${userEmail}, ${userName}, ${userPicture}, 'google', NOW())
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        picture = CASE WHEN EXCLUDED.picture <> '' THEN EXCLUDED.picture ELSE users.picture END,
        last_login = NOW()
      RETURNING id, email, name, picture
    `;

    const userRecord = rows[0] || { id: userId, email: userEmail, name: userName, picture: userPicture };

    const sessionUser = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      picture: userRecord.picture,
      type: 'google' as const
    };

    const sessionToken = await createSessionToken(sessionUser);
    setSessionCookie(res, sessionToken, false);

    return res.status(200).json({
      success: true,
      user: sessionUser
    });
  } catch (err: any) {
    console.error('Google auth handler error:', err);
    return res.status(500).json({ error: 'Authentication failed.' });
  }
}
