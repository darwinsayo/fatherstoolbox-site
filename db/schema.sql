-- Cloudflare D1 schema for event RSVPs. Run once (see the README, "Event RSVPs").
CREATE TABLE IF NOT EXISTS rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  attending INTEGER NOT NULL,
  note TEXT NOT NULL DEFAULT ''
);
