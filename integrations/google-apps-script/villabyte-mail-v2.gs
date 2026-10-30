/**
 * VILLABYTE - API comercial v2 (Google Apps Script Web App)
 *
 * Desplegar como Web app: ejecutar como propietario / acceso web según corresponda.
 * El código usa Script Properties. NUNCA escribir API_KEY ni REPLY_API_KEY aquí.
 *
 * Script Properties requeridas:
 *   API_KEY          = clave nueva SOLO para Backend Cloudflare Pages Functions
 *   REPLY_API_KEY    = opcional; si no existe, se reutiliza API_KEY privada del backend para respuestas
 *   DESTINATION_EMAIL = jonasvillavicencio845@gmail.com
 *   SECONDARY_NOTIFICATION_EMAIL = (email de segunda administradora, opcional)
 *   SITE_NAME        = Villabyte
 *   SENDER_NAME      = Villabyte | Atención comercial
 *
 * El backend es el único que debe llamar este Web App. No compartir claves
 * en código React, localStorage ni repositorios.
 */

function vbJson_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
function vbProps_() { return PropertiesService.getScriptProperties().getProperties(); }
function vbClean_(v, max) {
  return String(v == null ? "" : v)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim().substring(0, max || 400);
}
function vbEmail_(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function vbEscape_(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function vbLimit_(label, count, seconds) {
  var cache = CacheService.getScriptCache();
  var key = "vb_" + label;
  var previous = Number(cache.get(key) || "0");
  if (previous >= count) throw new Error("Límite de envíos alcanzado.");
  cache.put(key, String(previous + 1), seconds);
}
function vbDigest_(txt) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, txt)
    .slice(0, 12).map(function (b) { return ("0" + ((b + 256) % 256).toString(16)).slice(-2); }).join("");
}
function vbSend_(options) {
  var recipients = [options.to, options.cc || "", options.bcc || ""]
    .filter(function(x) { return !!x; })
    .join(",").split(",")
    .filter(function(x) { return !!String(x).trim(); }).length;
  if (MailApp.getRemainingDailyQuota() < recipients)
    throw new Error("Cuota diaria de correo insuficiente.");
  MailApp.sendEmail(options);
}
function doGet() {
  // Health only: never expose API keys, recipient addresses or personal data.
  var cfg = vbProps_();
  var notification = !!cfg.API_KEY && vbEmail_(cfg.DESTINATION_EMAIL || "");
  // Compatible con el servicio actual: API_KEY protege también las respuestas.
  // Si se configura REPLY_API_KEY por separado, se usa esa clave adicional.
  var reply = notification && !!(cfg.REPLY_API_KEY || cfg.API_KEY);
  return vbJson_({ ok: true, status: "online", service: "Villabyte MailApp API v2",
    capabilities: { notification: notification, reply_to_customer: reply },
    timestamp: new Date().toISOString() });
}
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) throw new Error("No se recibió el contenido.");
    var cfg = vbProps_();
    if (!cfg.API_KEY || !cfg.DESTINATION_EMAIL || !vbEmail_(cfg.DESTINATION_EMAIL))
      throw new Error("Configuración de Script Properties incompleta.");
    var d = JSON.parse(e.postData.contents);
    if (!d || typeof d !== "object" || d.apiKey !== cfg.API_KEY)
      throw new Error("No autorizado.");
    if (d.website) return vbJson_({ ok: true, filtered: true });

    var action = vbClean_(d.action || "new_request", 40);
    var senderName = cfg.SENDER_NAME || "Villabyte";
    var siteName = cfg.SITE_NAME || "Villabyte";

    if (action === "reply_to_customer") {
      var replyKey = cfg.REPLY_API_KEY || cfg.API_KEY;
      if (!replyKey || d.replyKey !== replyKey)
        throw new Error("No autorizado para responder.");
      var recipient = vbClean_(d.recipient, 160).toLowerCase();
      var requestId = vbClean_(d.requestId, 80);
      var answer = vbClean_(d.message, 4000);
      if (!vbEmail_(recipient) || !/^[0-9a-f-]{36}$/i.test(requestId) || answer.length < 10)
        throw new Error("Respuesta inválida.");
      vbLimit_("reply_" + vbDigest_(requestId), 8, 3600);
      var ticketLink = "https://villabyte.pages.dev/#ticket";
      vbSend_({ to: recipient, name: senderName,
        replyTo: cfg.DESTINATION_EMAIL,
        subject: "[Villabyte] Respuesta a solicitud " + requestId.substring(0,8),
        body: answer + "\n\nConsulta y responde en tu ticket: " + ticketLink +
          "\nCódigo de solicitud: " + requestId.substring(0,8),
        htmlBody: "<div style='font-family:Arial,sans-serif;max-width:650px;padding:24px'>" +
          "<h2 style='color:#9a702e'>Villabyte | Respuesta a tu solicitud</h2>" +
          "<p style='white-space:pre-wrap'>" + vbEscape_(answer) + "</p>" +
          "<p><a href='" + ticketLink + "'>Consultar mi ticket y responder</a></p>" +
          "<hr><small>Código de solicitud: " + vbEscape_(requestId.substring(0,8)) + "</small></div>" });
      return vbJson_({ ok: true, action: "reply_to_customer", recipient: recipient,
        requestId: requestId, timestamp: new Date().toISOString() });
    }

    if (action !== "new_request") throw new Error("Acción no permitida.");
    var name = vbClean_(d.name, 100), email = vbClean_(d.email, 160).toLowerCase();
    var phone = vbClean_(d.phone, 40), company = vbClean_(d.company, 100);
    var subject = vbClean_(d.subject, 180), message = vbClean_(d.message, 5000);
    var page = vbClean_(d.page, 300);
    if (!name || !vbEmail_(email) || !message) throw new Error("Solicitud incompleta.");
    vbLimit_("inquiry_" + vbDigest_(email), 5, 900);
    var info = "Nombre: " + name + "\nCorreo: " + email +
      "\nTeléfono: " + (phone || "No indicado") +
      "\nEmpresa: " + (company || "No indicada") +
      "\nOrigen: " + page + "\n\nMensaje:\n" + message;
    // Recipients are controlled ONLY by the script's private properties,
    // never by client input. Each administrator receives the same notification.
    var primary = vbClean_(cfg.DESTINATION_EMAIL, 160).toLowerCase();
    var secondary = vbClean_(cfg.SECONDARY_NOTIFICATION_EMAIL, 160).toLowerCase();
    if (secondary && !vbEmail_(secondary))
      throw new Error("SECONDARY_NOTIFICATION_EMAIL no es un correo válido.");
    var mailOptions = { to: primary, name: senderName,
      subject: "[" + siteName + "] " + (subject || "Nueva solicitud"),
      body: info,
      replyTo: email,
      htmlBody: "<div style='font-family:Arial,sans-serif;padding:26px;background:#111;color:#eee'>" +
        "<h2 style='color:#d5ac6b'>Nueva solicitud: " + vbEscape_(siteName) + "</h2>" +
        "<p><strong>Nombre:</strong> " + vbEscape_(name) + "</p>" +
        "<p><strong>Correo:</strong> " + vbEscape_(email) + "</p>" +
        "<p><strong>Teléfono:</strong> " + vbEscape_(phone) + "</p>" +
        "<p><strong>Asunto:</strong> " + vbEscape_(subject) + "</p>" +
        "<p style='white-space:pre-wrap'>" + vbEscape_(message) + "</p></div>" };
    if (secondary && secondary !== primary) mailOptions.cc = secondary;
    vbSend_(mailOptions);
    return vbJson_({ ok: true, action: "new_request", timestamp: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    return vbJson_({ ok: false, error: String(err && err.message || err) });
  }
}
