import express, { type Request, type Response, type NextFunction } from "express";
import path from "node:path";
import crypto from "node:crypto";
import { Pool } from "pg";
import { createServer as createViteServer } from "vite";
import { projectSeeds } from "./src/projectSeeds";

const app = express();
app.disable("x-powered-by");
app.use(express.json({limit:"24kb"}));
const PORT = Number(process.env.PORT || 3000);
const production = process.env.NODE_ENV === "production";
const dbUrl = process.env.DATABASE_URL || process.env.NEON_DB_URL || "";
const pool = dbUrl ? new Pool({connectionString:dbUrl,ssl:{rejectUnauthorized:true},max:5}) : null;
let dbReady = false;
type Item = Record<string,any>;
const service=(id:string,category:string,title:string,price:number|null,description:string,unit="servicio")=>({id,category,title,price,description,unit,active:true});
const initial:any={
 config:{
  company_name:"VILLABYTE",
  hero_title:"Tecnología que resuelve. Ingeniería que transforma.",
  hero_subtitle:"Soporte técnico, reparación de equipos y desarrollo de software a medida para personas y empresas en Guatemala.",
  contact_email:"",
  location:"Guatemala · Atención remota y presencial previa coordinación",
  phone:"",
  representative:"Jonatan Abdiel Alvarado Villavicencio",
  representative_role:"Arquitecto de software",
  social_facebook:"",
  social_instagram:""
 },
 services:[
  service("pc-diagnostico","Computadoras","Diagnóstico de PC o laptop",60,"Revisión inicial del equipo y propuesta de solución."),
  service("pc-windows","Computadoras","Instalación o reinstalación de Windows",150,"Instalación, drivers y configuración. Licencia no incluida."),
  service("pc-puesta-punto","Computadoras","Formateo y puesta a punto",220,"Respaldo acordado, sistema, drivers y optimización. Licencias aparte."),
  service("pc-software","Computadoras","Instalación de programas",75,"Instalación de programas compatibles con licencias legítimas."),
  service("pc-virus","Computadoras","Eliminación de malware y optimización",130,"Limpieza lógica y recomendaciones de protección."),
  service("pc-limpieza","Computadoras","Mantenimiento preventivo",150,"Limpieza física y evaluación térmica según el modelo."),
  service("pc-ssd","Computadoras","Instalación de SSD o RAM",120,"Mano de obra; repuestos aparte."),
  service("pc-backup","Computadoras","Respaldo y transferencia de archivos",120,"Transferencia de información accesible y autorizada."),
  service("pc-recuperacion","Computadoras","Recuperación lógica de datos",200,"Sujeta a diagnóstico, sin garantía de recuperación.","desde"),
  service("pc-ensamble","Computadoras","Ensamble y configuración de PC",250,"Ensamble y pruebas; piezas y licencias aparte."),
  service("mov-diagnostico","Celulares","Diagnóstico de celular",60,"Revisión inicial de software y hardware."),
  service("mov-android","Celulares","Reinstalación de firmware oficial Android",150,"Restauración de sistema compatible y autorizada."),
  service("mov-errores","Celulares","Corrección de fallas de software",125,"Errores de inicio, actualizaciones y aplicaciones."),
  service("mov-respaldo","Celulares","Respaldo y migración de información",100,"Transferencia de datos accesibles del titular."),
  service("mov-puerto","Celulares","Reparación de puerto de carga",150,"Mano de obra desde Q150; repuestos aparte.","desde"),
  service("mov-pantalla","Celulares","Cambio de pantalla",null,"Cotización según modelo y repuesto."),
  service("mov-bateria","Celulares","Cambio de batería",null,"Cotización según modelo y repuesto."),
  service("mov-cuenta","Celulares","Ayuda para recuperar cuentas propias",90,"Solo mediante procedimientos oficiales y prueba de titularidad."),
  service("red-wifi","Redes y dispositivos","Configuración Wi-Fi y router",125,"Conectividad doméstica o de oficina."),
  service("red-impresora","Redes y dispositivos","Instalación de impresoras",100,"USB, Wi-Fi o red local."),
  service("red-local","Redes y dispositivos","Red local para oficina",350,"Equipos y cableado aparte.","desde"),
  service("red-camaras","Redes y dispositivos","Configuración cámaras IP / DVR",250,"No incluye equipos ni instalación eléctrica.","desde"),
  service("web-landing","Web y comercio","Landing page para negocio",850,"Página adaptable con servicios y formulario.","desde"),
  service("web-corporativo","Web y comercio","Sitio web corporativo",1800,"Secciones, SEO básico y formulario de contacto.","desde"),
  service("web-tienda","Web y comercio","Tienda en línea",3000,"Catálogo, pedidos y pagos según alcance.","desde"),
  service("web-mantenimiento","Web y comercio","Mantenimiento mensual de sitio",250,"Cambios menores y revisión periódica.","mes"),
  service("web-publicacion","Web y comercio","Dominio y publicación web",200,"Configuración técnica; dominio y hosting aparte.","desde"),
  service("sys-medida","Software empresarial","Sistema a la medida",3500,"Inventarios, clientes, solicitudes y procesos.","desde"),
  service("sys-sheets","Software empresarial","Automatización Excel / Google Sheets",550,"Formularios, Apps Script y reportes.","desde"),
  service("sys-panel","Software empresarial","Dashboard de indicadores",1200,"Paneles para indicadores y datos.","desde"),
  service("sys-api","Software empresarial","Integración de APIs",1800,"Intercambio seguro de datos entre sistemas.","desde"),
  service("sys-db","Software empresarial","Migración y configuración de bases de datos",900,"PostgreSQL, Neon, Supabase y respaldos.","desde"),
  service("sys-ai","Software empresarial","Chatbot con inteligencia artificial",2000,"Asistente sobre documentos y flujos definidos.","desde"),
  service("asesoria","Asesoría","Consultoría técnica personalizada",200,"Asesoría de arquitectura, tecnología y soporte.","hora"),
  service("capacitacion","Asesoría","Capacitación informática",150,"Acompañamiento para usuarios o negocios.","hora")
 ],
 projects:projectSeeds,
 "trusted-clients":[]
};
const memory=JSON.parse(JSON.stringify(initial));
const localRequests:Item[]=[];
async function bootstrap(){
 if(!pool){console.warn("Sin DATABASE_URL: datos de desarrollo en memoria.");return;}
 await pool.query("CREATE TABLE IF NOT EXISTS villabyte_cms(key TEXT PRIMARY KEY,data JSONB NOT NULL)");
 await pool.query("CREATE TABLE IF NOT EXISTS villabyte_requests(id UUID PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL,phone TEXT NOT NULL DEFAULT '',service_id TEXT NOT NULL,service_title TEXT NOT NULL,description TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),status TEXT NOT NULL DEFAULT 'nuevo',email_sent BOOLEAN NOT NULL DEFAULT FALSE,replies JSONB NOT NULL DEFAULT '[]'::jsonb)");
 for(const [key,data] of Object.entries(initial)){await pool.query("INSERT INTO villabyte_cms(key,data) VALUES($1,$2::jsonb) ON CONFLICT(key) DO NOTHING",[key,JSON.stringify(data)]);}
 dbReady=true;
}
async function read(key:string){if(!pool||!dbReady)return memory[key];const r=await pool.query("SELECT data FROM villabyte_cms WHERE key=$1",[key]);return r.rows[0]?.data ?? initial[key];}
async function write(key:string,data:any){if(pool&&dbReady)await pool.query("INSERT INTO villabyte_cms(key,data) VALUES($1,$2::jsonb) ON CONFLICT(key) DO UPDATE SET data=EXCLUDED.data",[key,JSON.stringify(data)]);else if(production)throw Error("Base no configurada");memory[key]=data;}
const str=(x:any,n=500)=>typeof x==="string"?x.trim().slice(0,n):"";
const originOk=(req:Request)=>{const o=req.get("origin");if(!o)return true;try{const x=new URL(o);return x.host===(req.get("x-forwarded-host")||req.get("host"))&&(x.protocol==="https:"||!production);}catch{return false;}};
const sameOrigin=(req:Request,res:Response,next:NextFunction)=>{if(!originOk(req)){res.status(403).json({error:"Origen rechazado"});return;}next();};
const secret=process.env.SESSION_SECRET||"",adminEmail=str(process.env.ADMIN_EMAIL).toLowerCase(),adminPass=process.env.ADMIN_PASSWORD||"",cookieName="villabyte_session",duration=12*60*60*1000;
const cookie=(req:Request)=>{const part=(req.headers.cookie||"").split(";").map(x=>x.trim()).find(x=>x.startsWith(cookieName+"="));return part?part.slice(cookieName.length+1):"";};
function signed(email:string,expiry:number){const payload=Buffer.from(JSON.stringify({email,expiry})).toString("base64url");const sig=crypto.createHmac("sha256",secret).update(payload).digest("base64url");return payload+"."+sig;}
function isAdmin(req:Request){if(secret.length<32||!adminEmail||!adminPass)return false;const parts=cookie(req).split(".");if(parts.length!==2)return false;const sig=crypto.createHmac("sha256",secret).update(parts[0]).digest("base64url");if(sig.length!==parts[1].length||!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(parts[1])))return false;try{const p=JSON.parse(Buffer.from(parts[0],"base64url").toString());return p.email===adminEmail&&p.expiry>Date.now();}catch{return false;}}
const auth=(req:Request,res:Response,next:NextFunction)=>{if(!originOk(req)){res.status(403).json({error:"Origen rechazado"});return;}if(!isAdmin(req)){res.status(401).json({error:"Inicia sesión"});return;}next();};
const limits=new Map<string,{count:number,until:number}>();
const limiter=(req:Request,res:Response,next:NextFunction)=>{const key=(req.ip||"unknown")+req.path;let x=limits.get(key);if(!x||x.until<Date.now())x={count:0,until:Date.now()+3600000};x.count++;limits.set(key,x);if(x.count>(req.path.includes("login")?10:8)){res.status(429).json({error:"Demasiados intentos; vuelve más tarde."});return;}next();};
async function sendEmail(to:string,subject:string,body:string){
 const key=process.env.RESEND_API_KEY,from=process.env.MAIL_FROM;
 if(!key||!from)return false;
 const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({from,to:[to],subject,text:body}),signal:AbortSignal.timeout(12000)});
 if(!r.ok)throw Error("Correo HTTP "+r.status);
 return true;
}
app.get("/api/health",(_req,res)=>res.json({ok:true,database:dbReady,mail_configured:!!(process.env.RESEND_API_KEY&&process.env.MAIL_FROM)}));
for(const key of ["config","services","projects","trusted-clients"])app.get("/api/"+key,async(_req,res)=>{try{res.json(await read(key));}catch{res.status(503).json({error:"Datos no disponibles"});}});
app.post("/api/admin/login",sameOrigin,limiter,(req,res)=>{
 if(!adminEmail||!adminPass||secret.length<32){res.status(503).json({error:"Administrador sin configurar"});return;}
 const email=str(req.body?.email).toLowerCase(),password=str(req.body?.password);
 const eq=(a:string,b:string)=>crypto.timingSafeEqual(crypto.createHash("sha256").update(a).digest(),crypto.createHash("sha256").update(b).digest());
 if(email!==adminEmail||!eq(password,adminPass)){res.status(401).json({error:"Credenciales incorrectas"});return;}
 res.cookie(cookieName,signed(email,Date.now()+duration),{httpOnly:true,secure:production,sameSite:"strict",path:"/",maxAge:duration});
 res.json({success:true,user:{email}});
});
app.get("/api/admin/session",(req,res)=>res.json({authenticated:isAdmin(req)}));
app.post("/api/admin/logout",auth,(_req,res)=>{res.clearCookie(cookieName,{secure:production,sameSite:"strict",path:"/"});res.json({success:true});});
app.put("/api/config",auth,async(req,res)=>{
 try{const old=await read("config"),data={...old};for(const key of ["hero_title","hero_subtitle","contact_email","location","phone","social_facebook","social_instagram"])if(Object.prototype.hasOwnProperty.call(req.body,key))data[key]=str(req.body[key],400);await write("config",data);res.json({success:true,data});}
 catch{res.status(503).json({error:"No fue posible guardar"});}
});
for(const key of ["services","projects","trusted-clients"]){
 app.post("/api/"+key,auth,async(req,res)=>{
  try{const old=await read(key);if(!Array.isArray(old)||old.length>300){res.status(400).json({error:"Límite alcanzado"});return;}const item={...req.body,id:crypto.randomUUID()};if(key==="services"){item.title=str(item.title,110);item.category=str(item.category,100);item.description=str(item.description,550);item.price=item.price===null?null:Number(item.price);if(!item.title||!item.category||(item.price!==null&&(!Number.isFinite(item.price)||item.price<0))){res.status(400).json({error:"Servicio inválido"});return;}}await write(key,[...old,item]);res.status(201).json(item);}
  catch{res.status(503).json({error:"Error al guardar"});}
 });
 app.put("/api/"+key+"/:id",auth,async(req,res)=>{
  try{const old=await read(key),i=old.findIndex((x:Item)=>String(x.id)===req.params.id);if(i<0){res.status(404).json({error:"No encontrado"});return;}const data={...req.body};delete data.id;if(key==="services"){if(data.title!==undefined)data.title=str(data.title,110);if(data.category!==undefined)data.category=str(data.category,100);if(data.description!==undefined)data.description=str(data.description,550);if(data.price!==undefined)data.price=data.price===null?null:Number(data.price);if(data.price!==undefined&&data.price!==null&&(!Number.isFinite(data.price)||data.price<0)){res.status(400).json({error:"Precio inválido"});return;}}old[i]={...old[i],...data};await write(key,old);res.json(old[i]);}
  catch{res.status(503).json({error:"Error al actualizar"});}
 });
 app.delete("/api/"+key+"/:id",auth,async(req,res)=>{
  try{const old=await read(key),data=old.filter((x:Item)=>String(x.id)!==req.params.id);if(data.length===old.length){res.status(404).json({error:"No encontrado"});return;}await write(key,data);res.json({success:true});}
  catch{res.status(503).json({error:"No fue posible eliminar"});}
 });
}
app.post("/api/requests",sameOrigin,limiter,async(req,res)=>{
 try{
  if(production&&!dbReady){res.status(503).json({error:"Solicitudes temporalmente no disponibles"});return;}
  if(req.body?.website){res.json({ok:true});return;}
  const name=str(req.body?.name,100),email=str(req.body?.email,150).toLowerCase(),phone=str(req.body?.phone,40),service_id=str(req.body?.service_id,120),description=str(req.body?.description,2000);
  if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!description||req.body?.accepted!==true){res.status(400).json({error:"Completa los campos y acepta la privacidad"});return;}
  const selected=(await read("services")).find((x:Item)=>x.id===service_id&&x.active!==false);
  if(!selected){res.status(400).json({error:"Elige un servicio válido"});return;}
  const request={id:crypto.randomUUID(),name,email,phone,service_id,service_title:selected.title,description,created_at:new Date().toISOString(),status:"nuevo",email_sent:false,replies:[]};
  if(pool&&dbReady)await pool.query("INSERT INTO villabyte_requests(id,name,email,phone,service_id,service_title,description,created_at,status,email_sent,replies) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,FALSE,'[]'::jsonb)",[request.id,name,email,phone,service_id,selected.title,description,request.created_at,"nuevo"]);
  else localRequests.unshift(request);
  const owner=process.env.NOTIFY_EMAIL;
  if(owner){try{request.email_sent=await sendEmail(owner,"Villabyte: solicitud "+request.id.slice(0,8),"Servicio: "+selected.title+"\nCliente: "+name+"\nCorreo: "+email+"\nTeléfono: "+phone+"\nDetalles: "+description+"\n\nContesta desde la bandeja de Villabyte.");if(request.email_sent&&pool&&dbReady)await pool.query("UPDATE villabyte_requests SET email_sent=TRUE WHERE id=$1",[request.id]);}catch(e){console.error("Correo de aviso no enviado",e);}}
  res.status(201).json({ok:true,id:request.id,notified:request.email_sent});
 }catch(e){console.error("Error registrando solicitud",e);res.status(503).json({error:"No pudimos registrar la solicitud"});}
});
app.get("/api/admin/requests",auth,async(_req,res)=>{try{res.json(pool&&dbReady?(await pool.query("SELECT * FROM villabyte_requests ORDER BY created_at DESC LIMIT 250")).rows:localRequests);}catch{res.status(503).json({error:"Bandeja no disponible"});}});
app.patch("/api/admin/requests/:id",auth,async(req,res)=>{
 const status=str(req.body?.status);if(!["nuevo","contactado","en_proceso","cerrado"].includes(status)){res.status(400).json({error:"Estado inválido"});return;}
 try{if(pool&&dbReady){const r=await pool.query("UPDATE villabyte_requests SET status=$1 WHERE id=$2 RETURNING *",[status,req.params.id]);if(!r.rows.length){res.status(404).json({error:"No encontrado"});return;}res.json(r.rows[0]);}else{const x=localRequests.find(x=>x.id===req.params.id);if(!x){res.status(404).json({error:"No encontrado"});return;}x.status=status;res.json(x);}}catch{res.status(503).json({error:"Error al actualizar"});}
});
app.post("/api/admin/requests/:id/reply",auth,limiter,async(req,res)=>{
 const message=str(req.body?.message,4000);if(message.length<10){res.status(400).json({error:"La respuesta es demasiado corta"});return;}
 try{
  const x=pool&&dbReady?(await pool.query("SELECT * FROM villabyte_requests WHERE id=$1",[req.params.id])).rows[0]:localRequests.find(x=>x.id===req.params.id);
  if(!x){res.status(404).json({error:"No encontrado"});return;}
  const sent=await sendEmail(x.email,"Respuesta de Villabyte a tu solicitud",message);
  if(!sent){res.status(503).json({error:"Falta configurar RESEND_API_KEY y MAIL_FROM"});return;}
  const replies=[...(x.replies||[]),{date:new Date().toISOString(),text:message,sent:true}];
  if(pool&&dbReady)await pool.query("UPDATE villabyte_requests SET replies=$1::jsonb,status='contactado' WHERE id=$2",[JSON.stringify(replies),req.params.id]);
  else{x.replies=replies;x.status="contactado";}
  res.json({success:true});
 }catch(e){console.error("Fallo en respuesta",e);res.status(503).json({error:"No se pudo enviar el correo; no se marcó como enviado."});}
});
async function start(){
 try{await bootstrap();}catch(e){console.error("PostgreSQL no disponible",e);}
 if(!production){const vite=await createViteServer({server:{middlewareMode:true},appType:"spa"});app.use(vite.middlewares);}
 else{const dist=path.resolve(process.cwd(),"dist");app.use(express.static(dist));app.get("*all",(_req,res)=>res.sendFile(path.join(dist,"index.html")));}
 app.listen(PORT,"0.0.0.0",()=>console.log("Villabyte listening on "+PORT));
}
start();
