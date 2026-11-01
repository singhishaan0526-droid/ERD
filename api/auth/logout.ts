import { clearSessionCookie } from '../_auth';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    clearSessionCookie(res);
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err: any) {
    console.error('Logout handler error:', err);
    return res.status(500).json({ error: 'Failed to log out' });
  }
}

