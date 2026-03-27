import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Database setup ──────────────────────────────────────────────────────────
const db = new Database(join(__dirname, 'rsvps.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS rsvps (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name  TEXT    NOT NULL,
    last_name   TEXT    NOT NULL,
    email       TEXT    NOT NULL,
    phone       TEXT,
    guests      INTEGER NOT NULL DEFAULT 1,
    dietary     TEXT,
    message     TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Prepared statements
const insertRsvp = db.prepare(`
  INSERT INTO rsvps (first_name, last_name, email, phone, guests, dietary, message)
  VALUES (@first_name, @last_name, @email, @phone, @guests, @dietary, @message)
`);

const getAllRsvps = db.prepare(`SELECT * FROM rsvps ORDER BY created_at DESC`);
const getSummary = db.prepare(`
  SELECT
    COUNT(*) as total_rsvps,
    SUM(guests) as total_guests
  FROM rsvps
`);

// ── Routes ──────────────────────────────────────────────────────────────────

// POST /rsvp — submit an RSVP
app.post('/rsvp', (req, res) => {
  const { first_name, last_name, email, phone, guests, dietary, message } = req.body;

  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: 'first_name, last_name, and email are required.' });
  }

  if (!Number.isInteger(guests) || guests < 1 || guests > 20) {
    return res.status(400).json({ error: 'guests must be a number between 1 and 20.' });
  }

  // Basic email check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  try {
    const result = insertRsvp.run({ first_name, last_name, email, phone: phone ?? null, guests, dietary: dietary ?? null, message: message ?? null });
    return res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error.' });
  }
});

// GET /rsvps — list all RSVPs (protect this route in production!)
app.get('/rsvps', (req, res) => {
  // Optional: add a simple secret key check
  // if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) return res.status(401).json({ error: 'Unauthorised' });
  const rsvps = getAllRsvps.all();
  const summary = getSummary.get();
  return res.json({ summary, rsvps });
});

// Health check
app.get('/', (req, res) => res.json({ status: 'ok', message: "Josh's 21st RSVP API 🎉" }));

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
