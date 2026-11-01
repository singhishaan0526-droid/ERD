import express from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import { generateERDiagram } from './generator.js';
import { query } from './db.js';
import {
  getSessionUser,
  createSessionToken,
  setSessionCookie,
  clearSessionCookie
} from './auth.js';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Basic rate limiting: 15 requests per minute for AI generation
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { error: 'Too many requests. Please wait a minute and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI ER Diagram Generation
router.post('/generate', limiter, async (req, res) => {
  try {
    const { description } = req.body || {};
    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ error: 'Please provide a valid database description text.' });
    }

    if (description.length > 2000) {
      return res.status(400).json({ error: 'Description is too long. Please keep under 2000 characters.' });
    }

    const erModel = await generateERDiagram(description);
    return res.json(erModel);
  } catch (err) {
    console.error('Error generating ER diagram:', err);
    return res.status(500).json({
      error: 'Failed to generate diagram. Please try again.'
    });
  }
});

// --- Neon Postgres Status Endpoint ---
router.get('/db/status', async (req, res) => {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }

    if (!process.env.DATABASE_URL) {
      return res.status(503).json({
        status: 'disconnected',
        error: 'DATABASE_URL is not configured.'
      });
    }

    const result = await query(
      `SELECT 1 as ping, (SELECT COUNT(*) FROM saved_diagrams WHERE user_id = $1) AS user_diagrams`,
      [session.id]
    );

    const row = result.rows[0];
    return res.json({
      status: 'connected',
      provider: 'Neon Serverless Postgres',
      latencyMs: result.duration,
      userSavedDiagrams: parseInt(row?.user_diagrams || '0', 10)
    });
  } catch (err) {
    console.error('Neon DB status check error:', err);
    return res.status(500).json({
      status: 'error',
      error: 'Database connection error'
    });
  }
});

// --- Authentication Endpoints ---

// Google Login: verify credential token from Google Identity Services
router.post('/auth/google', async (req, res) => {
  try {
    const { credential } = req.body || {};
    if (!credential || typeof credential !== 'string') {
      return res.status(401).json({ error: 'Missing Google credential token.' });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('GOOGLE_CLIENT_ID is not configured.');
      return res.status(500).json({ error: 'Server authentication configuration error.' });
    }

    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
    } catch (verifyErr) {
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

    const result = await query(
      `INSERT INTO users (id, email, name, picture, provider, last_login)
       VALUES ($1, $2, $3, $4, 'google', NOW())
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         name = EXCLUDED.name,
         picture = CASE WHEN EXCLUDED.picture <> '' THEN EXCLUDED.picture ELSE users.picture END,
         last_login = NOW()
       RETURNING id, email, name, picture`,
      [userId, userEmail, userName, userPicture]
    );

    const userRecord = result.rows[0] || { id: userId, email: userEmail, name: userName, picture: userPicture };
    const sessionUser = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      picture: userRecord.picture,
      type: 'google'
    };

    const sessionToken = await createSessionToken(sessionUser);
    setSessionCookie(res, sessionToken, false);

    return res.json({ success: true, user: sessionUser });
  } catch (err) {
    console.error('Google auth error:', err);
    return res.status(500).json({ error: 'Failed to authenticate user.' });
  }
});

// Guest Login: creates a server-issued guest session
router.post('/auth/guest', async (req, res) => {
  try {
    const guestId = `guest_${crypto.randomUUID()}`;
    const guestUser = {
      id: guestId,
      name: 'Guest User',
      type: 'guest'
    };

    const token = await createSessionToken(guestUser);
    setSessionCookie(res, token, true);

    return res.json({ success: true, user: guestUser });
  } catch (err) {
    console.error('Guest auth error:', err);
    return res.status(500).json({ error: 'Failed to create guest session.' });
  }
});

// Check Session
router.get('/auth/me', async (req, res) => {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized', user: null });
    }
    return res.json({ user: session });
  } catch (err) {
    console.error('Session verification error:', err);
    return res.status(500).json({ error: 'Failed to verify session' });
  }
});

// Logout
router.post('/auth/logout', (req, res) => {
  try {
    clearSessionCookie(res);
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ error: 'Failed to log out' });
  }
});

// Guest Wipe: Deletes all temporary diagrams belonging ONLY to the caller's guest session
router.post('/auth/guest-wipe', async (req, res) => {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized: Session required for guest wipe' });
    }

    if (session.type !== 'guest') {
      return res.status(403).json({ error: 'Forbidden: Only guest sessions can be wiped' });
    }

    const result = await query(
      `DELETE FROM saved_diagrams WHERE user_id = $1 AND is_guest = TRUE`,
      [session.id]
    );

    clearSessionCookie(res);

    return res.json({
      success: true,
      message: 'Guest session wiped completely.',
      deletedCount: result.rowCount
    });
  } catch (err) {
    console.error('Guest wipe error:', err);
    return res.status(500).json({ error: 'Failed to wipe guest data.' });
  }
});

// List saved diagrams (scoped strictly to verified user)
router.get('/diagrams', async (req, res) => {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }

    const result = await query(
      `SELECT 
        id, 
        name, 
        description, 
        is_guest,
        jsonb_array_length(entities) AS entity_count,
        jsonb_array_length(relationships) AS relationship_count,
        created_at, 
        updated_at
      FROM saved_diagrams
      WHERE user_id = $1
      ORDER BY updated_at DESC`,
      [session.id]
    );

    return res.json({ diagrams: result.rows });
  } catch (err) {
    console.error('Error fetching diagrams:', err);
    return res.status(500).json({ error: 'Failed to fetch diagrams.' });
  }
});

// Get a single diagram by ID (owner check)
router.get('/diagrams/:id', async (req, res) => {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }

    const { id } = req.params;
    const result = await query(
      `SELECT id, name, description, entities, relationships, is_guest, created_at, updated_at 
       FROM saved_diagrams WHERE id = $1 AND user_id = $2`,
      [id, session.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Diagram not found.' });
    }

    return res.json({ diagram: result.rows[0] });
  } catch (err) {
    console.error('Error fetching diagram:', err);
    return res.status(500).json({ error: 'Failed to fetch diagram.' });
  }
});

// Save or update a diagram (strictly scoped to owner)
router.post('/diagrams', async (req, res) => {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }

    const {
      id,
      name,
      description = '',
      entities = [],
      relationships = []
    } = req.body || {};

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

    const result = await query(
      `INSERT INTO saved_diagrams (id, name, description, entities, relationships, user_id, user_email, is_guest, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7, $8, NOW())
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         entities = EXCLUDED.entities,
         relationships = EXCLUDED.relationships,
         updated_at = NOW()
       WHERE saved_diagrams.user_id = EXCLUDED.user_id
       RETURNING id, name, description, entities, relationships, is_guest, created_at, updated_at`,
      [
        diagramId,
        name.trim(),
        description.trim(),
        JSON.stringify(entities),
        JSON.stringify(relationships),
        session.id,
        session.email || '',
        session.type === 'guest'
      ]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'You do not have permission to overwrite this diagram.' });
    }

    return res.json({
      diagram: result.rows[0],
      message: session.type === 'guest'
        ? 'Diagram saved to temporary guest session.'
        : 'Diagram saved to your permanent Neon account successfully.'
    });
  } catch (err) {
    console.error('Error saving diagram:', err);
    return res.status(500).json({ error: 'Failed to save diagram.' });
  }
});

// Delete a diagram (strictly scoped to owner)
router.delete('/diagrams/:id', async (req, res) => {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }

    const { id } = req.params;
    const result = await query(
      'DELETE FROM saved_diagrams WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, session.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Diagram not found.' });
    }

    return res.json({ success: true, deletedId: id });
  } catch (err) {
    console.error('Error deleting diagram:', err);
    return res.status(500).json({ error: 'Failed to delete diagram.' });
  }
});

export default router;
