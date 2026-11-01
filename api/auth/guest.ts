import crypto from 'node:crypto';
import { createSessionToken, setSessionCookie } from '../_auth';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const guestId = `guest_${crypto.randomUUID()}`;
    const guestUser = {
      id: guestId,
      name: 'Guest User',
      type: 'guest' as const
    };

    const token = await createSessionToken(guestUser);
    setSessionCookie(res, token, true);

    return res.status(200).json({
      success: true,
      user: guestUser
    });
  } catch (err: any) {
    console.error('Guest auth handler error:', err);
    return res.status(500).json({ error: 'Failed to create guest session' });
  }
}

