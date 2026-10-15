import express from 'express';
import rateLimit from 'express-rate-limit';
import { generateERDiagram } from './generator.js';

const router = express.Router();

// Basic rate limiting: 30 requests per minute
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many requests. Please wait a minute and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

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

export default router;
