// Cloudflare Pages Function: POST /api/contact
// Sends the contact form to Darwin through Resend (https://resend.com).
// Settings (Pages project > Settings > Variables and Secrets):
//   RESEND_API_KEY  (secret, required)  a Resend API key with sending access
//   CONTACT_TO      (optional)          defaults to darwin.sayo@gmail.com
//   CONTACT_FROM    (optional)          must be on a domain verified in Resend;
//                                       defaults to Father's Tool Box <website@fatherstoolbox.com>

const clean = (v, max = 200) => String(v ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, max);

export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  if (form.get("website")) return new Response("ok"); // honeypot: silently drop bots

  const first = clean(form.get("first_name"), 80);
  const last = clean(form.get("last_name"), 80);
  const email = clean(form.get("email"), 160);
  const phone = clean(form.get("phone"), 40);
  const role = clean(form.get("role"), 60);
  const parish = clean(form.get("parish"), 160);
  const message = String(form.get("message") ?? "").trim().slice(0, 5000);
  if (!first || !last || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return new Response("Missing or invalid fields", { status: 400 });
  }
  if (!env.RESEND_API_KEY) return new Response("Contact form email is not set up yet", { status: 503 });

  const text = [
    `Name: ${first} ${last}`,
    `Email: ${email}`,
    `Phone: ${phone || "-"}`,
    `Role: ${role || "-"}`,
    `Parish or diocese: ${parish || "-"}`,
    "",
    message,
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.CONTACT_FROM || "Father's Tool Box <website@fatherstoolbox.com>",
      to: [env.CONTACT_TO || "darwin.sayo@gmail.com"],
      reply_to: email,
      subject: `Website inquiry from ${first} ${last}`,
      text,
    }),
  });
  if (!res.ok) {
    console.error("Resend error", res.status, await res.text());
    return new Response("Could not send", { status: 502 });
  }
  return new Response("ok");
}

export const onRequest = () => new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
