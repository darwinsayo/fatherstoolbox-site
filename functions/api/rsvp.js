// Cloudflare Pages Function: POST /api/rsvp
// Stores event RSVPs in a Cloudflare D1 database. No email service is needed.
// Setup (Pages project > Settings > Bindings): add a D1 database binding named RSVP_DB,
// then create the table with db/schema.sql. View responses in the D1 console:
//   SELECT * FROM rsvps WHERE parish = 'st-cecilia' ORDER BY id;
//   SELECT event, SUM(attending) FROM rsvps WHERE parish = 'st-cecilia' GROUP BY event;
// parts = which parts of the event the guest will attend, comma separated (for example "lessons-carols,open-house").
// Every RSVP is saved with its parish and event slug (hidden fields in the event page form).

const clean = (v, max) => String(v ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, max);

export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  if (form.get("website")) return new Response("ok"); // honeypot: silently drop bots

  const name = clean(form.get("name"), 120);
  const email = clean(form.get("email"), 160);
  const attending = parseInt(form.get("attending"), 10);
  const slug = (v) => (/^[a-z0-9-]{1,60}$/.test(String(v ?? "")) ? String(v) : "");
  const parish = slug(form.get("parish"));
  const event = slug(form.get("event"));
  const parts = form.getAll("parts").map(slug).filter(Boolean).slice(0, 6).join(",");
  const note = String(form.get("note") ?? "").trim().slice(0, 1000);
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !(attending >= 1 && attending <= 10) || !parish || !event || !parts) {
    return new Response("Missing or invalid fields", { status: 400 });
  }
  if (!env.RSVP_DB) return new Response("RSVPs are not set up yet", { status: 503 });

  try {
    await env.RSVP_DB.prepare("INSERT INTO rsvps (parish, event, parts, name, email, attending, note) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(parish, event, parts, name, email, attending, note).run();
  } catch (err) {
    console.error("RSVP save failed", err);
    return new Response("Could not save", { status: 500 });
  }
  return new Response("ok");
}

export const onRequest = () => new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
