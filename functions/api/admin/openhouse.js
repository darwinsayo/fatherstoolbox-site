// Cloudflare Pages Function: /api/admin/openhouse  (private; used by /admin/openhouse/)
// Headcount for Father Harry's Open House: totals, allergy/dietary notes, every reply, CSV export,
// and removing a duplicate reply. Protected by the ADMIN_PASSWORD secret, like /api/admin/raffle.
//   GET                          -> { rsvps, totals }
//   GET ?format=csv              -> CSV download
//   POST {action:"delete", id}   -> removes one reply of this event
// The form (functions/api/rsvp.js) saves adults, children, phone and dietary as lines in the note.

const PARISH = "st-cecilia";
const EVENT = "parish-open-house";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store", "x-robots-tag": "noindex" } });

async function authorized(request, env) {
  const given = request.headers.get("x-admin-password") || "";
  const secret = env.ADMIN_PASSWORD || "";
  if (!secret) return "not-configured";
  const enc = new TextEncoder();
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

const line = (note, key) => ((note.match(new RegExp(`^${key}:\\s*(.*)$`, "im")) || [, ""])[1] || "").trim();

async function load(env) {
  if (!env.RSVP_DB) throw new Error("RSVP_DB is not set up yet");
  const rows = (await env.RSVP_DB.prepare("SELECT id, created_at, name, email, attending, note FROM rsvps WHERE parish = ? AND event = ? ORDER BY id")
    .bind(PARISH, EVENT).all()).results || [];
  const rsvps = rows.map((r) => {
    const note = String(r.note || "");
    const a = line(note, "Adults"), c = line(note, "Children");
    // Replies sent before the form asked for adults and children count everyone as adults.
    const adults = a === "" ? r.attending : parseInt(a, 10) || 0;
    const children = c === "" ? 0 : parseInt(c, 10) || 0;
    const other = note.split("\n").filter((l) => !/^(Adults|Children|Phone|Dietary):/i.test(l)).join(" ").trim();
    return { id: r.id, created_at: r.created_at, name: r.name, email: r.email, phone: line(note, "Phone"), adults, children, dietary: line(note, "Dietary"), note: other };
  });
  const totals = rsvps.reduce((t, r) => ({ replies: t.replies + 1, adults: t.adults + r.adults, children: t.children + r.children }), { replies: 0, adults: 0, children: 0 });
  totals.people = totals.adults + totals.children;
  return { rsvps, totals };
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
  try { data = await load(env); } catch (err) { console.error("openhouse load failed", err); return json({ error: "Could not read the RSVPs (is the RSVP_DB database set up?)." }, 500); }
  if (new URL(request.url).searchParams.get("format") === "csv") {
    const lines = [["Received (UTC)", "Name", "Adults", "Children", "Allergies or dietary needs", "Email", "Phone", "Note"].map(csvCell).join(",")];
    for (const r of data.rsvps) lines.push([r.created_at, r.name, r.adults, r.children, r.dietary, r.email, r.phone, r.note].map(csvCell).join(","));
    return new Response("﻿" + lines.join("\r\n") + "\r\n", { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="open-house-rsvps.csv"', "cache-control": "no-store", "x-robots-tag": "noindex" } });
  }
  return json(data);
}

export async function onRequestPost({ request, env }) {
  const denied = await gate(request, env);
  if (denied) return denied;
  let body = {};
  try { body = await request.json(); } catch {}
  const id = parseInt(body.id, 10);
  if (body.action !== "delete" || !(id > 0)) return json({ error: "Unknown action." }, 400);
  try {
    const res = await env.RSVP_DB.prepare("DELETE FROM rsvps WHERE id = ? AND parish = ? AND event = ?").bind(id, PARISH, EVENT).run();
    if (!res.meta || !res.meta.changes) return json({ error: "That reply was not found." }, 404);
  } catch (err) { console.error("openhouse delete failed", err); return json({ error: "Could not remove the reply." }, 500); }
  return json({ ok: true });
}

export const onRequest = () => new Response("Method not allowed", { status: 405, headers: { Allow: "GET, POST" } });
