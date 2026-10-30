# Añadir respuesta al cliente SIN sustituir el Apps Script de contacto

El archivo original que compartiste envía avisos a `config.DESTINATION_EMAIL`.
El campo `replyTo: correo` ayuda cuando respondes desde Gmail, pero **no envía una respuesta desde el CMS al cliente**.

Esta ampliación conserva todas las solicitudes y su API_KEY actual.

## Opción sencilla: pegar el archivo listo

Sustituye el contenido de la implementación existente por el archivo completo `Villabyte_Contacto_Con_Respuestas.gs` (se entrega como archivo descargable en la conversación), guarda y usa **Implementar → Administrar implementaciones → Editar → Nueva versión**. No ejecutes de nuevo `configurarApiComercial()` (podría sobrescribir los Script Properties que ya funcionan). No crees una implementación diferente y no cambies el endpoint ni la API_KEY.

## Opción mínima: agregar al doPost original

Después de validar `data.apiKey === config.API_KEY` y procesar el honeypot `website`, antes de limpiar nombre/correo, agrega:

```javascript
    if (data.action === 'reply_to_customer') {
      const to = String(data.recipient || '').trim().toLowerCase();
      const id = String(data.requestId || '').trim();
      const answer = limpiarTextoLargo_(data.message, 4000);
      if (data.replyKey !== config.API_KEY) {
        return respuestaJson_({ok:false, error:'No autorizado para responder.'});
      }
      if (!esCorreoValido_(to) || !/^[0-9a-f-]{36}$/i.test(id) || answer.length < 10) {
        return respuestaJson_({ok:false, error:'Respuesta inválida.'});
      }
      verificarLimiteEnvios_('reply:' + id + ':' + to);
      MailApp.sendEmail({
        to: to,
        subject: '[Villabyte] Respuesta a solicitud ' + id.substring(0,8),
        body: answer + '\n\nConsulta el seguimiento de tu solicitud en https://villabyte.pages.dev/#ticket',
        name: config.SENDER_NAME || 'Villabyte',
        replyTo: config.DESTINATION_EMAIL
      });
      return respuestaJson_({
        ok: true, action: 'reply_to_customer',
        recipient: to, requestId: id, timestamp: new Date().toISOString()
      });
    }
```

En `doGet`, agrega `capabilities: {notification:true,reply_to_customer:true}` al objeto JSON, opcionalmente, para que el diagnóstico del CMS reconozca la nueva versión.

El remitente efectivo de Gmail lo determina la cuenta bajo la cual se despliega Google Apps Script; comprueba que la Web App se ejecute con la cuenta comercial deseada o un alias autorizado.

**Importante:** mantener `API_KEY` como propiedad privada y nunca colocarla en React ni subirla a GitHub. En Cloudflare ya se usa `GOOGLE_APPS_SCRIPT_KEY`. El backend adaptado reutiliza esa misma clave, por lo que no exige un secreto adicional.

## Validación
1. En Villabyte /#admin, entra como titular y responde a una solicitud de prueba cuyo correo destinatario controles.
2. Revisa que Gmail reciba el correo y que el CMS indique `emailed:true`. Cuando el endpoint antiguo solo envía la notificación al propietario, el CMS no lo marcará como enviado al cliente.
3. Confirma que una solicitud pública nueva sigue llegando al correo comercial igual que antes.
