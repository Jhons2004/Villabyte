# Villabyte — catálogo, cotizaciones y bandeja de solicitudes

Versión comercial de **VILLABYTE** (Guatemala): landing responsive negra/dorada, catálogo de soporte y desarrollo, precios en quetzales, portafolio y CMS de solicitudes con respuesta por correo.

## Funciones incluidas

- Catálogo de 35 servicios: computadoras, celulares, redes, páginas web, sistemas, bases de datos, IA y asesoría.
- Búsqueda y filtros por categoría, precios desde / por hora / por mes y cotización para repuestos.
- Portafolio con 16 proyectos comprobados por historial o repositorio, diferenciados por etapa.
- Formulario público con servicio, nombre, email, teléfono, descripción y consentimiento.
- Solicitudes persistentes en PostgreSQL y estado nuevo / contactado / en proceso / cerrado.
- Aviso al correo del propietario por Resend API al recibir solicitudes.
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
4. Para correos, configurar RESEND_API_KEY, MAIL_FROM y NOTIFY_EMAIL; usar un remitente verificado con el proveedor.
5. Ejecutar npm install, npm run lint, npm run dev. Abrir http://localhost:3000.
6. Abrir http://localhost:3000/#admin para el panel.

Sin base de datos, el sitio usa un catálogo temporal en memoria durante desarrollo. En producción el formulario rechaza solicitudes si no existe base de datos: **no finge que envió una solicitud**. La notificación por correo es secundaria: primero se guarda en PostgreSQL.

## Publicación (después de las pruebas)

La aplicación integra Vite + Express. Requiere un host Node.js para atender las rutas de API. Se puede publicar completa en Render:
- Build: npm install && npm run build
- Start: npm run start
- Variables privadas: NODE_ENV=production, DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, SESSION_SECRET, RESEND_API_KEY, MAIL_FROM, NOTIFY_EMAIL.
- Puerto: usar PORT asignado por el host.

**No subir .env, claves ni conexiones reales.** No publicar TODO dist/ en un hosting de archivos estáticos porque también contiene el backend compilado. Cloudflare Pages necesita separar el frontend del backend y configurar un origen para las llamadas de API. No reutilizar bases de datos institucionales.

Antes de poner en producción:
- Confirmar correo, teléfono comercial, alcance de atención y contenido de proyectos.
- Aprobar el catálogo y las tarifas propuestas.
- Verificar dominio/remitente con Resend y probar la notificación y respuesta reales.
- Configurar respaldos, monitoreo básico y una política de privacidad accesible.
- Probar panel, permisos, fallos de correo y experiencia móvil; revisar límites gratuitos.

## Seguridad y datos personales

No se publica DPI ni datos confidenciales de clientes. El formulario solicita solo información necesaria para responder. La bandeja requiere una sesión válida, y el envío usa credenciales privadas del servidor. Se eliminaron las credenciales administrativas hardcodeadas; hay que rotar cualquier contraseña usada en la versión anterior.

Las pruebas de compilación e integración con Neon/Resend deben completarse antes de aprobar la publicación.

## Estado del entorno (29 de octubre de 2026)

- Neon Villabyte, base villabyte en AWS us-east-1, organización plan gratuito: creado.
- Tablas villabyte_cms y villabyte_requests: creadas.
- CMS inicial: 35 servicios, 16 proyectos, contacto comercial aún pendiente de confirmar.
- GitHub: cambios en PR borrador, sin fusionar con main.
- Correo transaccional y despliegue público: todavía sin configurar ni probar.
- GitHub Actions reportó fallos sin pasos de ejecución registrados. Aún falta verificar compilación e integración en un entorno de pruebas antes de fusionar.
