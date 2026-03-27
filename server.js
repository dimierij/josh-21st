import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const SHEETS_WEBHOOK = 'https://script.google.com/macros/s/AKfycbznqRKC1zUgEM9NmOayHSgasVbdtVQFBTOCzcrjIdxWXbFQCNoOmCN5Y5arAbr5dqqO/exec';

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(join(__dirname, 'rsvps.db'));

db.run(`CREATE TABLE IF NOT EXISTS rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  guests INTEGER NOT NULL DEFAULT 1,
  dietary TEXT,
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

app.post('/rsvp', (req, res) => {
  const { first_name, last_name, email, phone, guests, dietary, message } = req.body;
  if (!first_name || !last_name || !email) return res.status(400).json({ error: 'Missing required fields' });

  db.run(
    `INSERT INTO rsvps (first_name, last_name, email, phone, guests, dietary, message) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [first_name, last_name, email, phone || null, guests || 1, dietary || null, message || null],
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });

      // Send to Google Sheets
      fetch(SHEETS_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name, last_name, email, phone, guests, dietary, message })
      }).catch(err => console.error('Sheets error:', err));

      res.status(201).json({ success: true, id: this.lastID });
    }
  );
});

app.get('/rsvps', (req, res) => {
  db.all(`SELECT * FROM rsvps ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ total_rsvps: rows.length, total_guests: rows.reduce((sum, r) => sum + r.guests, 0), rsvps: rows });
  });
});

app.get('/', (req, res) => res.json({ status: 'ok', message: "Josh's 21st RSVP API 🎉" }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
