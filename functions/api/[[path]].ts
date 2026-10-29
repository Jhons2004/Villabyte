/**
 * Villabyte API - Cloudflare Pages Functions (Cloudflare Workers runtime).
 * Neon uses HTTPS via @neondatabase/serverless, not a TCP pg Pool.
 * URL pattern: functions/api/[[path]].ts => /api/*.
 *
 * Secrets must be configured in Pages > Settings > Variables and Secrets.
 */
import { neon } from "@neondatabase/serverless";

interface Env {
  DATABASE_URL: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
  GOOGLE_APPS_SCRIPT_URL?: string;
  GOOGLE_APPS_SCRIPT_KEY?: string;
  GOOGLE_APPS_SCRIPT_REPLY_KEY?: string;
  GOOGLE_SCRIPT_REPLY_ENABLED?: string;
  TURNSTILE_SECRET_KEY?: string;
}
type Row = Record<string, any>;
type PageContext = { request: Request; env: Env };
type DB = ReturnType<typeof neon>;

const COOKIE = "villabyte_session";
const SESSION_MS = 12 * 60 * 60 * 1000;
const DEFAULT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbznNNt_-UqwNrL9XDnodbrfHi9KrHtCH8xRONz7N7seKT1jSPARnPR2mycLCT1Sk-RR/exec";
const json = (data: unknown, status = 200, extra?: Record<string, string>) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...(extra || {}) } });
const clean = (v: unknown, max = 500) => typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max) : "";
const bad = (message: string, status = 400) => json({ error: message }, status);
const rows = async (db: DB, statement: string, params: unknown[] = []): Promise<Row[]> => await db.query(statement, params as any[]) as Row[];
const getDb = (env: Env) => { if (!env.DATABASE_URL) throw Error("DATABASE_URL no configurada"); return neon(env.DATABASE_URL); };

async function payload(request: Request): Promise<Row> {
  const len = Number(request.headers.get("content-length") || 0);
  if (len > 24000) throw Error("Solicitud demasiado grande");
  const raw = await request.text();
  if (raw.length > 24000) throw Error("Solicitud demasiado grande");
  const data: unknown = JSON.parse(raw);
  if (!data || typeof data !== "object" || Array.isArray(data)) throw Error("JSON inválido");
  return data as Row;
}
function validOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).origin === new URL(request.url).origin; } catch { return false; }
}
function b64url(bytes: Uint8Array): string {
  let s = ""; for (const x of bytes) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function fromB64url(s: string): Uint8Array {
  const a = s.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(a + "=".repeat((4 - a.length % 4) % 4)), x => x.charCodeAt(0));
}
async function hmacKey(env: Env): Promise<CryptoKey> {
  if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) throw Error("SESSION_SECRET inválido");
  return crypto.subtle.importKey("raw", new TextEncoder().encode(env.SESSION_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
async function makeCookie(env: Env, email: string) {
  const body = b64url(new TextEncoder().encode(JSON.stringify({ email, expiry: Date.now() + SESSION_MS })));
  const sig = b64url(new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(env), new TextEncoder().encode(body))));
  return COOKIE + "=" + body + "." + sig + "; Path=/; Max-Age=43200; HttpOnly; Secure; SameSite=Strict";
}
async function isAdmin(req: Request, env: Env) {
  try {
    if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD || !env.SESSION_SECRET) return false;
    const cookie = (req.headers.get("cookie") || "").split(";").map(x => x.trim()).find(x => x.startsWith(COOKIE + "="));
    const token = cookie?.slice(COOKIE.length + 1) || "";
    const [body, signature, extra] = token.split(".");
    if (!body || !signature || extra) return false;
    const verified = await crypto.subtle.verify("HMAC", await hmacKey(env), fromB64url(signature), new TextEncoder().encode(body));
    if (!verified) return false;
    const p = JSON.parse(new TextDecoder().decode(fromB64url(body)));
    return p.email === env.ADMIN_EMAIL.toLowerCase() && Number(p.expiry) > Date.now();
  } catch { return false; }
}
async function sha256(value: string): Promise<string> {
  return b64url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
}
async function emailFromScript(env: Env, data: Row) {
  if (!env.GOOGLE_APPS_SCRIPT_KEY) return { ok: false, reason: "La API de correo no está configurada" };
  const response = await fetch(env.GOOGLE_APPS_SCRIPT_URL || DEFAULT_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain; charset=utf-8" },
    body: JSON.stringify({ ...data, apiKey: env.GOOGLE_APPS_SCRIPT_KEY }),
    redirect: "follow",
    signal: AbortSignal.timeout(18000)
  });
  if (!response.ok) throw Error("Google Apps Script HTTP " + response.status);
  const result = await response.json() as Row;
  if (result.ok !== true) throw Error("Apps Script rechazó el correo: " + clean(result.error, 160));
  return result;
}
async function checkTurnstile(env: Env, request: Request, token: string) {
  if (!env.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;
  const form = new FormData();
  form.set("secret", env.TURNSTILE_SECRET_KEY);
  form.set("response", token);
  const ip = request.headers.get("cf-connecting-ip");
  if (ip) form.set("remoteip", ip);
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form, signal: AbortSignal.timeout(9000) });
  const result = await r.json() as Row;
  return result.success === true;
}
function validMail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function uuid(v: string) { return /^[0-9a-f-]{36}$/i.test(v); }
async function readCms(db: DB, key: string) {
  const out = await rows(db, "SELECT data FROM villabyte_cms WHERE key=$1", [key]);
  return out[0]?.data ?? (key === "config" ? {} : []);
}
async function writeCms(db: DB, key: string, data: unknown) {
  await rows(db, "INSERT INTO villabyte_cms(key,data) VALUES ($1,$2::jsonb) ON CONFLICT (key) DO UPDATE SET data=EXCLUDED.data", [key, JSON.stringify(data)]);
}
function validPrice(v: unknown) { return v === null || (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 10000000); }
function safeItem(type: string, body: Row, previous: Row = {}) {
  const val: Row = { ...previous };
  if (type === "services") {
    if (body.title !== undefined) val.title = clean(body.title, 120);
    if (body.category !== undefined) val.category = clean(body.category, 100);
    if (body.description !== undefined) val.description = clean(body.description, 1000);
    if (body.price !== undefined) val.price = body.price === "" || body.price === null ? null : Number(body.price);
    if (body.unit !== undefined) val.unit = ["servicio","desde","mes","hora"].includes(body.unit) ? body.unit : "servicio";
    if (body.active !== undefined) val.active = body.active === true;
    if (!val.title || !val.category || !validPrice(val.price)) throw Error("Datos o precio del servicio inválidos");
  } else if (type === "projects") {
    if (body.title !== undefined) val.title = clean(body.title, 160);
    if (body.client !== undefined) val.client = clean(body.client, 150);
    if (body.description !== undefined) val.description = clean(body.description, 1400);
    if (body.status !== undefined) val.status = clean(body.status, 110);
    if (body.stage !== undefined) val.stage = clean(body.stage, 80);
    if (body.live_url !== undefined) {
      const u = clean(body.live_url, 500);
      if (u && !/^https:\/\//i.test(u)) throw Error("URL inválida");
      val.live_url = u;
    }
    if (body.technologies !== undefined) val.technologies = Array.isArray(body.technologies) ? body.technologies.slice(0, 20).map((x: unknown) => clean(x, 40)) : [];
    if (body.images !== undefined) val.images = Array.isArray(body.images) ? body.images.slice(0, 12).map((x: unknown) => clean(x, 500)).filter((x: string) => /^https:\/\//.test(x)) : [];
    if (!val.title || !val.description) throw Error("Proyecto inválido");
    val.created_at ||= new Date().toISOString().slice(0, 10);
  } else if (type === "trusted-clients") {
    if (body.name !== undefined) val.name = clean(body.name, 120);
    if (body.industry !== undefined) val.industry = clean(body.industry, 100);
    if (body.featured !== undefined) val.featured = !!body.featured;
    for (const key of ["logo_url", "website_url"]) if (body[key] !== undefined) {
      const u = clean(body[key], 500);
      if (u && !/^https:\/\//.test(u)) throw Error("URL inválida");
      val[key] = u;
    }
    if (!val.name) throw Error("Cliente inválido");
  }
  return val;
}
async function route(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const method = request.method.toUpperCase();
  const mutating = !["GET", "HEAD", "OPTIONS"].includes(method);
  if (method === "OPTIONS") return json({ ok: true }, 200, { Allow: "GET, POST, PUT, PATCH, DELETE, OPTIONS" });
  if (mutating && !validOrigin(request)) return bad("Origen no permitido", 403);
  if (!path.startsWith("/api/")) return bad("Ruta no encontrada", 404);

  if (path === "/api/health" && method === "GET") {
    if (!env.DATABASE_URL) return json({ ok: false, database: false, mail_configured: !!env.GOOGLE_APPS_SCRIPT_KEY, reply_configured: env.GOOGLE_SCRIPT_REPLY_ENABLED === "true" }, 503);
    try {
      await rows(getDb(env), "SELECT 1 AS ready");
      return json({ ok: true, database: true, platform: "cloudflare-pages", mail_configured: !!env.GOOGLE_APPS_SCRIPT_KEY,
        reply_configured: env.GOOGLE_SCRIPT_REPLY_ENABLED === "true" && !!env.GOOGLE_APPS_SCRIPT_REPLY_KEY });
    } catch { return json({ ok: false, database: false, mail_configured: !!env.GOOGLE_APPS_SCRIPT_KEY }, 503); }
  }

  if (path === "/api/admin/session" && method === "GET") return json({ authenticated: await isAdmin(request, env) });
  if (path === "/api/admin/login" && method === "POST") {
    if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD || !env.SESSION_SECRET || env.SESSION_SECRET.length < 32) return bad("Administrador sin configurar", 503);
    const data = await payload(request);
    const email = clean(data.email, 180).toLowerCase();
    const pass = clean(data.password, 250);
    const db = getDb(env);
    const key = await sha256((request.headers.get("cf-connecting-ip") || "unknown") + ":" + env.SESSION_SECRET);
    const attempts = await rows(db, "SELECT failures FROM villabyte_auth_attempts WHERE key=$1 AND expires_at>NOW()", [key]);
    if (Number(attempts[0]?.failures || 0) >= 8) return bad("Demasiados intentos; espera 15 minutos", 429);
    const expected = await sha256(env.ADMIN_PASSWORD), supplied = await sha256(pass);
    // Compare fixed-length digests without an early exit.
    let difference = 0;
    for (let i = 0; i < expected.length; i++) difference |= expected.charCodeAt(i) ^ supplied.charCodeAt(i);
    if (email !== env.ADMIN_EMAIL.toLowerCase() || difference !== 0) {
      await rows(db, "INSERT INTO villabyte_auth_attempts(key,failures,expires_at) VALUES($1,1,NOW()+INTERVAL '15 minutes') ON CONFLICT(key) DO UPDATE SET failures=CASE WHEN villabyte_auth_attempts.expires_at<NOW() THEN 1 ELSE villabyte_auth_attempts.failures+1 END,expires_at=NOW()+INTERVAL '15 minutes'", [key]);
      return bad("Credenciales inválidas", 401);
    }
    await rows(db, "DELETE FROM villabyte_auth_attempts WHERE key=$1", [key]);
    return json({ success: true, user: { email } }, 200, { "Set-Cookie": await makeCookie(env, email) });
  }
  if (path === "/api/admin/logout" && method === "POST") {
    if (!await isAdmin(request, env)) return bad("Acceso no autorizado", 401);
    return json({ success: true }, 200, { "Set-Cookie": COOKIE + "=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0" });
  }

  const contentKey = path.slice(5);
  const contentTypes = ["config", "services", "projects", "trusted-clients"];
  if (contentTypes.includes(contentKey) && method === "GET") return json(await readCms(getDb(env), contentKey));

  if (path === "/api/requests" && method === "POST") {
    const body = await payload(request);
    if (body.website) return json({ ok: true }); // anti-spam field
    const name = clean(body.name, 100), email = clean(body.email, 150).toLowerCase();
    const phone = clean(body.phone, 40), serviceId = clean(body.service_id, 120);
    const description = clean(body.description, 2000);
    if (!name || !validMail(email) || !serviceId || !description || body.accepted !== true) return bad("Completa los datos y acepta la privacidad");
    if (!await checkTurnstile(env, request, clean(body.turnstileToken, 2500))) return bad("Verificación anti-spam fallida", 403);
    const db = getDb(env);
    const available = await readCms(db, "services") as Row[];
    const selected = available.find(x => x.id === serviceId && x.active !== false);
    if (!selected) return bad("Servicio no disponible");
    const count = await rows(db, "SELECT COUNT(*)::int AS n FROM villabyte_requests WHERE email=$1 AND created_at>NOW()-INTERVAL '15 minutes'", [email]);
    if (Number(count[0]?.n || 0) >= 5) return bad("Límite de solicitudes alcanzado; inténtalo más tarde", 429);
    const id = crypto.randomUUID();
    await rows(db, "INSERT INTO villabyte_requests(id,name,email,phone,service_id,service_title,description,status,email_sent,replies) VALUES($1,$2,$3,$4,$5,$6,$7,'nuevo',FALSE,'[]'::jsonb)",
      [id, name, email, phone, serviceId, selected.title, description]);
    let notified = false;
    if (env.GOOGLE_APPS_SCRIPT_KEY) {
      try {
        const response = await emailFromScript(env, { action: "new_request", name, email, phone, website: "",
          company: "", subject: "Solicitud " + id.slice(0, 8) + " - " + selected.title,
          message: description + "\n\nCódigo: " + id + "\nServicio: " + selected.title,
          page: url.origin + "/solicitar" });
        notified = response.ok === true;
        if (notified) await rows(db, "UPDATE villabyte_requests SET email_sent=TRUE WHERE id=$1", [id]);
      } catch (err) { console.error("Correo de aviso pendiente", err); }
    }
    return json({ ok: true, id, notified }, 201);
  }

  // Every administrator mutation and inbox operation requires a signed HttpOnly session.
  if (!await isAdmin(request, env)) return bad("Inicia sesión como administrador", 401);
  const db = getDb(env);
  if (path === "/api/config" && method === "PUT") {
    const body = await payload(request);
    const data = await readCms(db, "config") as Row;
    for (const k of ["hero_title", "hero_subtitle", "contact_email", "location", "phone", "social_facebook", "social_instagram"])
      if (body[k] !== undefined) data[k] = clean(body[k], 400);
    if (data.contact_email && !validMail(data.contact_email)) return bad("Correo comercial inválido");
    await writeCms(db, "config", data);
    return json({ success: true, data });
  }

  for (const kind of ["services", "projects", "trusted-clients"]) {
    const root = "/api/" + kind;
    if (path !== root && !path.startsWith(root + "/")) continue;
    const parts = path.slice(root.length).split("/").filter(Boolean);
    if (method === "POST" && parts.length === 0) {
      const items = await readCms(db, kind) as Row[];
      if (items.length >= 300) return bad("Límite de registros alcanzado");
      const body = await payload(request);
      const item = { id: crypto.randomUUID(), ...safeItem(kind, body) };
      await writeCms(db, kind, [...items, item]);
      return json(item, 201);
    }
    if (parts.length === 1 && ["PUT", "DELETE"].includes(method)) {
      const items = await readCms(db, kind) as Row[];
      const index = items.findIndex(x => x.id === parts[0]);
      if (index < 0) return bad("Registro no encontrado", 404);
      if (method === "DELETE") {
        await writeCms(db, kind, items.filter(x => x.id !== parts[0]));
        return json({ success: true });
      }
      const body = await payload(request);
      items[index] = { ...safeItem(kind, body, items[index]), id: items[index].id };
      await writeCms(db, kind, items);
      return json(items[index]);
    }
  }

  if (path === "/api/admin/requests" && method === "GET") {
    return json(await rows(db, "SELECT * FROM villabyte_requests ORDER BY created_at DESC LIMIT 250"));
  }
  const match = path.match(/^\/api\/admin\/requests\/([0-9a-f-]{36})(?:\/(reply))?$/i);
  if (match && method === "PATCH" && !match[2]) {
    const body = await payload(request);
    const status = clean(body.status, 40);
    if (!["nuevo", "contactado", "en_proceso", "cerrado"].includes(status)) return bad("Estado no válido");
    const changed = await rows(db, "UPDATE villabyte_requests SET status=$1 WHERE id=$2 RETURNING *", [status, match[1]]);
    return changed[0] ? json(changed[0]) : bad("Solicitud no encontrada", 404);
  }
  if (match && method === "POST" && match[2] === "reply") {
    if (env.GOOGLE_SCRIPT_REPLY_ENABLED !== "true" || !env.GOOGLE_APPS_SCRIPT_REPLY_KEY) return bad("Activa Apps Script v2 para enviar respuestas", 503);
    const body = await payload(request);
    const message = clean(body.message, 4000);
    if (message.length < 10) return bad("Escribe una respuesta de al menos 10 caracteres");
    const found = await rows(db, "SELECT * FROM villabyte_requests WHERE id=$1", [match[1]]);
    if (!found.length) return bad("Solicitud no encontrada", 404);
    const requestItem = found[0];
    try {
      const response = await emailFromScript(env, {
        action: "reply_to_customer", replyKey: env.GOOGLE_APPS_SCRIPT_REPLY_KEY,
        recipient: requestItem.email, requestId: requestItem.id,
        subject: "Respuesta de Villabyte", message, website: ""
      });
      // Older Apps Script versions could incorrectly send replies only to the site owner.
      if (response.action !== "reply_to_customer" || response.recipient !== requestItem.email || response.requestId !== requestItem.id)
        return bad("Apps Script no confirmó el envío al destinatario", 503);
    } catch (err) { console.error("Correo de respuesta falló", err); return bad("No se pudo enviar la respuesta", 503); }
    const replies = [...(Array.isArray(requestItem.replies) ? requestItem.replies : []), { date: new Date().toISOString(), text: message, sent: true }];
    await rows(db, "UPDATE villabyte_requests SET replies=$1::jsonb,status='contactado' WHERE id=$2", [JSON.stringify(replies), match[1]]);
    return json({ success: true });
  }
  return bad("Ruta no encontrada", 404);
}

export const onRequest = async (context: PageContext): Promise<Response> => {
  try { return await route(context.request, context.env); }
  catch (err) {
    console.error("Error en API de Villabyte", err);
    if (err instanceof SyntaxError) return bad("JSON inválido", 400);
    if (err instanceof Error && ["Solicitud demasiado grande", "JSON inválido"].includes(err.message)) return bad(err.message);
    return bad("Servicio temporalmente no disponible", 503);
  }
};
