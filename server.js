import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import apiRouter from './server/api.js';
import { initDb } from './server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API routes (including AI generator and Neon Postgres persistence)
app.use('/api', apiRouter);

// Disable caching so browser always loads latest build
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Serve static frontend in production
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, async () => {
  console.log(`ER Diagram Maker server running on http://localhost:${PORT}`);
  try {
    await initDb();
  } catch (err) {
    console.error('Error connecting to Neon database:', err.message);
  }
});
