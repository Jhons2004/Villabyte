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
