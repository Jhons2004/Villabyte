/**
 * Villabyte API - Cloudflare Pages Functions (Cloudflare Workers runtime).
 * Neon uses HTTPS via @neondatabase/serverless, not a TCP pg Pool.
 * URL pattern: functions/api/[[path]].ts => /api/*.
 *
 * Secrets must be configured in Pages > Settings > Variables and Secrets.
 */
import { neon } from "@neondatabase/serverless";

type PrivateImageBucket = {
  put(key: string, value: ArrayBuffer, options: { httpMetadata: { contentType: string } }): Promise<unknown>;
  get(key: string): Promise<{ body: ReadableStream; size: number } | null>;
  delete(key: string): Promise<void>;
};
interface Env {
  MEDIA?: PrivateImageBucket;
  DATABASE_URL: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  /** Optional independent administrator. Empty credentials never grant access. */
  SECONDARY_ADMIN_EMAIL?: string;
  SECONDARY_ADMIN_PASSWORD?: string;
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
const MAX_IMAGES = 3;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_UPLOAD_BODY = 10 * 1024 * 1024;
type ImageUpload = { id: string; object_key: string; filename: string; content_type: string; byte_size: number };
function sniffImage(bytes: Uint8Array): { type: string; ext: string } | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { type: "image/jpeg", ext: "jpg" };
  if (bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)) return { type: "image/png", ext: "png" };
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return { type: "image/webp", ext: "webp" };
  return null;
}

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
type AdminAccount = { email: string; password: string; role: "owner" | "reviewer" };
function adminAccounts(env: Env): AdminAccount[] {
  const owner = clean(env.ADMIN_EMAIL, 180).toLowerCase();
  const secondary = clean(env.SECONDARY_ADMIN_EMAIL || "meilynpaz06@gmail.com", 180).toLowerCase();
  const accounts: AdminAccount[] = [];
  if (validMail(owner) && env.ADMIN_PASSWORD)
    accounts.push({ email: owner, password: env.ADMIN_PASSWORD, role: "owner" });
  // Never enable a second account with incomplete secrets or the owner's email.
  if (validMail(secondary) && secondary !== owner && (env.SECONDARY_ADMIN_PASSWORD || "").length >= 12)
    accounts.push({ email: secondary, password: env.SECONDARY_ADMIN_PASSWORD!, role: "reviewer" });
  return accounts;
}
async function sessionRevision(env: Env, account: AdminAccount): Promise<string> {
  // Domain-separated keyed fingerprint: password changes invalidate prior sessions.
  const rev = await crypto.subtle.sign("HMAC", await hmacKey(env),
    new TextEncoder().encode("credential-revision:" + account.email + ":" + account.password));
  return b64url(new Uint8Array(rev));
}
async function makeCookie(env: Env, account: AdminAccount) {
  const revision = await sessionRevision(env, account);
  const body = b64url(new TextEncoder().encode(JSON.stringify({
    email: account.email, role: account.role, revision, expiry: Date.now() + SESSION_MS
  })));
  const sig = b64url(new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(env), new TextEncoder().encode(body))));
  return COOKIE + "=" + body + "." + sig + "; Path=/; Max-Age=43200; HttpOnly; Secure; SameSite=Strict";
}
async function getAdmin(req: Request, env: Env): Promise<AdminAccount | null> {
  try {
    if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) return null;
    const cookie = (req.headers.get("cookie") || "").split(";").map(x => x.trim()).find(x => x.startsWith(COOKIE + "="));
    const token = cookie?.slice(COOKIE.length + 1) || "";
    const [body, signature, extra] = token.split(".");
    if (!body || !signature || extra) return null;
    const verified = await crypto.subtle.verify("HMAC", await hmacKey(env), fromB64url(signature), new TextEncoder().encode(body));
    if (!verified) return null;
    const p = JSON.parse(new TextDecoder().decode(fromB64url(body)));
    if (Number(p.expiry) <= Date.now()) return null;
    const account = adminAccounts(env).find(x => x.email === p.email && x.role === p.role);
    if (!account || p.revision !== await sessionRevision(env, account)) return null;
    return account;
  } catch { return null; }
}
async function isAdmin(req: Request, env: Env) {
  return (await getAdmin(req, env)) !== null;
}
async function sha256(value: string): Promise<string> {
  return b64url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
}

const TICKET_COOKIE = "villabyte_ticket";
const TICKET_SESSION_MS = 8 * 60 * 60 * 1000;
function newTicketSecret(): string {
  const bytes = new Uint8Array(24); crypto.getRandomValues(bytes); return b64url(bytes);
}
async function tokenDigest(env: Env, token: string): Promise<string> {
  const bytes = await crypto.subtle.sign("HMAC", await hmacKey(env),
    new TextEncoder().encode("ticket-access:" + token));
  return b64url(new Uint8Array(bytes));
}
async function ticketCookie(env: Env, ticketId: string, email: string, tokenHash: string) {
  const body = b64url(new TextEncoder().encode(JSON.stringify({
    ticketId, email, tokenHash, expiry: Date.now() + TICKET_SESSION_MS
  })));
  const signature = b64url(new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(env), new TextEncoder().encode("ticket-session:" + body))));
  return TICKET_COOKIE + "=" + body + "." + signature + "; Path=/; Max-Age=28800; HttpOnly; Secure; SameSite=Strict";
}
async function clientSession(req: Request, env: Env): Promise<{ ticketId: string; email: string } | null> {
  try {
    const cookie = (req.headers.get("cookie") || "").split(";").map(x => x.trim()).find(x => x.startsWith(TICKET_COOKIE+"="));
    const [body, signature] = (cookie?.slice(TICKET_COOKIE.length + 1) || "").split(".");
    if (!body || !signature || !env.SESSION_SECRET) return null;
    const verified = await crypto.subtle.verify("HMAC", await hmacKey(env), fromB64url(signature),
      new TextEncoder().encode("ticket-session:" + body));
    if (!verified) return null;
    const p = JSON.parse(new TextDecoder().decode(fromB64url(body)));
    if (!uuid(p.ticketId) || !validMail(p.email) || Number(p.expiry) <= Date.now()) return null;
    const current = await rows(getDb(env), "SELECT a.token_hash FROM villabyte_requests r JOIN villabyte_request_access a ON a.request_id=r.id WHERE r.id=$1 AND lower(r.email)=$2", [p.ticketId, p.email]);
    return current.length && p.tokenHash===current[0].token_hash ? { ticketId: p.ticketId, email: p.email } : null;
  } catch { return null; }
}
async function ticketHistory(db: DB, ticketId: string) {
  const found = await rows(db, "SELECT id, name, email, service_title, description, status, created_at, replies FROM villabyte_requests WHERE id=$1", [ticketId]);
  if (!found.length) return null;
  const messages = await rows(db, "SELECT id, sender_email, sender_type, body, notification_sent, created_at FROM villabyte_ticket_messages WHERE request_id=$1 ORDER BY created_at ASC LIMIT 150", [ticketId]);
  const legacy = Array.isArray(found[0].replies) ? found[0].replies.map((v: Row, i: number) => ({
    id: "staff-" + i, sender_type: "staff", body: String(v.text || ""), created_at: v.date, notification_sent: v.sent === true
  })) : [];
  return { ticket: { id:found[0].id, name:found[0].name, email:found[0].email,
    service_title:found[0].service_title, description:found[0].description,
    status:found[0].status, created_at:found[0].created_at },
    messages: [...legacy, ...messages].sort((a,b)=>String(a.created_at).localeCompare(String(b.created_at))) };
}
async function ticketAuthKey(env: Env, request: Request) {
  return sha256("ticket-ip:" + (request.headers.get("cf-connecting-ip") || "unknown") + ":" + env.SESSION_SECRET);
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
type MailProbe = { online: boolean; notification: boolean; reply: boolean; version: string; reason: string };
async function probeMailScript(env: Env): Promise<MailProbe> {
  if (!env.GOOGLE_APPS_SCRIPT_KEY) return { online: false, notification: false, reply: false, version: "", reason: "Falta GOOGLE_APPS_SCRIPT_KEY en Cloudflare" };
  try {
    const response = await fetch(env.GOOGLE_APPS_SCRIPT_URL || DEFAULT_SCRIPT_URL, {
      method: "GET", redirect: "follow", signal: AbortSignal.timeout(8500)
    });
    if (!response.ok) return { online: false, notification: false, reply: false, version: "", reason: "Apps Script no responde HTTP 200 ("+response.status+")" };
    const data = await response.json() as Row;
    const online = data.ok === true && data.status === "online";
    // The original v1 can still notify. v2 reports actual Script Properties readiness.
    const notification = online && data.capabilities?.notification !== false;
    const reply = notification && data.capabilities?.reply_to_customer === true;
    return {
      online, notification, reply,
      version: clean(data.service, 80),
      reason: !online ? "No se confirmó la Web App de Google" : !notification ? "Apps Script v2 aún no tiene API_KEY o DESTINATION_EMAIL válidos" : !reply ? "La Web App no confirma respuestas a clientes: publica villabyte-mail-v2.gs con REPLY_API_KEY" : ""
    };
  } catch (err) {
    console.error("Fallo de diagnóstico Apps Script", err);
    return { online: false, notification: false, reply: false, version: "", reason: "No se pudo verificar Apps Script; revisa su URL y los permisos del despliegue" };
  }
}
type NoticeResult = { sent: boolean; reason: string };
async function sendOwnerNotice(db: DB, env: Env, item: Row, page: string): Promise<NoticeResult> {
  if (!env.GOOGLE_APPS_SCRIPT_KEY) return { sent: false, reason: "Falta GOOGLE_APPS_SCRIPT_KEY en Cloudflare" };
  const claimed = await rows(db, "UPDATE villabyte_requests SET notification_claimed_at=NOW(),notification_attempts=notification_attempts+1,last_notification_error=NULL WHERE id=$1 AND email_sent=FALSE AND (notification_claimed_at IS NULL OR notification_claimed_at < NOW()-INTERVAL '2 minutes') RETURNING id", [item.id]);
  if (!claimed.length) return { sent: false, reason: "Notificación ya enviada o en proceso" };
  try {
    const response = await emailFromScript(env, {
      action: "new_request", requestId: item.id,
      name: item.name, email: item.email, phone: item.phone || "",
      company: "", subject: "Solicitud " + String(item.id).slice(0, 8) + " - " + item.service_title,
      message: String(item.description) + "\n\nCódigo: " + item.id + "\nServicio: " + item.service_title +
        "\nFotos adjuntas: " + ((await rows(db, "SELECT COUNT(*)::int AS n FROM villabyte_request_attachments WHERE request_id=$1", [item.id]))[0]?.n || 0) +
        " (consultar privadamente en el panel de Villabyte)",
      page, website: ""
    });
    if (response.ok !== true || response.filtered === true)
      throw Error("Apps Script no confirmó el envío de la notificación");
    await rows(db, "UPDATE villabyte_requests SET email_sent=TRUE,notification_claimed_at=NULL,last_notification_error=NULL WHERE id=$1", [item.id]);
    return { sent: true, reason: "" };
  } catch (err) {
    const reason = err instanceof Error ? err.message.slice(0, 260) : "Error de proveedor";
    console.error("Villabyte: notificación no confirmada para", item.id, reason);
    await rows(db, "UPDATE villabyte_requests SET notification_claimed_at=NULL,last_notification_error=$2 WHERE id=$1", [item.id, reason]);
    return { sent: false, reason: "El proveedor no confirmó el correo. Revisa Apps Script y vuelve a intentarlo desde la bandeja." };
  }
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
  if (path === "/api/attachments/config" && method === "GET")
    return json({ enabled: !!env.MEDIA, max_files: MAX_IMAGES, max_file_bytes: MAX_IMAGE_BYTES, types: ["image/jpeg", "image/png", "image/webp"] });

  if (path === "/api/health" && method === "GET") {
    if (!env.DATABASE_URL) return json({ ok: false, database: false, mail_configured: !!env.GOOGLE_APPS_SCRIPT_KEY, reply_configured: env.GOOGLE_SCRIPT_REPLY_ENABLED === "true" }, 503);
    try {
      await rows(getDb(env), "SELECT 1 AS ready");
      return json({ ok: true, database: true, platform: "cloudflare-pages", mail_configured: !!env.GOOGLE_APPS_SCRIPT_KEY,
        reply_configured: env.GOOGLE_SCRIPT_REPLY_ENABLED === "true" && !!env.GOOGLE_APPS_SCRIPT_REPLY_KEY });
    } catch { return json({ ok: false, database: false, mail_configured: !!env.GOOGLE_APPS_SCRIPT_KEY }, 503); }
  }


  if (path === "/api/tickets/login" && method === "POST") {
    const form = await payload(request);
    const email = clean(form.email, 180).toLowerCase(), accessCode = clean(form.accessCode, 100);
    const db = getDb(env);
    const lockKey = await ticketAuthKey(env, request);
    const attempts = await rows(db, "SELECT failures FROM villabyte_auth_attempts WHERE key=$1 AND expires_at>NOW()", [lockKey]);
    if (Number(attempts[0]?.failures || 0) >= 8) return bad("Demasiados intentos. Vuelve a intentar en 15 minutos.", 429);
    const tokenHash = accessCode.length >= 24 && accessCode.length <= 100
      ? await tokenDigest(env, accessCode) : "";
    const matches = validMail(email) && tokenHash ? await rows(db,
      "SELECT r.id FROM villabyte_request_access a JOIN villabyte_requests r ON r.id=a.request_id WHERE lower(r.email)=$1 AND a.token_hash=$2", [email, tokenHash]) : [];
    if (!matches.length) {
      await rows(db, "INSERT INTO villabyte_auth_attempts(key,failures,expires_at) VALUES($1,1,NOW()+INTERVAL '15 minutes') ON CONFLICT(key) DO UPDATE SET failures=CASE WHEN villabyte_auth_attempts.expires_at<NOW() THEN 1 ELSE villabyte_auth_attempts.failures+1 END,expires_at=NOW()+INTERVAL '15 minutes'", [lockKey]);
      return bad("Correo o código de acceso incorrecto", 401);
    }
    await rows(db, "DELETE FROM villabyte_auth_attempts WHERE key=$1", [lockKey]);
    return json({ success:true, ticket_id:matches[0].id }, 200, { "Set-Cookie":await ticketCookie(env, matches[0].id, email, tokenHash) });
  }
  if (path === "/api/tickets/logout" && method === "POST")
    return json({ success:true }, 200, { "Set-Cookie":TICKET_COOKIE+"=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0" });
  if (path === "/api/tickets/session" && method === "GET") {
    const session = await clientSession(request, env);
    return json({ authenticated:!!session, email:session?.email || null });
  }
  if (path === "/api/tickets/thread" && ["GET","POST"].includes(method)) {
    const session = await clientSession(request, env);
    if (!session) return bad("Inicia sesión con el código de tu ticket",401);
    const db = getDb(env);
    if (method === "GET") return json(await ticketHistory(db,session.ticketId));
    const body = await payload(request), message = clean(body.message,3000);
    if (message.length < 2) return bad("Escribe tu mensaje");
    const tally = await rows(db, "SELECT COUNT(*)::int AS n FROM villabyte_ticket_messages WHERE request_id=$1 AND created_at>NOW()-INTERVAL '24 hours'", [session.ticketId]);
    if (Number(tally[0]?.n || 0) >= 20) return bad("Límite diario de mensajes alcanzado",429);
    const msgId=crypto.randomUUID();
    await rows(db, "INSERT INTO villabyte_ticket_messages(id,request_id,sender_email,sender_type,body) VALUES($1,$2,$3,'client',$4)",
      [msgId,session.ticketId,session.email,message]);
    let notified=false;
    if (env.GOOGLE_APPS_SCRIPT_KEY) {
      try {
        const result=await emailFromScript(env,{action:"new_request",name:"Seguimiento de cliente",email:session.email,
          phone:"",company:"Villabyte",subject:"Seguimiento de ticket "+session.ticketId.slice(0,8),
          message:"Mensaje del cliente en su ticket:\\n"+message+"\\nTicket: "+session.ticketId,
          page:new URL(request.url).origin+"/#admin",website:""});
        notified=result.ok===true && result.filtered!==true;
        if(notified)await rows(db,"UPDATE villabyte_ticket_messages SET notification_sent=TRUE WHERE id=$1",[msgId]);
      } catch(err) {console.error("Ticket message persisted; notification failed",err);}
    }
    return json({success:true,id:msgId,notified},201);
  }
  if (path === "/api/admin/session" && method === "GET") {
    const account = await getAdmin(request, env);
    return json({ authenticated: !!account, user: account ? { email: account.email, role: account.role } : null });
  }
  if (path === "/api/admin/login" && method === "POST") {
    if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD || !env.SESSION_SECRET || env.SESSION_SECRET.length < 32) return bad("Administrador sin configurar", 503);
    const data = await payload(request);
    const email = clean(data.email, 180).toLowerCase();
    const pass = clean(data.password, 250);
    const db = getDb(env);
    const key = await sha256((request.headers.get("cf-connecting-ip") || "unknown") + ":" + env.SESSION_SECRET);
    const attempts = await rows(db, "SELECT failures FROM villabyte_auth_attempts WHERE key=$1 AND expires_at>NOW()", [key]);
    if (Number(attempts[0]?.failures || 0) >= 8) return bad("Demasiados intentos; espera 15 minutos", 429);
    const account = adminAccounts(env).find(x => x.email === email);
    const expected = await sha256(account?.password || env.ADMIN_PASSWORD), supplied = await sha256(pass);
    // Compare fixed-length digests without an early exit.
    let difference = 0;
    for (let i = 0; i < expected.length; i++) difference |= expected.charCodeAt(i) ^ supplied.charCodeAt(i);
    if (!account || difference !== 0) {
      await rows(db, "INSERT INTO villabyte_auth_attempts(key,failures,expires_at) VALUES($1,1,NOW()+INTERVAL '15 minutes') ON CONFLICT(key) DO UPDATE SET failures=CASE WHEN villabyte_auth_attempts.expires_at<NOW() THEN 1 ELSE villabyte_auth_attempts.failures+1 END,expires_at=NOW()+INTERVAL '15 minutes'", [key]);
      return bad("Credenciales inválidas", 401);
    }
    await rows(db, "DELETE FROM villabyte_auth_attempts WHERE key=$1", [key]);
    return json({ success: true, user: { email: account.email, role: account.role } }, 200, { "Set-Cookie": await makeCookie(env, account) });
  }
  if (path === "/api/admin/logout" && method === "POST") {
    if (!await isAdmin(request, env)) return bad("Acceso no autorizado", 401);
    return json({ success: true }, 200, { "Set-Cookie": COOKIE + "=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0" });
  }

  const contentKey = path.slice(5);
  const contentTypes = ["config", "services", "projects", "trusted-clients"];
  if (contentTypes.includes(contentKey) && method === "GET") return json(await readCms(getDb(env), contentKey));

  if (path === "/api/requests" && method === "POST") {
    const multipart = (request.headers.get("content-type") || "").toLowerCase().includes("multipart/form-data");
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (multipart && contentLength > MAX_UPLOAD_BODY) return bad("El envío supera el límite de 10 MB", 413);
    const form = multipart ? await request.formData() : null;
    const body: Row = form
      ? Object.fromEntries(["name", "email", "phone", "service_id", "description", "website", "turnstileToken"].map(k => [k, typeof form.get(k) === "string" ? form.get(k) : ""]))
      : await payload(request);
    if (form) body.accepted = form.get("accepted") === "true";
    if (body.website) return json({ ok: true }); // anti-spam field
    const images = form ? form.getAll("images") : [];
    if (images.length > MAX_IMAGES) return bad("Puedes adjuntar un máximo de 3 imágenes", 400);
    if (images.length && !env.MEDIA) return bad("Las fotos todavía no están habilitadas. Contacta a Villabyte o envía tu solicitud sin imágenes.", 503);
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
    // Validate all images BEFORE uploading any, to avoid orphaned R2 objects
    // when a later attachment is invalid.
    const verified: { buffer: ArrayBuffer; filename: string; type: string; ext: string }[] = [];
    for (const part of images) {
      if (!(part instanceof File)) return bad("Los adjuntos deben ser imágenes", 400);
      if (part.size === 0 || part.size > MAX_IMAGE_BYTES) return bad("Cada imagen debe pesar máximo 3 MB", 413);
      if (!["image/jpeg", "image/png", "image/webp"].includes(part.type)) return bad("Solo se aceptan fotos JPG, PNG o WebP", 400);
      const buffer = await part.arrayBuffer();
      const format = sniffImage(new Uint8Array(buffer));
      if (!format || format.type !== part.type) return bad("Una imagen no coincide con su formato real", 400);
      verified.push({
        buffer, filename: clean(part.name.replace(/[\\/]/g, "_"), 120) || ("foto." + format.ext),
        type: format.type, ext: format.ext
      });
    }
    const id = crypto.randomUUID();
    const uploaded: ImageUpload[] = [];
    try {
      for (const image of verified) {
        const fileId = crypto.randomUUID();
        const key = "requests/" + id + "/" + fileId + "." + image.ext;
        await env.MEDIA!.put(key, image.buffer, { httpMetadata: { contentType: image.type } });
        uploaded.push({ id: fileId, object_key: key, filename: image.filename, content_type: image.type, byte_size: image.buffer.byteLength });
      }
      // Atomic metadata and request insert. The original request JSON contract remains intact.
      const accessCode=newTicketSecret();
      const accessHash=await tokenDigest(env,accessCode);
      await rows(db, `WITH inserted AS (
        INSERT INTO villabyte_requests(id,name,email,phone,service_id,service_title,description,status,email_sent,replies)
        VALUES($1,$2,$3,$4,$5,$6,$7,'nuevo',FALSE,'[]'::jsonb) RETURNING id
      ), images AS (
        INSERT INTO villabyte_request_attachments (id, request_id, object_key, filename, content_type, byte_size)
        SELECT a.id::uuid, inserted.id, a.object_key, a.filename, a.content_type, a.byte_size
        FROM inserted CROSS JOIN jsonb_to_recordset($8::jsonb)
          AS a(id text, object_key text, filename text, content_type text, byte_size integer)
        RETURNING id
      ), access AS (
        INSERT INTO villabyte_request_access(request_id,token_hash)
        SELECT inserted.id, $9 FROM inserted RETURNING request_id
      ) SELECT id FROM inserted`, [id, name, email, phone, serviceId, selected.title, description, JSON.stringify(uploaded), accessHash]);
    } catch (error) {
      await Promise.allSettled(uploaded.map(item => env.MEDIA!.delete(item.object_key)));
      throw error;
    }
    const notice = await sendOwnerNotice(db, env, { id, name, email, phone, service_title: selected.title, description }, url.origin + "/#solicitar");
    return json({ ok: true, id, access_code: accessCode, notified: notice.sent, image_count: uploaded.length }, 201);
  }

  // Never reveal provider diagnostics or customer data without an admin session.
  const operator=await getAdmin(request,env);
  if (!operator) return bad("Inicia sesión como administrador", 401);
  if (operator.role==="reviewer" && (method!=="GET" || !(path==="/api/admin/requests" || path==="/api/admin/mail-status" || new RegExp("^/api/admin/requests/[0-9a-f-]{36}/images/[0-9a-f-]{36}$","i").test(path))))
    return bad("Esta cuenta puede revisar las solicitudes, pero no modificarlas",403);
  if (path === "/api/admin/mail-status" && method === "GET") {
    const probe = await probeMailScript(env);
    const mailConfigured = !!env.GOOGLE_APPS_SCRIPT_KEY;
    const replyKey = !!(env.GOOGLE_APPS_SCRIPT_REPLY_KEY || env.GOOGLE_APPS_SCRIPT_KEY);
    const enabled = env.GOOGLE_SCRIPT_REPLY_ENABLED !== "false";
    return json({
      mail_configured: !!env.GOOGLE_APPS_SCRIPT_KEY,
      notifications_ready: probe.notification,
      reply_configured: mailConfigured && replyKey && enabled && probe.reply,
      script_online: probe.online,
      script_version: probe.version,
      missing_reply_key: !replyKey,
      reply_enabled: enabled,
      reason: !enabled ? "Respuestas deshabilitadas por GOOGLE_SCRIPT_REPLY_ENABLED=false" : probe.reason
    });
  }
  // Test the EXISTING deployed Apps Script with a real POST, without replacing it.
  // This is an authenticated, explicit action: do not send during health checks.
  if (path === "/api/admin/mail-test" && method === "POST") {
    if (!env.GOOGLE_APPS_SCRIPT_KEY)
      return bad("Falta GOOGLE_APPS_SCRIPT_KEY en los Secrets de Cloudflare. El endpoint de Google no necesita cambios.", 503);
    const owner = clean(env.ADMIN_EMAIL, 180).toLowerCase();
    if (!validMail(owner)) return bad("ADMIN_EMAIL no está configurado correctamente", 503);
    const reference = crypto.randomUUID().slice(0, 8);
    try {
      const result = await emailFromScript(env, {
        action: "new_request", name: "Prueba técnica Villabyte",
        email: owner, phone: "", company: "Villabyte",
        subject: "PRUEBA de correo CMS - " + reference,
        message: "PRUEBA INTERNA: Se está verificando el endpoint de correo comercial desde el panel de Villabyte. No es una solicitud de un cliente. Referencia: " + reference + ". Fecha: " + new Date().toISOString(),
        page: url.origin + "/#admin", website: ""
      });
      if (!result.ok || result.filtered === true)
        return bad("Google Apps Script no confirmó el envío.", 502);
      return json({
        success: true, provider_accepted: true, reference,
        message: "El endpoint de Apps Script respondió correctamente. Confirma que el mensaje de prueba llegó a la bandeja de destino configurada en Google.",
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Test del endpoint existente de Apps Script falló", err);
      return bad("No se pudo completar la prueba por Google Apps Script. Comprueba la API_KEY y revisa el registro de Functions.", 502);
    }
  }
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
    return json(await rows(db, `SELECT r.*,
      COALESCE((SELECT jsonb_agg(jsonb_build_object(
        'id',a.id,'filename',a.filename,'content_type',a.content_type,'byte_size',a.byte_size
      ) ORDER BY a.created_at) FROM villabyte_request_attachments a WHERE a.request_id=r.id), '[]'::jsonb) AS attachments
      , COALESCE((SELECT jsonb_agg(jsonb_build_object('id',m.id,'body',m.body,'sender_email',m.sender_email,'created_at',m.created_at,'notification_sent',m.notification_sent)
         ORDER BY m.created_at) FROM villabyte_ticket_messages m WHERE m.request_id=r.id),'[]'::jsonb) AS client_messages
      FROM villabyte_requests r ORDER BY r.created_at DESC LIMIT 250`));
  }
  // Photos always require the same admin cookie as the inbox. No public R2 URLs exist.
  const imageRoute = path.match(/^\/api\/admin\/requests\/([0-9a-f-]{36})\/images\/([0-9a-f-]{36})$/i);
  if (imageRoute && method === "GET") {
    if (!env.MEDIA) return bad("Almacenamiento de imágenes sin configurar", 503);
    const item = await rows(db, "SELECT object_key, content_type FROM villabyte_request_attachments WHERE request_id=$1 AND id=$2", [imageRoute[1], imageRoute[2]]);
    if (!item.length) return bad("Imagen no encontrada", 404);
    const object = await env.MEDIA.get(item[0].object_key);
    if (!object) return bad("Imagen no disponible", 404);
    const suffix = item[0].content_type === "image/png" ? "png" : item[0].content_type === "image/webp" ? "webp" : "jpg";
    return new Response(object.body, { status: 200, headers: {
      "Content-Type": item[0].content_type,
      "Content-Disposition": 'inline; filename="imagen.' + suffix + '"',
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Cross-Origin-Resource-Policy": "same-origin"
    } });
  }
  const match = path.match(/^\/api\/admin\/requests\/([0-9a-f-]{36})(?:\/(reply|notify|access))?$/i);
  if (match && method === "POST" && match[2] === "access") {
    if (operator.role !== "owner") return bad("Solo el titular puede emitir códigos de acceso", 403);
    const found = await rows(db,"SELECT email FROM villabyte_requests WHERE id=$1",[match[1]]);
    if(!found.length)return bad("Solicitud no encontrada",404);
    const code=newTicketSecret();
    const hash=await tokenDigest(env,code);
    await rows(db,"INSERT INTO villabyte_request_access(request_id,token_hash) VALUES($1,$2) ON CONFLICT(request_id) DO UPDATE SET token_hash=EXCLUDED.token_hash,rotated_at=NOW()",[match[1],hash]);
    return json({success:true,access_code:code,email:found[0].email,
      notice:"Copia este código y entrégalo solamente al titular del correo. Se invalida cualquier código anterior."});
  }
  if (match && method === "POST" && match[2] === "notify") {
    const found = await rows(db, "SELECT * FROM villabyte_requests WHERE id=$1", [match[1]]);
    if (!found.length) return bad("Solicitud no encontrada", 404);
    if (found[0].email_sent === true) return json({ success: true, notified: true, already_sent: true });
    const result = await sendOwnerNotice(db, env, found[0], url.origin + "/#admin");
    if (!result.sent) return bad(result.reason, 503);
    const row = (await rows(db, "SELECT * FROM villabyte_requests WHERE id=$1", [match[1]]))[0];
    return json({ success: true, notified: true, request: row });
  }
  if (match && method === "PATCH" && !match[2]) {
    const body = await payload(request);
    const status = clean(body.status, 40);
    if (!["nuevo", "contactado", "en_proceso", "cerrado"].includes(status)) return bad("Estado no válido");
    const changed = await rows(db, "UPDATE villabyte_requests SET status=$1 WHERE id=$2 RETURNING *", [status, match[1]]);
    return changed[0] ? json(changed[0]) : bad("Solicitud no encontrada", 404);
  }
  if (match && method === "POST" && match[2] === "reply") {
    // The reply must always reach the customer's private ticket. Email is
    // best-effort, and we never treat a notification-only response as delivery.
    const body = await payload(request);
    const message = clean(body.message, 4000);
    if (message.length < 10) return bad("Escribe una respuesta de al menos 10 caracteres");
    const found = await rows(db, "SELECT * FROM villabyte_requests WHERE id=$1", [match[1]]);
    if (!found.length) return bad("Solicitud no encontrada", 404);
    const requestItem = found[0];
    // Write the response to the ticket BEFORE attempting external email delivery.
    // If Google is not configured, the customer still sees this reply on login.
    const replyId=crypto.randomUUID();
    const replies = [...(Array.isArray(requestItem.replies) ? requestItem.replies : []),
      { id: replyId, date: new Date().toISOString(), text: message, sent: false, author: operator.email }];
    await rows(db, "UPDATE villabyte_requests SET replies=$1::jsonb,status='contactado' WHERE id=$2", [JSON.stringify(replies), match[1]]);
    let emailed=false;
    // Cloudflare already keeps API_KEY private. REPLY_KEY is optional;
    // when absent, the same existing Apps Script API_KEY authenticates replies.
    if (env.GOOGLE_APPS_SCRIPT_KEY && env.GOOGLE_SCRIPT_REPLY_ENABLED !== "false") {
      try {
        const response = await emailFromScript(env, {
          action: "reply_to_customer",
          replyKey: env.GOOGLE_APPS_SCRIPT_REPLY_KEY || env.GOOGLE_APPS_SCRIPT_KEY,
          recipient: requestItem.email, requestId: requestItem.id,
          subject: "Villabyte - Respuesta a solicitud "+requestItem.id.slice(0,8),
          message, website: ""
        });
        // Fail closed on old notification-only scripts. They can return ok:true
        // while mailing the owner instead of the customer.
        emailed=response.action==="reply_to_customer" &&
          response.recipient===requestItem.email && response.requestId===requestItem.id;
        if(emailed)await rows(db,"UPDATE villabyte_requests SET replies=(SELECT jsonb_agg(CASE WHEN x->>'id'=$2 THEN jsonb_set(x,'{sent}','true'::jsonb) ELSE x END ORDER BY ord) FROM jsonb_array_elements(replies) WITH ORDINALITY AS t(x,ord)) WHERE id=$1",[match[1],replyId]);
      }catch(err){console.error("Ticket reply saved, email delivery unconfirmed",err);}
    }
    return json({ success:true, ticket_saved:true, emailed, notice:emailed?
      "Respuesta guardada en el ticket y enviada al correo del cliente":
      "Respuesta guardada en el ticket. El correo al cliente no fue confirmado; puede verla al acceder a su ticket." });
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
