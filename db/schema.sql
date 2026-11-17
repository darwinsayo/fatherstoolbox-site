-- Cloudflare D1 schema for event RSVPs. Run once (see the README, "Event RSVPs").
-- Every RSVP is saved with the parish and event it belongs to, so each parish sees only its own.
CREATE TABLE IF NOT EXISTS rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  parish TEXT NOT NULL,
  event TEXT NOT NULL,
  parts TEXT NOT NULL DEFAULT '',  -- which parts of the event, e.g. 'lessons-carols,open-house'
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  attending INTEGER NOT NULL,
  note TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS rsvps_parish_event ON rsvps (parish, event);
