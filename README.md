# Villabyte 2.0 — Cloudflare Pages + Pages Functions + Neon

Sitio comercial de Villabyte en Guatemala. Arquitectura adaptada de Express/Render a Cloudflare Pages + Pages Functions (runtime de Cloudflare Workers): frontend React 19/Vite, CMS, 35 servicios, 16 proyectos, solicitudes y respuestas por Google Apps Script.

## Arquitectura

- **Frontend**: React + Vite compilado como archivos estáticos en `dist/`.
- **Backend**: `functions/api/[[path]].ts` implementa la API /api/* en Cloudflare Pages Functions. No se requiere servidor Node ni Render.
- **PostgreSQL**: base exclusiva **Villabyte** en Neon, proyecto `falling-darkness-69465997`, DB `villabyte`. Se utiliza `@neondatabase/serverless` por HTTPS y `DATABASE_URL` en un secret privado.
- **Correos**: Google Apps Script / MailApp en el proyecto del usuario; clave API solo en Pages Functions, nunca en frontend.
- **Panel**: `/#admin` usa cookies HttpOnly/Secure/SameSite=Strict firmadas con HMAC Web Crypto. Operaciones de CMS y bandeja requieren sesión válida.
- **Seguridad**: validación de origen, payload limitado, control de intentos administrativos mediante Neon, límite de solicitudes por correo en 15 minutos y honeypot; opcional validación Turnstile después de integrar su widget.

El formulario guarda primero en Neon y luego intenta notificar a Gmail. Si falla la notificación, la solicitud queda guardada y se muestra su identificador. La respuesta desde el panel solo se activa después de configurar Apps Script v2.

## Datos comerciales

- Villabyte, Guatemala
- Contacto: **+502 4131 6765**
- Correo: **jonasvillavicencio845@gmail.com**
- Representante: **Jonatan Abdiel Alvarado Villavicencio**, Arquitecto de software
- 35 servicios con **tarifas de referencia**, no cotizaciones definitivas
- 16 proyectos en distintas etapas, incluido **Colegio Mundo de Juguetes**

Los datos de catálogo y proyectos se encuentran en Neon. `src/catalogSeeds.ts` y `src/projectSeeds.ts` mantienen una versión **pública de respaldo** para visualizar la web aun cuando el backend todavía no se haya configurado. Las ediciones reales se almacenan en Neon.

## Publicación inicial desde Cloudflare (sin Render)

1. Crear cuenta o iniciar sesión en https://dash.cloudflare.com/ .
2. Abrir **Workers & Pages → Create application → Pages → Connect to Git** (la ubicación exacta del menú puede variar).
3. Autorizar GitHub `Jhons2004` y seleccionar el repositorio `Jhons2004/Villabyte`, rama de producción **main**. No es necesario crear una copia del repositorio.
4. Elegir configuración de Vite:
   - **Root directory**: raíz del repositorio
   - **Build command**: `npm install --no-audit --no-fund && npm run build`
   - **Build output directory**: `dist`
   - **Node.js**: 22
   - **Pages project name**: `villabyte` (si no está disponible, usar otra denominación y actualizar el nombre de `wrangler.toml`)
5. En el proyecto de Pages, abrir **Settings → Variables and Secrets** y agregar secretos **encrypted**; configurar tanto el entorno de producción como el de vista previa si se requiere.
6. Crear los secretos siguientes:
   - `DATABASE_URL` — obtener en el panel de Neon, seleccionando proyecto Villabyte, base villabyte, rama main. Nunca publicar la URI.
   - `ADMIN_EMAIL` — `jonasvillavicencio845@gmail.com`
   - `ADMIN_PASSWORD` — contraseña nueva y robusta, exclusiva del CMS.
   - `SESSION_SECRET` — valor aleatorio con al menos 32 caracteres.
   - `GOOGLE_APPS_SCRIPT_URL` — URL /exec de la Web App comercial en su versión pública, sin /u/1.
   - `GOOGLE_APPS_SCRIPT_KEY` — debe coincidir con la propiedad `API_KEY` del script.
   - `GOOGLE_APPS_SCRIPT_REPLY_KEY` — debe coincidir con `REPLY_API_KEY`, diferente de API_KEY.
   - `GOOGLE_SCRIPT_REPLY_ENABLED` — inicialmente `false`, cambiar a `true` tras comprobar que Google Apps Script v2 contesta a destinatarios externos correctamente.
7. Volver a desplegar para que Pages Functions reciba los secrets. Visitar `https://<nombre>.pages.dev/api/health`. Debe devolver `ok:true` y `database:true`.
8. Visitar la página pública, examinar los 35 servicios y 16 proyectos, crear solicitud de prueba, confirmar registro en Neon y comprobar notificación al Gmail indicado.
9. En `/#admin`, iniciar sesión con las credenciales configuradas y probar el envío de una respuesta a una cuenta controlada por ti. Solo entonces habilitar las respuestas automáticas.
10. Habilitar o mantener las actualizaciones automáticas de Cloudflare Pages desde GitHub y configurar un dominio propio si lo tienes.

Las claves nunca deben pegarse en React, en un commit público, ni en este chat. Google Apps Script envía desde la cuenta propietaria del script, no desde un servidor SMTP convencional.

### Script de correo

Código para actualizar la implementación actual: `integrations/google-apps-script/villabyte-mail-v2.gs`.

En **Propiedades del script**:
- `DESTINATION_EMAIL=jonasvillavicencio845@gmail.com`
- `SITE_NAME=Villabyte`
- `SENDER_NAME=Villabyte | Atención comercial`
- `API_KEY` y `REPLY_API_KEY`: generar claves distintas y secretas.

Actualizar mediante **Deploy → Manage deployments → Edit → New version**. La URL debe devolver `capabilities.reply_to_customer=true`. El backend no aceptará una respuesta como enviada a menos que el script confirme acción, destinatario e identificador.

## Dos administradores y recuperación de acceso

Villabyte tiene **dos cuentas administrativas independientes**: titular (owner) y una administradora secundaria opcional. Ambos inician sesión en `https://villabyte.pages.dev/#admin` con su propio correo y contraseña. Nunca comparten credenciales; ambos pueden gestionar solicitudes y contenidos del CMS. No se crea un usuario ni se activa la segunda cuenta hasta completar sus dos Secrets.

En **Cloudflare → Workers & Pages → villabyte → Settings → Variables and Secrets (Production)**, usar tipo **Secret**:

| Variable | Valor |
| --- | --- |
| `ADMIN_EMAIL` | `jonasvillavicencio845@gmail.com` (titular) |
| `ADMIN_PASSWORD` | Contraseña nueva del titular, de preferencia 16+ caracteres; no es la contraseña de Gmail |
| `SECONDARY_ADMIN_EMAIL` | Correo real de la administradora |
| `SECONDARY_ADMIN_PASSWORD` | Una contraseña nueva y distinta de al menos 12 caracteres |
| `SESSION_SECRET` | Clave de sesión aleatoria existente (32+ caracteres); no reemplazar si está funcionando, salvo rotación planificada |

Si olvidaste la contraseña del administrador, **no se puede recuperar ni leer el Secret anterior**. Quien tenga acceso legítimo a Cloudflare puede **reemplazar `ADMIN_PASSWORD` por una contraseña nueva** y desplegar nuevamente. El correo de acceso es el valor de `ADMIN_EMAIL`. Cambiar la contraseña invalida las sesiones antiguas de esa cuenta; no borres `DATABASE_URL` ni restablezcas Neon. El inicio de sesión tiene bloqueo temporal por intentos fallidos.

Para que **ambos reciban las notificaciones comerciales**, actualiza la Web App con `integrations/google-apps-script/villabyte-mail-v2.gs` y configura en las **Propiedades del script**:

| Propiedad Apps Script | Valor |
| --- | --- |
| `DESTINATION_EMAIL` | `jonasvillavicencio845@gmail.com` |
| `SECONDARY_NOTIFICATION_EMAIL` | Correo real de la segunda administradora |
| `API_KEY` | La misma clave guardada como `GOOGLE_APPS_SCRIPT_KEY` en Cloudflare |
| `REPLY_API_KEY` | La misma clave guardada como `GOOGLE_APPS_SCRIPT_REPLY_KEY` en Cloudflare |

El segundo destinatario se establece en propiedades privadas, no en el formulario público. MailApp envía el aviso al propietario y una copia a la administradora; el acceso al CMS sigue siendo independiente del envío de correos. No ejecutar la función heredada `configurarApiComercial()` del código antiguo: contiene un correo de destino diferente y una API key de demostración, y podría sobrescribir propiedades.

Después de guardar, publicar nueva versión desde Apps Script, volver a desplegar Pages, probar `/api/health` y un formulario controlado. El campo `mail_configured` solo informa que la clave existe, **no verifica la entrega real**.


## Probar el endpoint de correo ya publicado sin modificar Google Apps Script

El panel tiene un botón **Enviar correo de prueba** en `https://villabyte.pages.dev/#admin`, pestaña **Solicitudes**. Hace un POST real desde Cloudflare Pages Functions al **mismo endpoint Google Apps Script ya desplegado** mediante `GOOGLE_APPS_SCRIPT_URL` (o URL actual integrada por defecto), con la clave privada `GOOGLE_APPS_SCRIPT_KEY`. No reemplaza ni redepliega el script de Google ni crea solicitudes en Neon.

La petición utiliza el contrato existente `apiKey,name,email,phone,company,subject,message,page,website` y es compatible con el Apps Script v1 que solamente envía avisos al correo del propietario. El formulario v1 ignora el campo opcional `action`. La prueba envía una notificación real a `DESTINATION_EMAIL` definido dentro del Apps Script; **no necesariamente** al correo visible en el CMS si Google tiene otra configuración.

**Para ejecutarla:** entra como administrador → Solicitudes → **Enviar correo de prueba**. Si devuelve éxito, Google confirmó la aceptación de la llamada: busca el mensaje `PRUEBA de correo CMS` en el correo destino configurado en el propio Apps Script, incluidos spam/promociones. Si falla, revisa `GOOGLE_APPS_SCRIPT_KEY` en Cloudflare Production y `API_KEY` en las propiedades de Apps Script: ambos valores deben coincidir. El botón puede ejecutarse incluso si la comprobación GET de estado de Google no funciona, porque la prueba usa POST real. No hace falta alterar la implementación de Google para probar sus notificaciones.

**Nota:** `/api/health` con `mail_configured:true` solo verifica que Cloudflare tiene el secreto; **no demuestra entrega de correo**. El código original de Apps Script de contacto solo envía avisos al propietario y no responde al correo del cliente. Por eso el botón **Enviar respuesta** se mantiene protegido hasta que se disponga de una operación autorizada para responder al destinatario.

## Correo desde el CMS: completar activación y recuperar solicitudes pendientes

**Estado del despliegue:** los cambios de backend/frontend se publican en GitHub. La **Web App de Google Apps Script se debe actualizar desde el editor de Google** y sus claves deben configurarse como Secrets en Cloudflare. Publicar GitHub NO publica el script de Google automáticamente.

### 1. Web App Google Apps Script

1. Abre el proyecto que corresponde a la URL de GOOGLE_APPS_SCRIPT_URL (la Web App existente).
2. Guarda una copia del script actual. Sustituye su contenido por `integrations/google-apps-script/villabyte-mail-v2.gs`.
3. Abre **Configuración del proyecto > Propiedades del script** y establece:
   - `API_KEY`: nueva clave aleatoria; no la publiques ni uses una clave de demostración.
   - `REPLY_API_KEY`: segunda clave aleatoria, diferente de API_KEY.
   - `DESTINATION_EMAIL`: `jonasvillavicencio845@gmail.com`.
   - `SECONDARY_NOTIFICATION_EMAIL`: correo de la administradora si corresponde, opcional.
   - `SITE_NAME`: `Villabyte`.
   - `SENDER_NAME`: `Villabyte | Atención comercial`.
4. Implementa → Administrar implementaciones → Editar → **Nueva versión**, ejecución como titular y acceso apropiado para las llamadas HTTPS del backend.
5. La URL `/exec` debe devolver `status:online` y `capabilities.reply_to_customer:true` cuando las propiedades estén completas.
6. No ejecutes la función antigua `configurarApiComercial()`, porque sobrescribe el destinatario y la clave con valores de ejemplo.

### 2. Cloudflare Pages (entorno Production)

En **Workers & Pages > villabyte > Settings > Variables and Secrets** guarda como Secret:

| Clave | Qué poner |
| --- | --- |
| `GOOGLE_APPS_SCRIPT_KEY` | Exactamente el mismo valor que API_KEY en Apps Script |
| `GOOGLE_APPS_SCRIPT_REPLY_KEY` | Exactamente el mismo valor que REPLY_API_KEY en Apps Script |
| `GOOGLE_SCRIPT_REPLY_ENABLED` | `true`, **solo después de confirmar el despliegue v2** |
| `GOOGLE_APPS_SCRIPT_URL` | URL pública /exec de Apps Script; opcional si sigue siendo la ya configurada en código |

Conserva `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `SESSION_SECRET` tal como estén funcionando. No copies secretos en GitHub ni en React. Aplica el cambio mediante **un nuevo despliegue de main**.

### 3. Validación desde el CMS

- Abre `https://villabyte.pages.dev/#admin`.
- En la pestaña **Solicitudes** aparece el nuevo bloque **Correo de Villabyte**. Pulsa **Verificar correo**: consulta de forma protegida el despliegue de Apps Script y detecta si soporta respuestas v2.
- El estado `mail_configured` en `/api/health` solo significa que Cloudflare recibió la clave; no demuestra que el mensaje haya llegado. Se debe confirmar un envío real.
- Las solicitudes que entraron antes de configurar el correo se conservan en Neon con `email_sent=false`. Pulsa **Reenviar aviso** en cada solicitud pendiente. No vuelve a crear la solicitud.
- Al configurar las claves y activar respuestas, **Enviar respuesta** se habilita cuando la Web App v2 confirma su capacidad, el texto tiene al menos 10 caracteres y no hay otra operación activa.
- Las respuestas exitosas se guardan en la columna `replies` de Neon y la solicitud cambia a `contactado`.
- Si hay un error o demora durante un envío, **verifica primero en Gmail antes de intentarlo otra vez**, pues una respuesta de red ambigua puede producir mensajes duplicados. No se borra ni se marca como enviado un aviso que no fue confirmado.

### 4. Compatibilidad de la base de datos

La actualización añade **tres columnas no destructivas** a `villabyte_requests`:

```sql
ALTER TABLE villabyte_requests
  ADD COLUMN IF NOT EXISTS notification_claimed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notification_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_notification_error TEXT;
```

Esta migración ya se ejecutó en el proyecto Neon exclusivo de Villabyte. El reintento utiliza un bloqueo temporal por registro para reducir envíos duplicados. La integración de Google Apps Script no es SMTP directo: utiliza `MailApp.sendEmail()`, sujeto a cuotas diarias de Google.



## Imágenes en solicitudes (Cloudflare R2 privado)

El formulario comercial permite adjuntar **hasta 3 fotografías por solicitud**, de **máximo 3 MB por imagen**, solamente **JPG, PNG y WebP**. El navegador muestra vistas previas. El backend verifica el formato real del archivo por sus primeros bytes, limita el tamaño y protege la recepción contra otros tipos de archivos. La solicitud mantiene su ID de Neon y no se pierde si el correo comercial falla.

**Arquitectura:**
- Las imágenes originales se guardan en un **bucket R2 privado**, sin acceso público ni dominio `r2.dev`.
- Neon solo conserva metadatos e identificadores de imágenes en `villabyte_request_attachments`, asociados al ID de `villabyte_requests`.
- El CMS muestra miniaturas únicamente a administradores autenticados. El backend verifica la cookie de sesión y entrega los archivos por rutas privadas `/api/admin/requests/:id/images/:imageId`, con `Cache-Control: private, no-store`.
- La notificación que ya envía Google Apps Script mantiene su formato y solo menciona el número de fotografías; no se modifica el endpoint SMTP/API existente y no se publican enlaces a imágenes en Gmail.
- La carga es opcional. **Sin R2 configurado, las solicitudes de texto siguen funcionando y el selector de fotos aparece deshabilitado**, en vez de aceptar archivos que no podríamos conservar.

### Activación en Cloudflare (una vez por cuenta)

1. En `https://dash.cloudflare.com/` abre **Storage & databases → R2 → Overview**. Si es la primera vez, Cloudflare puede solicitar activar la suscripción de R2 y un método de pago; **revisa los cargos por excedentes antes de aceptar**.
2. Crea el bucket privado **`villabyte-solicitudes`**, clase **Standard**. No actives *Public bucket* ni `r2.dev`.
3. El proyecto Pages actual utiliza `wrangler.toml` como fuente de configuración. **Después de crear el bucket**, agrega al final de `wrangler.toml`:

   ```toml
   [[r2_buckets]]
   binding = "MEDIA"
   bucket_name = "villabyte-solicitudes"
   ```

4. Confirma que la rama principal se despliegue con **Success**. También puede configurarse la vinculación desde Settings → Bindings → R2 bucket en proyectos cuyo control de configuración sea el dashboard. En Villabyte prioriza el archivo `wrangler.toml`.
5. Abre `https://villabyte.pages.dev/api/attachments/config`: debe devolver `enabled: true`. Verifica que el selector de imágenes se habilite.
6. Crea una solicitud de prueba con una foto JPG, PNG o WebP de menos de 3 MB y verifica en `/#admin` que aparece la imagen y que el botón abre la imagen **solo al estar autenticado**. Repite sin iniciar sesión en una ventana privada: debe responder 401.
7. Prueba también el formulario sin fotos, para comprobar compatibilidad con el flujo antiguo.

### Migración de Neon realizada

La tabla `villabyte_request_attachments` se creó en el proyecto Neon Villabyte, con ID de adjunto UUID, referencia a solicitud UUID, nombre original, tipo real, tamaño, clave privada de R2 y fecha. No se alteraron ni borraron las solicitudes anteriores. No se guardan contraseñas ni URL pública de las fotos en Neon.

**Retención y seguridad:** define una política de conservación/eliminación de fotografías y revisa el consumo de R2. El bucket Standard incluye cierta cuota gratuita mensual, pero **puede generar facturación al superar los límites**. No almacenes documentos personales, credenciales ni imágenes sensibles en los adjuntos. Las fotografías no se envían como adjuntos de correo; se consultan desde el CMS privado.


## Desarrollo local

Node.js 22+.

- `npm install`
- Copiar `.dev.vars.example` a `.dev.vars` y completar valores locales (sin subir el archivo).
- `npm run build`
- `npm run dev:cloudflare` para ejecutar Pages Functions con Wrangler y el frontend compilado.
- `npm run lint` para verificar TypeScript.
- `npm run deploy:cloudflare` únicamente una vez autenticado en Cloudflare y creada la página correspondiente.

## Verificación y consideraciones

La base Neon exclusiva ya tiene tablas `villabyte_cms`, `villabyte_requests` y `villabyte_auth_attempts`. Contiene 35 servicios y 16 proyectos. La creación de la cuenta/proyecto Cloudflare y el ingreso de secretos requieren autorización desde tu cuenta; no se puede garantizar una URL pública hasta completar esos pasos.

**Pruebas pendientes antes de declarar producción OK:** compilar el repositorio con Node y las dependencias instaladas, confirmar logs de Pages Functions, probar consultas Neon, validar escritura/lectura y recepción de correos. GitHub Actions de este repositorio ha mostrado fallas previas de inicio de runner sin ejecutar los pasos, por lo que no se consideran pruebas completas.

Los servicios institucionales se presentan como trabajo técnico sin divulgar información confidencial ni afirmar una relación comercial oficial no autorizada. Precios referenciales; repuestos, licencias y desplazamientos se cotizan por separado.
