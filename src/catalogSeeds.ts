// VILLABYTE - fallback public catalog if the external database is temporarily unavailable.
// Real edits and prices in production are managed from the Neon CMS.
export const serviceSeeds = [
  {
    "id": "pc-diagnostico",
    "category": "Computadoras",
    "title": "Diagnóstico de PC o laptop",
    "price": 60,
    "description": "Revisión inicial del equipo y propuesta de solución.",
    "unit": "servicio",
    "active": true
  },
  {
    "id": "pc-windows",
    "category": "Computadoras",
    "title": "Instalación o reinstalación de Windows",
    "price": 150,
    "description": "Instalación, drivers y configuración. Licencia no incluida.",
    "unit": "servicio",
    "active": true
  },
  {
    "id": "pc-puesta-punto",
    "category": "Computadoras",
    "title": "Formateo y puesta a punto",
    "price": 220,
    "description": "Respaldo acordado, sistema, drivers y optimización. Licencias aparte.",
    "unit": "servicio",
    "active": true
  },
  {
    "id": "pc-software",
    "category": "Computadoras",
    "title": "Instalación de programas",
    "price": 75,
    "description": "Instalación de programas compatibles con licencias legítimas.",
    "unit": "servicio",
    "active": true
  },
  {
    "id": "pc-virus",
    "category": "Computadoras",
    "title": "Eliminación de malware y optimización",
    "price": 130,
    "description": "Limpieza lógica y recomendaciones de protección.",
    "unit": "servicio",
    "active": true
  },
  {
    "id": "pc-limpieza",
    "category": "Computadoras",
    "title": "Mantenimiento preventivo",
    "price": 150,
    "description": "Limpieza física y evaluación térmica según el modelo.",
    "unit": "servicio",
    "active": true
  },
  {
    "id": "pc-ssd",
    "category": "Computadoras",
    "title": "Instalación de SSD o RAM",
    "price": 120,
    "description": "Mano de obra; repuestos aparte.",
    "unit": "servicio",
    "active": true
  },
  {
    "id": "pc-backup",
    "category": "Computadoras",
    "title": "Respaldo y transferencia de archivos",
    "price": 120,
    "description": "Transferencia de información accesible y autorizada.",
    "unit": "servicio",
    "active": true
  },
  {
    "id": "pc-recuperacion",
    "category": "Computadoras",
    "title": "Recuperación lógica de datos",
    "price": 200,
    "description": "Sujeta a diagnóstico, sin garantía de recuperación.",
    "unit": "desde",
    "active": true
  },
  {
    "id": "pc-ensamble",
    "category": "Computadoras",
    "title": "Ensamble y configuración de PC",
    "price": 250,
    "description": "Ensamble y pruebas; piezas y licencias aparte.",
    "unit": "servicio",
    "active": true
  },
  {
    "id": "mov-diagnostico",
    "category": "Celulares",
    "title": "Diagnóstico de celular",
    "price": 60,
    "description": "Revisión inicial de software y hardware.",
    "unit": "servicio",
    "active": true
  },
  {
    "id": "mov-android",
    "category": "Celulares",
    "title": "Reinstalación de firmware oficial Android",
    "price": 150,
    "description": "Restauración de sistema compatible y autorizada.",
    "unit": "servicio",
    "active": true
  },
  {
    "id": "mov-errores",
    "category": "Celulares",
    "title": "Corrección de fallas de software",
    "price": 125,
    "description": "Errores de inicio, actualizaciones y aplicaciones.",
    "unit": "servicio",
    "active": true
  },
  {
    "id": "mov-respaldo",
    "category": "Celulares",
    "title": "Respaldo y migración de información",
    "price": 100,
    "description": "Transferencia de datos accesibles del titular.",
    "unit": "servicio",
    "active": true
  },
  {
    "id": "mov-puerto",
    "category": "Celulares",
    "title": "Reparación de puerto de carga",
    "price": 150,
    "description": "Mano de obra desde Q150; repuestos aparte.",
    "unit": "desde",
    "active": true
  },
  {
    "id": "mov-pantalla",
    "category": "Celulares",
    "title": "Cambio de pantalla",
    "price": null,
    "description": "Cotización según modelo y repuesto.",
    "unit": "servicio",
    "active": true
  },
  {
    "id": "mov-bateria",
    "category": "Celulares",
    "title": "Cambio de batería",
    "price": null,
    "description": "Cotización según modelo y repuesto.",
    "unit": "servicio",
    "active": true
  },
  {
    "id": "mov-cuenta",
    "category": "Celulares",
    "title": "Ayuda para recuperar cuentas propias",
    "price": 90,
    "description": "Solo mediante procedimientos oficiales y prueba de titularidad.",
    "unit": "servicio",
    "active": true
  },
  {
    "id": "red-wifi",
    "category": "Redes y dispositivos",
    "title": "Configuración Wi-Fi y router",
    "price": 125,
    "description": "Conectividad doméstica o de oficina.",
    "unit": "servicio",
    "active": true
  },
  {
    "id": "red-impresora",
    "category": "Redes y dispositivos",
    "title": "Instalación de impresoras",
    "price": 100,
    "description": "USB, Wi-Fi o red local.",
    "unit": "servicio",
    "active": true
  },
  {
    "id": "red-local",
    "category": "Redes y dispositivos",
    "title": "Red local para oficina",
    "price": 350,
    "description": "Equipos y cableado aparte.",
    "unit": "desde",
    "active": true
  },
  {
    "id": "red-camaras",
    "category": "Redes y dispositivos",
    "title": "Configuración cámaras IP / DVR",
    "price": 250,
    "description": "No incluye equipos ni instalación eléctrica.",
    "unit": "desde",
    "active": true
  },
  {
    "id": "web-landing",
    "category": "Web y comercio",
    "title": "Landing page para negocio",
    "price": 850,
    "description": "Página adaptable con servicios y formulario.",
    "unit": "desde",
    "active": true
  },
  {
    "id": "web-corporativo",
    "category": "Web y comercio",
    "title": "Sitio web corporativo",
    "price": 1800,
    "description": "Secciones, SEO básico y formulario de contacto.",
    "unit": "desde",
    "active": true
  },
  {
    "id": "web-tienda",
    "category": "Web y comercio",
    "title": "Tienda en línea",
    "price": 3000,
    "description": "Catálogo, pedidos y pagos según alcance.",
    "unit": "desde",
    "active": true
  },
  {
    "id": "web-mantenimiento",
    "category": "Web y comercio",
    "title": "Mantenimiento mensual de sitio",
    "price": 250,
    "description": "Cambios menores y revisión periódica.",
    "unit": "mes",
    "active": true
  },
  {
    "id": "web-publicacion",
    "category": "Web y comercio",
    "title": "Dominio y publicación web",
    "price": 200,
    "description": "Configuración técnica; dominio y hosting aparte.",
    "unit": "desde",
    "active": true
  },
  {
    "id": "sys-medida",
    "category": "Software empresarial",
    "title": "Sistema a la medida",
    "price": 3500,
    "description": "Inventarios, clientes, solicitudes y procesos.",
    "unit": "desde",
    "active": true
  },
  {
    "id": "sys-sheets",
    "category": "Software empresarial",
    "title": "Automatización Excel / Google Sheets",
    "price": 550,
    "description": "Formularios, Apps Script y reportes.",
    "unit": "desde",
    "active": true
  },
  {
    "id": "sys-panel",
    "category": "Software empresarial",
    "title": "Dashboard de indicadores",
    "price": 1200,
    "description": "Paneles para indicadores y datos.",
    "unit": "desde",
    "active": true
  },
  {
    "id": "sys-api",
    "category": "Software empresarial",
    "title": "Integración de APIs",
    "price": 1800,
    "description": "Intercambio seguro de datos entre sistemas.",
    "unit": "desde",
    "active": true
  },
  {
    "id": "sys-db",
    "category": "Software empresarial",
    "title": "Migración y configuración de bases de datos",
    "price": 900,
    "description": "PostgreSQL, Neon, Supabase y respaldos.",
    "unit": "desde",
    "active": true
  },
  {
    "id": "sys-ai",
    "category": "Software empresarial",
    "title": "Chatbot con inteligencia artificial",
    "price": 2000,
    "description": "Asistente sobre documentos y flujos definidos.",
    "unit": "desde",
    "active": true
  },
  {
    "id": "asesoria",
    "category": "Asesoría",
    "title": "Consultoría técnica personalizada",
    "price": 200,
    "description": "Asesoría de arquitectura, tecnología y soporte.",
    "unit": "hora",
    "active": true
  },
  {
    "id": "capacitacion",
    "category": "Asesoría",
    "title": "Capacitación informática",
    "price": 150,
    "description": "Acompañamiento para usuarios o negocios.",
    "unit": "hora",
    "active": true
  }
];
