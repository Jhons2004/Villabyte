import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = name => readFileSync(new URL("../" + name, import.meta.url), "utf8");

test("Villabyte fallback includes 35 valid published service offerings", () => {
  const txt = read("src/catalogSeeds.ts");
  const pos = txt.indexOf("=");
  assert.ok(pos >= 0);
  const catalog = JSON.parse(txt.slice(pos + 1).trim().replace(/;\s*$/, ""));
  assert.equal(catalog.length, 35);
  assert.equal(new Set(catalog.map(x => x.id)).size, catalog.length);
  for (const item of catalog) {
    assert.ok(item.id && item.category && item.title && item.description);
    assert.ok(item.price === null || (Number.isFinite(item.price) && item.price >= 0));
    assert.equal(item.active, true);
  }
});

test("Villabyte portfolio includes 16 distinct projects and school project", () => {
  const src = read("src/projectSeeds.ts");
  const ids = [...src.matchAll(/\{\s*id:\s*"([^"]+)"/g)].map(x => x[1]);
  assert.equal(ids.length, 16);
  assert.equal(new Set(ids).size, 16);
  assert.ok(src.includes("Colegio Mundo de Juguetes"));
});

test("Cloudflare Pages Functions replaces legacy Node server and keeps secrets server-side", () => {
  const worker = read("functions/api/[[path]].ts");
  const config = read("wrangler.toml");
  const pkg = JSON.parse(read("package.json"));
  assert.ok(worker.includes('import { neon } from "@neondatabase/serverless"'));
  assert.ok(worker.includes("crypto.subtle.verify"));
  assert.ok(worker.includes('"/api/admin/requests"'));
  assert.ok(worker.includes('"/api/requests"'));
  assert.ok(worker.includes("GOOGLE_APPS_SCRIPT_KEY"));
  assert.ok(worker.includes("GOOGLE_SCRIPT_REPLY_ENABLED"));
  assert.ok(config.includes('pages_build_output_dir = "./dist"'));
  assert.equal(pkg.scripts.build, "npm run test && vite build");
  assert.ok(!JSON.stringify(pkg.scripts).includes("server.ts"));
});

test("two independent administrator accounts and private dual email notification are wired", () => {
  const worker = read("functions/api/[[path]].ts");
  const script = read("integrations/google-apps-script/villabyte-mail-v2.gs");
  const frontend = read("src/App.tsx");
  const env = read(".dev.vars.example");

  assert.ok(worker.includes("SECONDARY_ADMIN_EMAIL"));
  assert.ok(worker.includes("SECONDARY_ADMIN_PASSWORD"));
  assert.ok(worker.includes("type AdminAccount"));
  assert.ok(worker.includes("getAdmin(request, env)"));
  assert.ok(worker.includes("sessionRevision"));
  assert.ok(worker.includes('role: "owner" | "administrator"'));
  assert.ok(frontend.includes("setAdminUser"));
  assert.ok(frontend.includes("Si la olvidaste"));
  assert.ok(script.includes("SECONDARY_NOTIFICATION_EMAIL"));
  assert.ok(script.includes("mailOptions.cc = secondary"));
  assert.ok(env.includes("SECONDARY_ADMIN_EMAIL="));
  assert.ok(!frontend.includes("SECONDARY_ADMIN_PASSWORD"));
  assert.ok(!frontend.includes("GOOGLE_APPS_SCRIPT_KEY="));
});


test("CMS mail workflow supports diagnostics, a protected retry and safe customer replies", () => {
  const worker = read("functions/api/[[path]].ts");
  const frontend = read("src/App.tsx");
  const script = read("integrations/google-apps-script/villabyte-mail-v2.gs");

  assert.ok(worker.includes('path === "/api/admin/mail-status"'));
  assert.ok(worker.includes('match[2] === "notify"'));
  assert.ok(worker.includes("sendOwnerNotice"));
  assert.ok(worker.includes("notification_claimed_at"));
  assert.ok(worker.includes("notification_attempts"));
  assert.ok(worker.includes("last_notification_error"));
  assert.ok(worker.includes("if (!await isAdmin(request, env))"));
  assert.ok(worker.includes("if (!probe.reply)"));
  assert.ok(worker.includes('response.action !== "reply_to_customer"'));
  assert.ok(frontend.includes("retryNotification"));
  assert.ok(frontend.includes("Reenviar aviso"));
  assert.ok(frontend.includes("Verificar correo"));
  assert.ok(frontend.includes("mailBusy"));
  assert.ok(script.includes("capabilities: { notification: notification, reply_to_customer: reply }"));
  assert.ok(!frontend.includes("GOOGLE_APPS_SCRIPT_KEY="));
});

test("existing Apps Script is tested by a protected POST without modifying the remote script", () => {
  const worker = read("functions/api/[[path]].ts");
  const frontend = read("src/App.tsx");
  assert.ok(worker.includes('path === "/api/admin/mail-test" && method === "POST"'));
  assert.ok(worker.indexOf('if (!await isAdmin(request, env))') < worker.indexOf('path === "/api/admin/mail-test"'));
  assert.ok(worker.includes('subject: "PRUEBA de correo CMS - " + reference'));
  assert.ok(worker.includes('emailFromScript(env, {'));
  assert.ok(worker.includes("provider_accepted: true"));
  assert.ok(frontend.includes("Enviar correo de prueba"));
  assert.ok(frontend.includes('api("/api/admin/mail-test",{method:"POST"})'));
  assert.ok(frontend.includes("mail_configured:status.mail_configured"));
});

test("request images use private R2 storage and Neon metadata, not public URLs", () => {
  const worker = read("functions/api/[[path]].ts");
  const frontend = read("src/App.tsx");
  const stylesheet = read("src/index.css");
  assert.ok(worker.includes('MAX_IMAGES = 3'));
  assert.ok(worker.includes('MAX_IMAGE_BYTES = 3 * 1024 * 1024'));
  assert.ok(worker.includes('"/api/attachments/config"'));
  assert.ok(worker.includes('request.formData()'));
  assert.ok(worker.includes('form.getAll("images")'));
  assert.ok(worker.includes("sniffImage(new Uint8Array(buffer))"));
  assert.ok(worker.includes('env.MEDIA!.put('));
  assert.ok(worker.includes('jsonb_to_recordset($8::jsonb)'));
  assert.ok(worker.includes('villabyte_request_attachments'));
  assert.ok(worker.includes('Promise.allSettled(uploaded.map('));
  assert.ok(worker.includes('if (!await isAdmin(request, env))'));
  assert.ok(worker.includes('"/images/"') || worker.includes('/images\\/'));
  assert.ok(worker.includes('"Cache-Control": "private, no-store"'));
  assert.ok(frontend.includes('id="vb-photo-upload"'));
  assert.ok(frontend.includes('type="file"'));
  assert.ok(frontend.includes('new FormData()'));
  assert.ok(frontend.includes('setPhotoPreviews'));
  assert.ok(frontend.includes('URL.revokeObjectURL'));
  assert.ok(frontend.includes('r.attachments.map('));
  assert.ok(stylesheet.includes(".vb-photo-previews"));
  assert.ok(stylesheet.includes(".vb-request-images-grid"));
});
