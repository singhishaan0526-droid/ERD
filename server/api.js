import express from 'express';
import rateLimit from 'express-rate-limit';
import { generateERDiagram } from './generator.js';
import { query } from './db.js';

const router = express.Router();

// Basic rate limiting: 30 requests per minute for AI generation
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
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
      error: err.message || 'Failed to generate diagram. Please try again.'
    });
  }
});

// --- Neon Postgres Service Endpoints ---

// Check Neon database health and connection status
router.get('/db/status', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(503).json({
        status: 'disconnected',
        error: 'DATABASE_URL is not configured.'
      });
    }

    const result = await query(`
      SELECT 
        current_database() AS database,
        current_user AS user,
        version() AS version,
        NOW() AS server_time,
        (SELECT COUNT(*) FROM saved_diagrams) AS total_saved_diagrams
    `);

    const row = result.rows[0];
    return res.json({
      status: 'connected',
      provider: 'Neon Postgres',
      database: row.database,
      user: row.user,
      version: row.version,
      serverTime: row.server_time,
      totalSavedDiagrams: parseInt(row.total_saved_diagrams, 10),
      latencyMs: result.duration,
      branch: process.env.NEON_BRANCH || 'production'
    });
  } catch (err) {
    console.error('Neon DB status check error:', err);
    return res.status(500).json({
      status: 'error',
      error: err.message || 'Database connection error'
    });
  }
});

// --- Authentication Endpoints ---

// Google Login / Upsert User in Neon Postgres
router.post('/auth/google', async (req, res) => {
  try {
    const { id, email, name, picture } = req.body || {};
    if (!id || !email) {
      return res.status(400).json({ error: 'Missing Google user ID or email.' });
    }

    const userId = String(id).trim();
    const userEmail = String(email).toLowerCase().trim();
    const userName = name ? String(name).trim() : 'Google User';
    const userPicture = picture ? String(picture) : '';

    const result = await query(
      `INSERT INTO users (id, email, name, picture, provider, last_login)
       VALUES ($1, $2, $3, $4, 'google', NOW())
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         email = EXCLUDED.email,
         picture = EXCLUDED.picture,
         last_login = NOW()
       RETURNING id, email, name, picture, provider, created_at, last_login`,
      [userId, userEmail, userName, userPicture]
    );

    return res.json({ user: result.rows[0], success: true });
  } catch (err) {
    console.error('Google auth error:', err);
    return res.status(500).json({ error: err.message || 'Failed to authenticate user.' });
  }
});

// Guest Wipe: Deletes all temporary diagrams and data associated with a guest session
router.post('/auth/guest-wipe', async (req, res) => {
  try {
    const { guestId } = req.body || {};
    if (guestId) {
      const result = await query(
        `DELETE FROM saved_diagrams WHERE user_id = $1 OR (is_guest = TRUE AND user_id = $1)`,
        [String(guestId)]
      );
      return res.json({
        success: true,
        message: 'Guest session wiped completely.',
        deletedCount: result.rowCount
      });
    }

    // If no guestId specified, clean up all guest diagrams flagged as guest
    const result = await query(`DELETE FROM saved_diagrams WHERE is_guest = TRUE`);
    return res.json({
      success: true,
      message: 'All guest records deleted.',
      deletedCount: result.rowCount
    });
  } catch (err) {
    console.error('Guest wipe error:', err);
    return res.status(500).json({ error: err.message || 'Failed to wipe guest data.' });
  }
});

// List saved diagrams (scoped by user, or public)
router.get('/diagrams', async (req, res) => {
  try {
    const userId = req.query.userId || req.headers['x-user-id'];

    let result;
    if (userId) {
      // Return diagrams belonging to this specific user (Google or Guest)
      result = await query(
        `SELECT 
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
        WHERE user_id = $1
        ORDER BY updated_at DESC`,
        [String(userId)]
      );
    } else {
      // Default / public list
      result = await query(`
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
      `);
    }

    return res.json({ diagrams: result.rows });
  } catch (err) {
    console.error('Error fetching diagrams:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch diagrams.' });
  }
});

// Get a single diagram by ID
router.get('/diagrams/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT id, name, description, entities, relationships, user_id, user_email, is_guest, created_at, updated_at 
       FROM saved_diagrams WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Diagram not found.' });
    }

    return res.json({ diagram: result.rows[0] });
  } catch (err) {
    console.error('Error fetching diagram:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch diagram.' });
  }
});

// Save or update a diagram (with user ownership)
router.post('/diagrams', async (req, res) => {
  try {
    const {
      id,
      name,
      description = '',
      entities = [],
      relationships = [],
      userId = 'public',
      userEmail = '',
      isGuest = false
    } = req.body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Diagram name is required.' });
    }

    if (!Array.isArray(entities)) {
      return res.status(400).json({ error: 'Entities must be an array.' });
    }

    const diagramId = id && typeof id === 'string' && id.trim()
      ? id.trim()
      : `diag_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const result = await query(
      `INSERT INTO saved_diagrams (id, name, description, entities, relationships, user_id, user_email, is_guest, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7, $8, NOW())
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         entities = EXCLUDED.entities,
         relationships = EXCLUDED.relationships,
         user_id = EXCLUDED.user_id,
         user_email = EXCLUDED.user_email,
         is_guest = EXCLUDED.is_guest,
         updated_at = NOW()
       RETURNING id, name, description, entities, relationships, user_id, user_email, is_guest, created_at, updated_at`,
      [
        diagramId,
        name.trim(),
        description.trim(),
        JSON.stringify(entities),
        JSON.stringify(relationships),
        String(userId),
        String(userEmail),
        Boolean(isGuest)
      ]
    );

    return res.json({
      diagram: result.rows[0],
      message: isGuest
        ? 'Diagram saved to temporary guest session.'
        : 'Diagram saved to your permanent Neon account successfully.'
    });
  } catch (err) {
    console.error('Error saving diagram:', err);
    return res.status(500).json({ error: err.message || 'Failed to save diagram.' });
  }
});

// Delete a diagram
router.delete('/diagrams/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM saved_diagrams WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Diagram not found.' });
    }

    return res.json({ success: true, deletedId: id });
  } catch (err) {
    console.error('Error deleting diagram:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete diagram.' });
  }
});

export default router;
