// Cloudflare Pages Function: /api/admin/raffle  (private; used by /admin/raffle/)
// Lists the Christmas Walk raffle entries, draws winners and exports a CSV.
// Protected by the ADMIN_PASSWORD secret (Pages project > Settings > Variables and Secrets).
// The password is sent in the "x-admin-password" header and compared in constant time.
//   GET                -> { entries, draws }       (one entry per email address, earliest kept)
//   GET ?format=csv    -> CSV download
//   POST {action:"draw"} -> picks one not-yet-drawn entry with crypto randomness and records it
// Draws are saved in the raffle_draws table (created here if missing), so alternates never repeat.

const PARISH = "st-cecilia";
const EVENT = "christmas-walk-raffle";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store", "x-robots-tag": "noindex" } });

async function authorized(request, env) {
  const given = request.headers.get("x-admin-password") || "";
  const secret = env.ADMIN_PASSWORD || "";
  if (!secret) return "not-configured";
  const enc = new TextEncoder();
  // Hash both so the comparison always has the same length, then compare every byte.
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(given)),
    crypto.subtle.digest("SHA-256", enc.encode(secret)),
  ]);
  const x = new Uint8Array(a), y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0 ? "ok" : "bad";
}

async function gate(request, env) {
  const result = await authorized(request, env);
  if (result === "ok") return null;
  if (result === "not-configured") return json({ error: "The admin password has not been set up yet." }, 503);
  await new Promise((r) => setTimeout(r, 600)); // slow down guessing
  return json({ error: "Wrong password." }, 401);
}

async function load(env) {
  if (!env.RSVP_DB) throw new Error("RSVP_DB is not set up yet");
  await env.RSVP_DB.prepare(
    "CREATE TABLE IF NOT EXISTS raffle_draws (id INTEGER PRIMARY KEY AUTOINCREMENT, drawn_at TEXT NOT NULL DEFAULT (datetime('now')), parish TEXT NOT NULL, event TEXT NOT NULL, entry_id INTEGER NOT NULL)"
  ).run();
  const rows = (await env.RSVP_DB.prepare("SELECT id, created_at, name, email, note FROM rsvps WHERE parish = ? AND event = ? ORDER BY id")
    .bind(PARISH, EVENT).all()).results || [];
  const seen = new Set();
  const entries = [];
  for (const r of rows) {
    const key = r.email.trim().toLowerCase();
    if (seen.has(key)) continue; // one entry per email address
    seen.add(key);
    entries.push({ id: r.id, entered: r.created_at, name: r.name, email: r.email, phone: String(r.note || "").replace(/^Phone:\s*/i, "") });
  }
  const draws = (await env.RSVP_DB.prepare("SELECT id, drawn_at, entry_id FROM raffle_draws WHERE parish = ? AND event = ? ORDER BY id")
    .bind(PARISH, EVENT).all()).results || [];
  return { entries, draws, total: rows.length };
}

// Uniform random integer in [0, n) using crypto randomness (rejection sampling, no modulo bias).
function randomBelow(n) {
  const limit = Math.floor(0x100000000 / n) * n;
  const buf = new Uint32Array(1);
  do { crypto.getRandomValues(buf); } while (buf[0] >= limit);
  return buf[0] % n;
}

const csvCell = (v) => {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // keep spreadsheets from running a cell as a formula
  return '"' + s.replace(/"/g, '""') + '"';
};

export async function onRequestGet({ request, env }) {
  const denied = await gate(request, env);
  if (denied) return denied;
  let data;
  try { data = await load(env); } catch (err) { console.error("raffle load failed", err); return json({ error: "Could not read the entries (is the RSVP_DB database set up?)." }, 500); }
  if (new URL(request.url).searchParams.get("format") === "csv") {
    const drawn = new Map(data.draws.map((d, i) => [d.entry_id, i + 1]));
    const lines = [["Entered (UTC)", "Name", "Email", "Phone", "Drawn (order)"].map(csvCell).join(",")];
    for (const e of data.entries) lines.push([e.entered, e.name, e.email, e.phone, drawn.get(e.id) || ""].map(csvCell).join(","));
    return new Response(lines.join("\r\n") + "\r\n", { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="christmas-walk-raffle-entries.csv"', "cache-control": "no-store", "x-robots-tag": "noindex" } });
  }
  return json({ entries: data.entries.map(({ id, name, email }) => ({ id, name, email })), draws: data.draws, total: data.total });
}

export async function onRequestPost({ request, env }) {
  const denied = await gate(request, env);
  if (denied) return denied;
  let body = {};
  try { body = await request.json(); } catch {}
  if (body.action !== "draw") return json({ error: "Unknown action." }, 400);
  let data;
  try { data = await load(env); } catch (err) { console.error("raffle load failed", err); return json({ error: "Could not read the entries." }, 500); }
  const drawnIds = new Set(data.draws.map((d) => d.entry_id));
  const pool = data.entries.filter((e) => !drawnIds.has(e.id));
  if (!pool.length) return json({ error: data.entries.length ? "Every entry has already been drawn." : "There are no entries yet." }, 409);
  const winner = pool[randomBelow(pool.length)];
  try {
    await env.RSVP_DB.prepare("INSERT INTO raffle_draws (parish, event, entry_id) VALUES (?, ?, ?)").bind(PARISH, EVENT, winner.id).run();
  } catch (err) { console.error("raffle draw save failed", err); return json({ error: "Could not record the draw." }, 500); }
  return json({ winner: { id: winner.id, name: winner.name, email: winner.email }, remaining: pool.length - 1 });
}

export const onRequest = () => new Response("Method not allowed", { status: 405, headers: { Allow: "GET, POST" } });
