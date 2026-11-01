import { getSessionUser } from '../_auth';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized', user: null });
    }

    return res.status(200).json({ user });
  } catch (err: any) {
    console.error('Session verification error:', err);
    return res.status(500).json({ error: 'Failed to verify session' });
  }
}

