import { EmailMessage } from "cloudflare:email";

const FROM = "website@fatherstoolbox.com";

const clean = (v, max = 200) => String(v ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, max);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/contact") return env.ASSETS.fetch(request);
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

    if (!env.CONTACT_EMAIL) return new Response("Contact form email is not switched on yet", { status: 503 });

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

    const body = [
      `Name: ${first} ${last}`,
      `Email: ${email}`,
      `Phone: ${phone || "-"}`,
      `Role: ${role || "-"}`,
      `Parish or diocese: ${parish || "-"}`,
      "",
      message,
    ].join("\r\n");

    const raw = [
      `From: Father's Tool Box website <${FROM}>`,
      `To: ${env.CONTACT_TO}`,
      `Reply-To: ${email}`,
      `Subject: Website inquiry from ${first} ${last}`,
      `Message-ID: <${crypto.randomUUID()}@fatherstoolbox.com>`,
      `Date: ${new Date().toUTCString()}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=utf-8",
      "Content-Transfer-Encoding: 8bit",
      "",
      body,
    ].join("\r\n");

    try {
      await env.CONTACT_EMAIL.send(new EmailMessage(FROM, env.CONTACT_TO, raw));
      return new Response("ok");
    } catch (err) {
      console.error("send failed", err);
      return new Response("Could not send", { status: 502 });
    }
  },
};
