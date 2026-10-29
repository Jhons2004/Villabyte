# Villabyte — catálogo, cotizaciones y bandeja de solicitudes

Versión comercial de **VILLABYTE** (Guatemala): landing responsive negra/dorada, catálogo de soporte y desarrollo, precios en quetzales, portafolio y CMS de solicitudes con respuesta por correo.

## Funciones incluidas

- Catálogo de 35 servicios: computadoras, celulares, redes, páginas web, sistemas, bases de datos, IA y asesoría.
- Búsqueda y filtros por categoría, precios desde / por hora / por mes y cotización para repuestos.
- Portafolio con 16 proyectos comprobados por historial o repositorio, diferenciados por etapa.
- Formulario público con servicio, nombre, email, teléfono, descripción y consentimiento.
- Solicitudes persistentes en PostgreSQL y estado nuevo / contactado / en proceso / cerrado.
- Aviso al correo del propietario por la Web App existente de Google Apps Script y MailApp.
- Bandeja privada con historial y botón para enviar respuesta al correo del cliente; alternativa manual de abrir el cliente de correo.
- Panel para editar precios, activar/ocultar servicios, añadir proyectos y actualizar teléfono/correo.
- Inicio de sesión mediante credenciales privadas de entorno y cookie HttpOnly (sin contraseña por defecto).
- Sitio usable en móvil y escritorio, sin logotipos inventados ni métricas de SLA no acreditadas.

**Aviso:** Los importes incluidos son tarifas PROPUESTAS para revisión, no precios oficiales confirmados. Las licencias y repuestos se cotizan aparte cuando corresponda. Las cuentas móviles solo se recuperan por medios oficiales para sus titulares. Los casos institucionales requieren revisión de publicación autorizada antes de mostrar detalles y logotipos.

## Desarrollo

Requisitos: Node.js 20+ y npm.

1. Copiar el archivo .env.example a .env.
2. Definir ADMIN_EMAIL, ADMIN_PASSWORD (contraseña fuerte) y SESSION_SECRET (cadena aleatoria de 32+ caracteres).
3. Usar la base PostgreSQL **dedicada a Villabyte** en Neon, proyecto falling-darkness-69465997, base villabyte. Sus tablas villabyte_cms y villabyte_requests están creadas y contienen 35 servicios y 16 proyectos. Obtener DATABASE_URL desde Neon y configurarlo de forma privada en el hosting, nunca en GitHub.
4. Para correos, actualizar la Web App existente con integrations/google-apps-script/villabyte-mail-v2.gs, definir Script Properties API_KEY, REPLY_API_KEY, DESTINATION_EMAIL=jonasvillavicencio845@gmail.com, SITE_NAME y SENDER_NAME. Configurar GOOGLE_APPS_SCRIPT_URL y GOOGLE_APPS_SCRIPT_KEY de forma privada en Render. Activar GOOGLE_SCRIPT_REPLY_ENABLED=true únicamente después de comprobar GET de la versión 2 y una prueba de respuesta.
5. Ejecutar npm install, npm run lint, npm run dev. Abrir http://localhost:3000.
6. Abrir http://localhost:3000/#admin para el panel.

Sin base de datos, el sitio usa un catálogo temporal en memoria durante desarrollo. En producción el formulario rechaza solicitudes si no existe base de datos: **no finge que envió una solicitud**. La notificación por correo es secundaria: primero se guarda en PostgreSQL.

## Publicación (después de las pruebas)

La aplicación integra Vite + Express. Requiere un host Node.js para atender las rutas de API. Se puede publicar completa en Render:
- Build: npm install && npm run build
- Start: npm run start
- Variables privadas: NODE_ENV=production, DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, SESSION_SECRET, GOOGLE_APPS_SCRIPT_URL, GOOGLE_APPS_SCRIPT_KEY; para respuestas GOOGLE_SCRIPT_REPLY_ENABLED y GOOGLE_APPS_SCRIPT_REPLY_KEY.
- Puerto: usar PORT asignado por el host.

**No subir .env, claves ni conexiones reales.** No publicar TODO dist/ en un hosting de archivos estáticos porque también contiene el backend compilado. Cloudflare Pages necesita separar el frontend del backend y configurar un origen para las llamadas de API. No reutilizar bases de datos institucionales.

Antes de poner en producción:
- Confirmar correo, teléfono comercial, alcance de atención y contenido de proyectos.
- Aprobar el catálogo y las tarifas propuestas.
- Desplegar Apps Script v2, verificar que GET muestre capabilities.reply_to_customer, configurar DESTINATION_EMAIL correcto, probar notificación y respuesta real antes de activar respuestas.
- Configurar respaldos, monitoreo básico y una política de privacidad accesible.
- Probar panel, permisos, fallos de correo y experiencia móvil; revisar límites gratuitos.

## Seguridad y datos personales

No se publica DPI ni datos confidenciales de clientes. El formulario solicita solo información necesaria para responder. La bandeja requiere una sesión válida, y el envío usa credenciales privadas del servidor. Se eliminaron las credenciales administrativas hardcodeadas; hay que rotar cualquier contraseña usada en la versión anterior.

Las pruebas de compilación e integración con Neon y Google Apps Script deben completarse antes de aprobar la publicación.

## Estado del entorno (29 de octubre de 2026)

- Neon Villabyte, base villabyte en AWS us-east-1, organización plan gratuito: creado.
- Tablas villabyte_cms y villabyte_requests: creadas.
- CMS inicial: 35 servicios, 16 proyectos, contacto comercial confirmado: +502 4131 6765 y jonasvillavicencio845@gmail.com.
- GitHub: Villabyte 2.0 fusionado con main mediante PR #1 el 29 de octubre de 2026.
- Apps Script existente validado por revisión del código, pero su disponibilidad externa no se pudo comprobar aquí; v2 listo en integración y pendiente de actualizar el despliegue y pruebas. Sitio aún sin publicación.
- GitHub Actions reportó fallos sin pasos de ejecución registrados. Aún falta verificar compilación e integración en un entorno de pruebas antes de fusionar.

## Cuentas y despliegue separado

La conexión Render disponible en ChatGPT está autorizada para jalvarado.oga@gmail.com (Jonathan's workspace); NO es una cuenta comercial exclusiva de Villabyte. Se debe abrir una cuenta de Render con el correo comercial o conectar la cuenta nueva en ChatGPT. El servicio Villabyte aún NO está creado en Render. No se debe usar el workspace institucional sin instrucción explícita.

### Google Apps Script: actualización segura

1. Guardar copia del script original en el editor de Apps Script.
2. Pegar la versión completa del archivo integrations/google-apps-script/villabyte-mail-v2.gs en el proyecto correspondiente.
3. Ir a Configuración del proyecto > Propiedades del script y actualizar DESTINATION_EMAIL y las dos claves independientes, sin compartirlas ni subirlas a GitHub.
4. Implementar > Administrar implementaciones > Editar > Nueva versión. Mantener Web App ejecutada por propietario y acceso compatible con solicitudes HTTP del servidor. Conservar el ID y URL de implementación si corresponde.
5. Abrir la URL pública sin el segmento /u/1; comprobar status=online y capabilities.reply_to_customer=true.
6. En Render configurar la URL y las claves únicamente en Environment. Dejar GOOGLE_SCRIPT_REPLY_ENABLED=false hasta probar un correo real desde la bandeja usando la nueva versión.
7. No ejecutar funciones de prueba de correo sin intención expresa de mandar un correo.

La implementación vieja acepta solo alertas al correo fijado en Script Properties. No puede realizar envío directo al cliente desde el CMS, por eso no se habilita esa operación antes de actualizarla. Se debe generar y rotar API_KEY porque el código antiguo contenía una clave de demostración visible.

## Desplegar Villabyte en una cuenta Render independiente

1. Abre https://render.com/deploy?repo=https://github.com/Jhons2004/Villabyte e inicia sesión con la NUEVA cuenta Render comercial, no con la cuenta de DSNC 360.
2. Render detectará render.yaml y solicitará los secretos marcados sync:false: DATABASE_URL desde Neon (proyecto falling-darkness-69465997, base villabyte), ADMIN_PASSWORD (fuerte), GOOGLE_APPS_SCRIPT_KEY y GOOGLE_APPS_SCRIPT_REPLY_KEY. Los secretos no deben copiarse al repositorio.
3. Antes del despliegue, verifica que la Web App de Google Apps Script v2 esté publicada y que su API_KEY y REPLY_API_KEY coincidan con las variables de Render. No uses la clave de ejemplo que aparecía en el código antiguo.
4. El render.yaml despliega en región Virginia, plan gratuito, con build Node.js y actualizaciones automáticas al hacer push en main.
5. Abre la URL gratuita asignada por Render; verifica /api/health, servicios, proyectos, envío de solicitud y correo de respuesta. Activa GOOGLE_SCRIPT_REPLY_ENABLED=true en Render una vez comprobada la versión 2.
6. No confundas un sitio cargando correctamente con una integración completada: prueba que la solicitud llegue a la tabla y a Gmail.

**Limitación del entorno:** el GitHub Actions de este repositorio informa fallos a nivel de inicialización del runner, sin pasos disponibles, por lo que no se confirma compilación por CI. Si Render falla en la compilación, usa el registro de despliegue para corregir el error. No se ha afirmado que el servicio esté publicado.
