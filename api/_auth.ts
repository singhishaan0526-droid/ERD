import { SignJWT, jwtVerify } from 'jose';
import { verifyToken } from '@clerk/backend';

export interface SessionUser {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
  type: 'clerk' | 'google' | 'guest';
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || process.env.DATABASE_URL || 'erd-maker-secure-session-signing-secret-default-key-32chars';
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  const duration = user.type === 'guest' ? '24h' : '7d';
  return await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(duration)
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (!payload?.id || !payload?.type) {
      return null;
    }
    return {
      id: String(payload.id),
      email: payload.email ? String(payload.email) : undefined,
      name: payload.name ? String(payload.name) : undefined,
      picture: payload.picture ? String(payload.picture) : undefined,
      type: payload.type === 'guest' ? 'guest' : payload.type === 'clerk' ? 'clerk' : 'google'
    };
  } catch {
    return null;
  }
}

export function parseCookies(req: any): Record<string, string> {
  const cookieHeader = req?.headers?.cookie || (typeof req?.headers?.get === 'function' ? req.headers.get('cookie') : '');
  if (!cookieHeader || typeof cookieHeader !== 'string') return {};

  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach((pair: string) => {
    const idx = pair.indexOf('=');
    if (idx > -1) {
      const key = pair.slice(0, idx).trim();
      const val = pair.slice(idx + 1).trim();
      cookies[key] = decodeURIComponent(val);
    }
  });
  return cookies;
}

export async function getSessionUser(req: any): Promise<SessionUser | null> {
  const clerkSecret = process.env.CLERK_SECRET_KEY;

  // 1. Check Bearer Authorization header for Clerk token
  const authHeader = req?.headers?.authorization || (typeof req?.headers?.get === 'function' ? req.headers.get('authorization') : '');
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ') && clerkSecret) {
    const token = authHeader.slice(7).trim();
    try {
      const payload = await verifyToken(token, { secretKey: clerkSecret });
      if (payload?.sub) {
        return {
          id: String(payload.sub),
          email: payload.email ? String(payload.email) : undefined,
          type: 'clerk'
        };
      }
    } catch {
      // Continue to check cookies if bearer token wasn't a valid Clerk token
    }
  }

  const cookies = parseCookies(req);

  // 2. Check Clerk __session cookie
  if (cookies.__session && clerkSecret) {
    try {
      const payload = await verifyToken(cookies.__session, { secretKey: clerkSecret });
      if (payload?.sub) {
        return {
          id: String(payload.sub),
          email: payload.email ? String(payload.email) : undefined,
          type: 'clerk'
        };
      }
    } catch {
      // Continue to custom session check
    }
  }

  // 3. Fallback to custom/guest session cookie
  const token = cookies.erd_session;
  if (!token) return null;
  return await verifySessionToken(token);
}

export function setSessionCookie(res: any, token: string, isGuest = false): void {
  const maxAge = isGuest ? 86400 : 7 * 86400;
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  const secureFlag = isProd ? '; Secure' : '';
  const cookieValue = `erd_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secureFlag}`;
  res.setHeader('Set-Cookie', cookieValue);
}

export function clearSessionCookie(res: any): void {
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  const secureFlag = isProd ? '; Secure' : '';
  const cookieValue = `erd_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secureFlag}`;
  res.setHeader('Set-Cookie', cookieValue);
}
