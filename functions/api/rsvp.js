// Cloudflare Pages Function: POST /api/rsvp
// Stores event RSVPs in a Cloudflare D1 database. No email service is needed.
// Setup (Pages project > Settings > Bindings): add a D1 database binding named RSVP_DB,
// then create the table with db/schema.sql. View responses in the D1 console:
//   SELECT * FROM rsvps WHERE parish = 'st-cecilia' ORDER BY id;
//   SELECT event, SUM(attending) FROM rsvps WHERE parish = 'st-cecilia' GROUP BY event;
// Every RSVP is saved with its parish and event slug (hidden fields in the event page form).
// Headcount forms (like the Open House) send "adults" and "children" instead of "attending";
// their total is saved as attending, and the counts, phone and dietary note go in the note
// field, one per line ("Adults: 2", "Children: 1", "Phone: ...", "Dietary: ..."), so the
// table does not change. /api/admin/openhouse reads them back.

// Events whose form makes email optional (they ask for a phone number too, also optional).
const EMAIL_OPTIONAL = new Set(["st-cecilia/parish-open-house"]);

const clean = (v, max) => String(v ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, max);

export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  if (form.get("website")) return new Response("ok"); // honeypot: silently drop bots

  const name = clean(form.get("name"), 120);
  const email = clean(form.get("email"), 160);
  const slug = (v) => (/^[a-z0-9-]{1,60}$/.test(String(v ?? "")) ? String(v) : "");
  const parish = slug(form.get("parish"));
  const event = slug(form.get("event"));
  let attending = parseInt(form.get("attending"), 10);
  let note = String(form.get("note") ?? "").trim().slice(0, 1000);
  const headcount = form.has("adults") || form.has("children");
  if (headcount) {
    const count = (v) => { const n = parseInt(v ?? "0", 10); return n >= 0 && n <= 10 ? n : NaN; };
    const adults = count(form.get("adults")), children = count(form.get("children"));
    attending = adults + children; // NaN if either is invalid, which fails the check below
    const lines = [`Adults: ${adults}`, `Children: ${children}`];
    const phone = clean(form.get("phone"), 40), dietary = clean(form.get("dietary"), 300);
    if (phone) lines.push(`Phone: ${phone}`);
    if (dietary) lines.push(`Dietary: ${dietary}`);
    if (note) lines.push(note);
    note = lines.join("\n");
  }
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || (!email && EMAIL_OPTIONAL.has(`${parish}/${event}`));
  const maxAttending = headcount ? 20 : 10;
  if (!name || !emailOk || !(attending >= 1 && attending <= maxAttending) || !parish || !event) {
    return new Response("Missing or invalid fields", { status: 400 });
  }
  if (!env.RSVP_DB) return new Response("RSVPs are not set up yet", { status: 503 });

  try {
    await env.RSVP_DB.prepare("INSERT INTO rsvps (parish, event, name, email, attending, note) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(parish, event, name, email, attending, note).run();
  } catch (err) {
    console.error("RSVP save failed", err);
    return new Response("Could not save", { status: 500 });
  }
  return new Response("ok");
}

export const onRequest = () => new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
