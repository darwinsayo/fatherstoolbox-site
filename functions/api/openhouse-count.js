// Cloudflare Pages Function: GET /api/openhouse-count  (public, read-only)
// Feeds the "guests are coming so far" line in the RSVP section of Father Harry's Open House page.
// It returns one number and nothing else: no names, emails, phones or notes.
//   { "guests": 42 }    once the total reaches SHOW_AFTER
//   { "guests": null }  before that, so a small early number is never shown (or readable here)
// To change when the count appears, change SHOW_AFTER below (the page needs no change).

const PARISH = "st-cecilia";
const EVENT = "parish-open-house";
const SHOW_AFTER = 20; // guests (adults + children), not replies

const json = (body, maxAge) =>
  new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json", "cache-control": `public, max-age=${maxAge}`, "x-robots-tag": "noindex" },
  });

export async function onRequestGet({ env }) {
  if (!env.RSVP_DB) return json({ guests: null }, 60);
  try {
    const row = await env.RSVP_DB.prepare("SELECT COALESCE(SUM(attending), 0) AS guests FROM rsvps WHERE parish = ? AND event = ?")
      .bind(PARISH, EVENT).first();
    const guests = Number(row?.guests) || 0;
    return json({ guests: guests >= SHOW_AFTER ? guests : null }, 60);
  } catch (err) {
    console.error("Open house count failed", err);
    return json({ guests: null }, 10);
  }
}

export const onRequest = () => new Response("Method not allowed", { status: 405, headers: { Allow: "GET" } });
