import React, { useEffect, useMemo, useRef, useState } from "react";
import { serviceSeeds } from "./catalogSeeds";
import { projectSeeds } from "./projectSeeds";
import { ArrowRight, ArrowUpRight, Bot, Check, Code2, Database, ExternalLink, Github, Globe2, Laptop, LockKeyhole, Mail, MapPin, Menu, MessageCircle, MonitorCog, Network, Search, Send, ShieldCheck, Smartphone, Wrench, X } from "lucide-react";

type Service={id:string;category:string;title:string;price:number|null;description:string;unit:string;active:boolean};
type Config={company_name:string;hero_title:string;hero_subtitle:string;contact_email:string;location:string;phone:string;representative:string;representative_role:string;social_facebook?:string;social_instagram?:string};
type Project={id:string;title:string;client:string;description:string;technologies:string[];status:string;stage?:string;live_url?:string;images?:string[]};
type RequestImage={id:string;filename:string;content_type:string;byte_size:number};
type RequestItem={id:string;name:string;email:string;phone:string;service_id:string;service_title:string;description:string;status:string;created_at:string;email_sent:boolean;notification_attempts?:number;last_notification_error?:string|null;attachments?:RequestImage[];replies:{date:string;text:string;sent:boolean}[]};
type MailStatus={mail_configured:boolean;notifications_ready:boolean;reply_configured:boolean;script_online:boolean;script_version:string;reason:string;missing_reply_key:boolean;reply_enabled:boolean};
const baseConfig:Config={company_name:"VILLABYTE",hero_title:"Tecnología que resuelve. Ingeniería que transforma.",hero_subtitle:"Soporte técnico y software a medida para personas y empresas.",contact_email:"jonasvillavicencio845@gmail.com",phone:"+502 4131 6765",location:"Guatemala",representative:"Jonatan Abdiel Alvarado Villavicencio",representative_role:"Arquitecto de software"};
const categories=["Todos","Computadoras","Celulares","Redes y dispositivos","Web y comercio","Software empresarial","Asesoría"];
const categoryIcon=(c:string)=>{
 if(c==="Computadoras")return <Laptop size={21}/>;
 if(c==="Celulares")return <Smartphone size={21}/>;
 if(c==="Redes y dispositivos")return <Network size={21}/>;
 if(c==="Web y comercio")return <Globe2 size={21}/>;
 if(c==="Software empresarial")return <Database size={21}/>;
 return <Bot size={21}/>;
};
const money=(s:Service)=>s.price===null?"Cotizar":(s.unit==="desde"?"Desde ":"")+"Q"+Number(s.price).toLocaleString("es-GT")+(s.unit==="mes"?"/mes":s.unit==="hora"?"/hora":"");
async function api(url:string,options?:RequestInit){
 const response=await fetch(url,{credentials:"same-origin",...options,headers:{"Content-Type":"application/json",...(options?.headers||{})}});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.error||"No se pudo completar la operación");
 return data;
}
export default function App(){
 const [config,setConfig]=useState<Config>(baseConfig),[services,setServices]=useState<Service[]>(serviceSeeds),[projects,setProjects]=useState<Project[]>(projectSeeds);
 const [section,setSection]=useState("Todos"),[search,setSearch]=useState(""),[serviceId,setServiceId]=useState("");
 const [adminView,setAdminView]=useState(window.location.hash==="#admin");
 const [authenticated,setAuthenticated]=useState(false),[email,setEmail]=useState("jonasvillavicencio845@gmail.com"),[password,setPassword]=useState("");
 const [adminUser,setAdminUser]=useState<{email:string;role:string}|null>(null);
 const [loginMessage,setLoginMessage]=useState(""),[notice,setNotice]=useState(""),[saving,setSaving]=useState(false);
 const [requests,setRequests]=useState<RequestItem[]>([]),[tab,setTab]=useState<"inbox"|"catalog"|"config"|"projects">("inbox"),[replyText,setReplyText]=useState<Record<string,string>>({});
 const [draft,setDraft]=useState({name:"",email:"",phone:"",description:"",accepted:false,website:""});
 const [photos,setPhotos]=useState<File[]>([]);
 const [photoPreviews,setPhotoPreviews]=useState<{name:string;url:string}[]>([]);
 const [uploadsEnabled,setUploadsEnabled]=useState(false);
 const photoInputRef=useRef<HTMLInputElement>(null);
 useEffect(()=>{
  const previews=photos.map(file=>({name:file.name,url:URL.createObjectURL(file)}));
  setPhotoPreviews(previews);
  return ()=>previews.forEach(p=>URL.revokeObjectURL(p.url));
 },[photos]);
 const changePhotos=(files:FileList|null)=>{
  if(!files){setPhotos([]);return;}
  const next=Array.from(files);
  if(next.length>3){setNotice("Puedes adjuntar como máximo 3 imágenes.");setPhotos([]);return;}
  if(next.some(file=>!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size===0||file.size>3*1024*1024)){
   setNotice("Solo JPG, PNG o WebP de máximo 3 MB por imagen.");setPhotos([]);return;
  }
  setNotice("");setPhotos(next);
 };
 const [newService,setNewService]=useState({title:"",category:"Computadoras",price:"",description:""});
 const [newProject,setNewProject]=useState({title:"",client:"Proyecto técnico",description:"",technologies:"",status:"Proyecto técnico",live_url:""});
 const [menuOpen,setMenuOpen]=useState(false);
 const [projectStage,setProjectStage]=useState("Todos");
 const [mailer,setMailer]=useState({mail_configured:false,reply_configured:false});
 const [mailStatus,setMailStatus]=useState<MailStatus|null>(null);
 const [mailBusy,setMailBusy]=useState<string|null>(null);
 const refresh=async()=>{
  const [c,s,p]=await Promise.all([api("/api/config"),api("/api/services"),api("/api/projects")]);
  setConfig(c);setServices(Array.isArray(s)?s:[]);setProjects(Array.isArray(p)?p:[]);
 };
 const loadInbox=async()=>{try{const items=await api("/api/admin/requests");setRequests(items);}catch(e:any){setNotice(e.message);}};
 const refreshMail=async()=>{try{const status=await api("/api/admin/mail-status") as MailStatus;setMailStatus(status);setMailer({mail_configured:status.mail_configured,reply_configured:status.reply_configured});}catch(e:any){setMailStatus(null);setMailer({mail_configured:false,reply_configured:false});setNotice("No se pudo verificar la integración de correo: "+e.message);}};
 useEffect(()=>{refresh().catch(()=>setNotice("No se pudo cargar el catálogo. Revisa la conexión."));api("/api/attachments/config").then(x=>setUploadsEnabled(!!x.enabled)).catch(()=>setUploadsEnabled(false));api("/api/admin/session").then(d=>{setAuthenticated(!!d.authenticated);setAdminUser(d.user||null);}).catch(()=>{});const hash=()=>setAdminView(window.location.hash==="#admin");window.addEventListener("hashchange",hash);return()=>window.removeEventListener("hashchange",hash);},[]);
 useEffect(()=>{if(adminView&&authenticated){loadInbox();refreshMail();}},[adminView,authenticated]);
 const visible=useMemo(()=>services.filter(s=>s.active!==false&&(section==="Todos"||s.category===section)&&(s.title+" "+s.description).toLowerCase().includes(search.toLowerCase())),[services,section,search]);
 const visibleProjects=useMemo(()=>projects.filter(p=>projectStage==="Todos"||(p.stage||"Prototipo")===projectStage),[projects,projectStage]);
 const selectService=(id:string)=>{setServiceId(id);setAdminView(false);window.location.hash="";setTimeout(()=>document.getElementById("solicitar")?.scrollIntoView({behavior:"smooth"}),40);};
 const whatsappDigits=(config.phone||"").replace(/\D/g,"");
 const whatsapp=whatsappDigits.length>=8?"https://wa.me/"+(whatsappDigits.startsWith("502")?whatsappDigits:"502"+whatsappDigits)+"?text="+encodeURIComponent("Hola, quiero cotizar un servicio de Villabyte."):"";
 const sendRequest=async(e:React.FormEvent)=>{
  e.preventDefault();setSaving(true);setNotice("");
  try{
   let result;
   if(photos.length){
    const multipart=new FormData();
    Object.entries({...draft,service_id:serviceId}).forEach(([k,v])=>multipart.append(k,String(v)));
    photos.forEach(file=>multipart.append("images",file,file.name));
    const response=await fetch("/api/requests",{method:"POST",credentials:"same-origin",body:multipart});
    result=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(result.error||"No se pudo adjuntar las imágenes");
   }else{
    result=await api("/api/requests",{method:"POST",body:JSON.stringify({...draft,service_id:serviceId})});
   }
   setNotice("Solicitud registrada con número "+result.id.slice(0,8)+". "+(result.image_count?"Se adjuntaron "+result.image_count+" imagen(es). ":"")+(result.notified?"La notificación fue enviada.":"La solicitud quedó registrada para seguimiento."));
   setDraft({name:"",email:"",phone:"",description:"",accepted:false,website:""});setServiceId("");setPhotos([]);
   if(photoInputRef.current)photoInputRef.current.value="";
  }catch(e:any){setNotice(e.message);}finally{setSaving(false);}
 };
 const login=async(e:React.FormEvent)=>{e.preventDefault();setLoginMessage("");try{const result=await api("/api/admin/login",{method:"POST",body:JSON.stringify({email,password})});setAuthenticated(true);setAdminUser(result.user||null);setPassword("");setNotice("");}catch(e:any){setLoginMessage(e.message);}};
 const logout=async()=>{await api("/api/admin/logout",{method:"POST"}).catch(()=>{});setAuthenticated(false);setAdminUser(null);setAdminView(false);window.location.hash="";};
 const updateService=async(s:Service,changes:Partial<Service>)=>{try{const v=await api("/api/services/"+encodeURIComponent(s.id),{method:"PUT",body:JSON.stringify(changes)});setServices(a=>a.map(x=>x.id===s.id?v:x));setNotice("Servicio actualizado.");}catch(e:any){setNotice(e.message);}};
 const addService=async(e:React.FormEvent)=>{e.preventDefault();try{const item=await api("/api/services",{method:"POST",body:JSON.stringify({title:newService.title,category:newService.category,description:newService.description,price:newService.price===""?null:Number(newService.price),unit:"servicio",active:true})});setServices(a=>[...a,item]);setNewService({title:"",category:"Computadoras",price:"",description:""});setNotice("Servicio agregado.");}catch(e:any){setNotice(e.message);}};
 const deleteService=async(s:Service)=>{if(!window.confirm("¿Eliminar "+s.title+"?"))return;try{await api("/api/services/"+s.id,{method:"DELETE"});setServices(a=>a.filter(x=>x.id!==s.id));}catch(e:any){setNotice(e.message);}};
 const updateConfig=async(e:React.FormEvent)=>{e.preventDefault();try{const r=await api("/api/config",{method:"PUT",body:JSON.stringify(config)});setConfig(r.data);setNotice("Información comercial actualizada.");}catch(e:any){setNotice(e.message);}};
 const addProject=async(e:React.FormEvent)=>{e.preventDefault();try{const p=await api("/api/projects",{method:"POST",body:JSON.stringify({...newProject,technologies:newProject.technologies.split(",").map(x=>x.trim()).filter(Boolean),images:[]})});setProjects(a=>[...a,p]);setNewProject({title:"",client:"Proyecto técnico",description:"",technologies:"",status:"Proyecto técnico",live_url:""});setNotice("Proyecto agregado.");}catch(e:any){setNotice(e.message);}};
 const deleteProject=async(id:string)=>{if(!window.confirm("¿Eliminar proyecto?"))return;try{await api("/api/projects/"+id,{method:"DELETE"});setProjects(a=>a.filter(x=>x.id!==id));}catch(e:any){setNotice(e.message);}};
 const updateStatus=async(r:RequestItem,status:string)=>{try{await api("/api/admin/requests/"+r.id,{method:"PATCH",body:JSON.stringify({status})});await loadInbox();}catch(e:any){setNotice(e.message);}};
 const sendReply=async(r:RequestItem)=>{
  const message=(replyText[r.id]||"").trim();
  if(message.length<10){setNotice("La respuesta debe contener al menos 10 caracteres.");return;}
  setMailBusy("reply:"+r.id);setNotice("");
  try{await api("/api/admin/requests/"+r.id+"/reply",{method:"POST",body:JSON.stringify({message})});setReplyText(a=>({...a,[r.id]:""}));setNotice("Respuesta enviada a "+r.email+" y registrada en Neon.");await loadInbox();}
  catch(e:any){setNotice("No se confirmó el envío a "+r.email+": "+e.message+". Revisa el correo antes de intentar nuevamente.");}
  finally{setMailBusy(null);}
 };
 const testMailEndpoint=async()=>{
  setMailBusy("test");setNotice("");
  try{
   const response=await api("/api/admin/mail-test",{method:"POST"});
   setNotice("Prueba aceptada por el endpoint de Google. Referencia "+response.reference+". Verifica la bandeja y carpeta de spam del correo configurado en Apps Script. Esta prueba no registra una solicitud de cliente.");
   await refreshMail();
  }catch(e:any){
   setNotice("Falló la prueba real de correo: "+e.message);
  }finally{setMailBusy(null);}
 };
 const retryNotification=async(r:RequestItem)=>{
  setMailBusy("notify:"+r.id);setNotice("");
  try{const outcome=await api("/api/admin/requests/"+r.id+"/notify",{method:"POST"});setNotice(outcome.already_sent?"Ese aviso ya estaba marcado como enviado.":"Notificación enviada a la dirección comercial configurada en Google Apps Script.");await loadInbox();}
  catch(e:any){setNotice("No se pudo confirmar la notificación: "+e.message);}
  finally{setMailBusy(null);}
 };
 const href=(id:string)=>{setMenuOpen(false);document.getElementById(id)?.scrollIntoView({behavior:"smooth"});};
 const publicNav=()=>{setAdminView(false);window.location.hash="";};
 return <div className="vb-root">
  {!adminView?
  <>
   <header className="vb-topbar">
    <div className="vb-container vb-nav">
     <a href="#inicio" className="vb-brand" aria-label="Villabyte inicio"><span className="vb-logo">V</span><span>VILLA<span className="vb-gold">BYTE</span></span></a>
     <nav className={menuOpen?"vb-links open":"vb-links"} aria-label="Navegación principal">
      <button onClick={()=>href("servicios")}>Servicios</button><button onClick={()=>href("proyectos")}>Proyectos</button><button onClick={()=>href("nosotros")}>Nosotros</button><button onClick={()=>href("solicitar")}>Solicitar servicio</button>
     </nav>
     <button className="vb-menu-button" onClick={()=>setMenuOpen(v=>!v)} aria-label="Abrir menú">{menuOpen?<X/>:<Menu/>}</button>
     <button className="vb-nav-contact" onClick={()=>href("solicitar")}>Cotizar <ArrowUpRight size={15}/></button>
    </div>
   </header>
   <main>
    <section id="inicio" className="vb-hero">
     <div className="vb-container vb-hero-inner">
      <div className="vb-hero-copy">
       <div className="vb-kicker"><span className="vb-spark"/>VILLABYTE · GUATEMALA</div>
       <h1>Soluciones digitales <em>que funcionan.</em></h1>
       <p>{config.hero_subtitle}</p>
       <div className="vb-hero-actions"><button className="vb-button vb-primary" onClick={()=>href("servicios")}>Explorar servicios <ArrowUpRight size={17}/></button><button className="vb-button vb-outline" onClick={()=>href("solicitar")}>Solicitar cotización <ArrowRight size={17}/></button></div>
       <div className="vb-hero-note"><ShieldCheck size={17}/> Soporte técnico, ingeniería y atención personalizada</div>
      </div>
      <div className="vb-hero-art" aria-hidden="true">
       <div className="vb-hero-art-shadow"></div>
       <svg viewBox="0 0 550 460" fill="none" className="vb-wave">
        <defs><linearGradient id="goldwave" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a57931" stopOpacity=".05"/><stop offset=".5" stopColor="#f9d89b" stopOpacity=".86"/><stop offset="1" stopColor="#ad7933" stopOpacity=".12"/></linearGradient></defs>
        {Array.from({length:18},(_,i)=><path key={i} d={"M -25 "+(120+i*10)+" C 150 "+(-95+i*11)+" 205 "+(455-i*7)+" 560 "+(70+i*8)} stroke="url(#goldwave)" strokeWidth={i%5===0?1.7:.8} opacity={.45+i*.023}/>)}
       </svg>
       <div className="vb-art-badge"><Code2 size={24}/><span>SOFTWARE<br/><strong>A MEDIDA</strong></span></div>
       <div className="vb-art-card"><div className="vb-card-top"><span className="vb-spark"/> DIGITAL ENGINEERING <ArrowUpRight size={13}/></div><span className="vb-art-card-title">Diseñamos.<br/>Desarrollamos.<br/><em>Resolvemos.</em></span><div className="vb-art-rule"/><span className="vb-art-card-foot">VILLABYTE / EST. GUATEMALA</span></div>
      </div>
     </div>
     <div className="vb-container vb-trust-strip"><span><MonitorCog size={17}/> Soporte y reparación</span><span><Code2 size={17}/> Desarrollo de software</span><span><Database size={17}/> Bases de datos y automatización</span></div>
    </section>
    <section id="servicios" className="vb-section vb-services">
     <div className="vb-container">
      <div className="vb-heading"><span className="vb-eyebrow">01 / CATÁLOGO</span><h2>Servicios para cada <em>necesidad.</em></h2><p>Desde instalar un programa hasta construir un sistema empresarial. Selecciona tu servicio y solicita una evaluación.</p></div>
      <div className="vb-filter-row"><div className="vb-categories">{categories.map(c=><button key={c} className={section===c?"active":""} onClick={()=>setSection(c)}>{c}</button>)}</div><label className="vb-search"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar servicio..." aria-label="Buscar servicio"/></label></div>
      <div className="vb-service-grid">{visible.map(s=><article className="vb-service-card" key={s.id}><div className="vb-service-top"><span className="vb-service-icon">{categoryIcon(s.category)}</span><span className="vb-price">{money(s)}</span></div><span className="vb-service-category">{s.category}</span><h3>{s.title}</h3><p>{s.description}</p><button onClick={()=>selectService(s.id)}>Solicitar servicio <ArrowUpRight size={16}/></button></article>)}</div>
      {visible.length===0&&<p className="vb-empty">No encontramos servicios que coincidan con tu búsqueda.</p>}
      <p className="vb-pricing-note">Precios iniciales referenciales en quetzales. El presupuesto definitivo depende de diagnóstico, alcance, repuestos, licencias y desplazamiento. Solo se instala software con licencias válidas.</p>
     </div>
    </section>
    <section className="vb-statement"><div className="vb-container vb-statement-inner"><span className="vb-eyebrow">TUS IDEAS. NUESTRA INGENIERÍA.</span><h2>No vendemos soluciones genéricas. <em>Resolvemos problemas reales.</em></h2><button onClick={()=>href("solicitar")} className="vb-button vb-primary">Hablemos de tu proyecto <ArrowUpRight size={16}/></button></div></section>
    <section id="proyectos" className="vb-section vb-projects"><div className="vb-container"><div className="vb-heading"><span className="vb-eyebrow">02 / EXPERIENCIA</span><h2>Proyectos con <em>propósito.</em></h2><p>Una selección de trabajos de ingeniería y proyectos técnicos. Los detalles públicos se presentan sin información confidencial.</p></div><div className="vb-project-filters">{["Todos","En curso","En pruebas","Prototipo","Académico","Planificado"].map(t=><button key={t} className={projectStage===t?"active":""} onClick={()=>setProjectStage(t)}>{t}</button>)}<span>{visibleProjects.length} proyectos</span></div><div className="vb-project-grid">{visibleProjects.map((p,i)=><article key={p.id} className="vb-project-card"><div className="vb-project-cover"><span className="vb-project-index">0{i+1}</span><span className="vb-project-mark"><Code2 size={46}/></span><span className="vb-project-category">{p.status||"Proyecto técnico"}</span></div><div className="vb-project-content"><h3>{p.title}</h3><p>{p.description}</p><div className="vb-tech">{(p.technologies||[]).map(x=><span key={x}>{x}</span>)}</div>{p.live_url&&<a href={p.live_url} target="_blank" rel="noreferrer">Ver proyecto <ExternalLink size={15}/></a>}</div></article>)}</div></div></section>
    <section id="nosotros" className="vb-section vb-about"><div className="vb-container vb-about-layout"><div><span className="vb-eyebrow">03 / QUIÉNES SOMOS</span><h2>La tecnología merece <em>hacerte la vida más fácil.</em></h2></div><div><p>Villabyte combina ingeniería de software, reparación de equipos y asistencia tecnológica para acompañarte desde una falla cotidiana hasta el desarrollo de una plataforma empresarial.</p><div className="vb-founder"><span className="vb-founder-icon">V</span><div><strong>{config.representative}</strong><span>{config.representative_role} · Villabyte</span></div></div><a className="vb-github" href="https://github.com/Jhons2004" target="_blank" rel="noreferrer"><Github size={17}/> Ver proyectos en GitHub <ArrowUpRight size={15}/></a></div></div></section>
    <section id="solicitar" className="vb-section vb-contact"><div className="vb-container vb-contact-layout"><div className="vb-contact-info"><span className="vb-eyebrow">04 / CONTACTO</span><h2>Cuéntanos qué <em>necesitas.</em></h2><p>Envíanos tu solicitud con los detalles de tu equipo o proyecto. La revisaremos y podrás recibir una respuesta por correo electrónico.</p><div className="vb-contact-lines"><div><MapPin size={19}/><span>{config.location||"Guatemala"}</span></div>{config.contact_email&&<a href={"mailto:"+config.contact_email}><Mail size={19}/><span>{config.contact_email}</span></a>}{whatsapp&&<a target="_blank" rel="noreferrer" href={whatsapp}><MessageCircle size={19}/> WhatsApp comercial</a>}</div></div>
     <form className="vb-form" onSubmit={sendRequest}><div className="vb-form-head"><span className="vb-form-pill">NUEVA SOLICITUD</span><span>Todos los campos con * son obligatorios</span></div><div className="vb-form-row"><label>Nombre completo *<input required value={draft.name} maxLength={100} onChange={e=>setDraft(a=>({...a,name:e.target.value}))} placeholder="Tu nombre"/></label><label>Correo electrónico *<input required type="email" maxLength={150} value={draft.email} onChange={e=>setDraft(a=>({...a,email:e.target.value}))} placeholder="tu@correo.com"/></label></div><div className="vb-form-row"><label>Teléfono / WhatsApp<input value={draft.phone} maxLength={40} onChange={e=>setDraft(a=>({...a,phone:e.target.value}))} placeholder="+502 ..."/></label><label>Servicio solicitado *<select value={serviceId} onChange={e=>setServiceId(e.target.value)} required><option value="">Seleccionar servicio</option>{services.filter(s=>s.active!==false).map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select></label></div><label>Describe lo que necesitas *<textarea rows={5} required maxLength={2000} value={draft.description} onChange={e=>setDraft(a=>({...a,description:e.target.value}))} placeholder="Modelo de equipo, fallo observado, ubicación aproximada o requisitos del proyecto..."/></label><div className="vb-attachments-field">
      <label htmlFor="vb-photo-upload">Fotografías del equipo o problema (opcional)</label>
      <p>{uploadsEnabled?"Hasta 3 fotos JPG, PNG o WebP, máximo 3 MB cada una. Solo Villabyte puede consultarlas.":"La recepción de fotos estará disponible cuando se active el almacenamiento privado de Villabyte."}</p>
      <input id="vb-photo-upload" type="file" ref={photoInputRef} accept="image/jpeg,image/png,image/webp" multiple disabled={!uploadsEnabled||saving} onChange={e=>changePhotos(e.target.files)}/>
      {photoPreviews.length>0&&<div className="vb-photo-previews">{photoPreviews.map((photo,i)=><div className="vb-photo-preview" key={photo.url}><img src={photo.url} alt={"Vista previa de "+photo.name}/><span>{photo.name}</span><button type="button" onClick={()=>{setPhotos(old=>old.filter((_,j)=>j!==i));if(photoInputRef.current)photoInputRef.current.value="";}} aria-label={"Quitar "+photo.name}>Quitar</button></div>)}</div>}
     </div>
     <input className="vb-honeypot" aria-hidden="true" tabIndex={-1} value={draft.website} onChange={e=>setDraft(a=>({...a,website:e.target.value}))}/><label className="vb-consent"><input type="checkbox" required checked={draft.accepted} onChange={e=>setDraft(a=>({...a,accepted:e.target.checked}))}/><span>Acepto que Villabyte use mis datos únicamente para atender esta solicitud. *</span></label><button className="vb-button vb-primary vb-submit" disabled={saving} type="submit">{saving?"Registrando...":"Enviar solicitud de servicio"} <Send size={17}/></button>{notice&&<div className="vb-notice" role="status">{notice}</div>}</form>
    </div></section>
    <section id="privacidad" className="vb-privacy"><div className="vb-container"><h2>Privacidad de las solicitudes</h2><p>Al enviar una solicitud, Villabyte recibe tu nombre, correo electrónico, teléfono opcional y descripción del servicio. Estos datos y las imágenes opcionales del equipo se utilizan para atender tu consulta, preparar una cotización y responderte. Las fotografías se guardan en almacenamiento privado y solo las personas administradoras autorizadas pueden consultarlas desde el sistema. Evita adjuntar documentos personales, contraseñas o imágenes sensibles. El registro se almacena en una base de datos privada y, si se configura el servicio de correo transaccional, se procesa una notificación mediante dicho proveedor. No publiques contraseñas ni información especialmente sensible en el formulario.</p>{config.contact_email&&<p>Para consultas sobre tus datos, escribe a <a href={"mailto:"+config.contact_email}>{config.contact_email}</a>.</p>}</div></section>
   </main>
   <footer className="vb-footer"><div className="vb-container vb-footer-top"><div><a href="#inicio" className="vb-brand"><span className="vb-logo">V</span>VILLA<span className="vb-gold">BYTE</span></a><p>Tecnología, ingeniería y soporte a tu medida.</p></div><div><strong>Explora</strong><button onClick={()=>href("servicios")}>Servicios</button><button onClick={()=>href("proyectos")}>Proyectos</button><button onClick={()=>href("solicitar")}>Cotizaciones</button></div><div><strong>Información</strong><span>{config.location||"Guatemala"}</span><span>Atención con previa coordinación</span><button onClick={()=>{setAdminView(true);window.location.hash="admin";}}>Acceso administrativo <LockKeyhole size={12}/></button></div></div><div className="vb-container vb-footer-bottom"><span>© {new Date().getFullYear()} VILLABYTE. Todos los derechos reservados.</span><span>Ingeniería de software · Guatemala</span></div></footer>
  </>
  :<main className="vb-admin">
   <header className="vb-admin-top vb-container"><a className="vb-brand" href="#" onClick={publicNav}><span className="vb-logo">V</span>VILLA<span className="vb-gold">BYTE</span></a><button className="vb-button vb-outline" onClick={publicNav}>Volver al sitio <ArrowRight size={15}/></button></header>
   {!authenticated?<form className="vb-admin-login" onSubmit={login}><LockKeyhole size={30} color="#d9b269"/><h1>Acceso privado</h1><p>Administración de solicitudes, catálogo y contenido de Villabyte. Acceso para titular y administradora autorizada.</p><label>Correo de administrador<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username"/></label><label>Contraseña<input required type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/></label><button className="vb-button vb-primary">Ingresar al panel <ArrowRight size={16}/></button><p style={{fontSize:13,color:"#b3aba2",lineHeight:1.6}}>¿No puedes entrar? La cuenta principal es jonasvillavicencio845@gmail.com. Tu contraseña del panel se define en el secreto ADMIN_PASSWORD de Cloudflare, no en Gmail. Si la olvidaste, puedes cambiar ese secreto desde tu cuenta Cloudflare y volver a desplegar. No compartas la contraseña por este chat.</p>{loginMessage&&<p className="vb-error">{loginMessage}</p>}</form>
   :<div className="vb-container vb-admin-layout"><div className="vb-admin-header"><div><span className="vb-eyebrow">PANEL PRIVADO</span><h1>Gestión Villabyte</h1><p>Solicitudes, respuestas, servicios, precios y proyectos. {adminUser?.email ? "Sesión: "+adminUser.email+" ("+(adminUser.role==="owner"?"Titular":"Administradora")+")" : ""}</p></div><button className="vb-button vb-outline" onClick={logout}>Cerrar sesión</button></div><div className="vb-admin-tabs">{([["inbox","Solicitudes"],["catalog","Catálogo y precios"],["projects","Proyectos"],["config","Datos de Villabyte"]] as const).map(([id,label])=><button key={id} className={tab===id?"active":""} onClick={()=>{setTab(id);setNotice("");if(id==="inbox")loadInbox();}}>{label}</button>)}</div>
    {notice&&<div className="vb-notice">{notice}</div>}
    {tab==="inbox"&&<div className="vb-inbox">
     <div className="vb-mail-diagnostic" role="status">
       <div><strong>Correo de Villabyte</strong>
        <p>{mailStatus===null?"Comprobando configuración...":mailStatus.mail_configured?"Cloudflare reconoce la clave de Apps Script. Prueba ahora el envío real.":"Falta GOOGLE_APPS_SCRIPT_KEY en Cloudflare. El código del Apps Script existente no necesita cambios."}</p>
        <p>{mailStatus?.reply_configured?"Respuestas a clientes desde CMS: habilitadas.":"Avisos al propietario y respuestas a clientes son operaciones diferentes. El botón de respuesta requiere un endpoint que admita responder al cliente; mientras tanto usa «Abrir en mi correo»."}</p>
       </div>
       <div className="vb-mail-diagnostic-actions">
        <button type="button" className="vb-mini-action" onClick={refreshMail} disabled={mailBusy!==null}>Revisar estado</button>
        <button type="button" className="vb-button vb-primary" onClick={testMailEndpoint} disabled={mailBusy!==null}>{mailBusy==="test"?"Probando endpoint...":"Enviar correo de prueba"} <Send size={15}/></button>
       </div>
     </div>
     {requests.length===0?<p className="vb-empty">Aún no hay solicitudes registradas.</p>:requests.map(r=><article key={r.id} className="vb-inbox-card"><div className="vb-inbox-meta"><strong>{r.name}</strong><span>{new Date(r.created_at).toLocaleString("es-GT")}</span><select aria-label="Estado" value={r.status} onChange={e=>updateStatus(r,e.target.value)}>{["nuevo","contactado","en_proceso","cerrado"].map(s=><option key={s} value={s}>{s.replace("_"," ")}</option>)}</select></div><div className="vb-inbox-mail"><span>{r.service_title}</span><a href={"mailto:"+r.email}>{r.email}</a><span>{r.phone||"Sin teléfono"}</span><span>Notificación: {r.email_sent?"enviada":"pendiente"}</span>{!r.email_sent&&<button className="vb-mini-action" type="button" disabled={mailBusy!==null||!mailer.mail_configured} title={!mailer.mail_configured?"Verifica y configura Apps Script antes de reenviar":"Reenviar esta solicitud sin duplicarla en Neon"} onClick={()=>retryNotification(r)}>{mailBusy==="notify:"+r.id?"Enviando...":"Reenviar aviso"}</button>}</div><p className="vb-request-desc">{r.description}</p>
     {!!r.attachments?.length&&<div className="vb-request-images"><strong>Fotografías adjuntas ({r.attachments.length})</strong><div className="vb-request-images-grid">{r.attachments.map(photo=><a key={photo.id} target="_blank" rel="noopener noreferrer" title={"Ver "+photo.filename} href={"/api/admin/requests/"+r.id+"/images/"+photo.id}><img loading="lazy" src={"/api/admin/requests/"+r.id+"/images/"+photo.id} alt={photo.filename}/><span>{photo.filename}</span></a>)}</div></div>}
     {(r.replies||[]).map((x,i)=><div className="vb-history" key={i}><Check size={15}/> Respuesta enviada {new Date(x.date).toLocaleString("es-GT")}: {x.text}</div>)}<label>Responder por correo<textarea rows={3} value={replyText[r.id]||""} onChange={e=>setReplyText(o=>({...o,[r.id]:e.target.value}))} placeholder="Escribe tu respuesta, presupuesto o diagnóstico..."/></label><div className="vb-inbox-actions"><button className="vb-button vb-primary" disabled={!mailer.reply_configured||mailBusy!==null||(replyText[r.id]||"").trim().length<10} title={mailer.reply_configured?"Envío seguro mediante Google Apps Script v2":"Actualiza Apps Script v2 y configura GOOGLE_APPS_SCRIPT_KEY, GOOGLE_APPS_SCRIPT_REPLY_KEY y GOOGLE_SCRIPT_REPLY_ENABLED=true"} onClick={()=>sendReply(r)}>{mailBusy==="reply:"+r.id?"Enviando respuesta...":mailer.reply_configured?"Enviar respuesta":"Envío desde CMS pendiente"} <Send size={16}/></button><a href={"mailto:"+r.email+"?subject="+encodeURIComponent("Villabyte - Solicitud "+r.id.slice(0,8))+"&body="+encodeURIComponent(replyText[r.id]||"Hola "+r.name+",\n\nGracias por contactar a Villabyte.\n\n")}>Abrir en mi correo <ExternalLink size={14}/></a></div></article>)}</div>}
    {tab==="catalog"&&<div className="vb-admin-stack"><h2>Precios del catálogo</h2><p>Estos importes son propuestas iniciales; puedes ajustarlos antes de publicar.</p><div className="vb-catalog-admin">{services.map(s=><div className="vb-edit-row" key={s.id}><div><strong>{s.title}</strong><small>{s.category}</small></div><label>Precio Q<input type="number" min="0" step="1" value={s.price===null?"":s.price} onChange={e=>setServices(a=>a.map(x=>x.id===s.id?{...x,price:e.target.value===""?null:Number(e.target.value)}:x))} placeholder="Cotizar"/></label><button className="vb-mini-action" onClick={()=>updateService(s,{price:s.price})}>Guardar</button><button className="vb-mini-action" onClick={()=>updateService(s,{active:!s.active})}>{s.active?"Ocultar":"Mostrar"}</button><button className="vb-mini-danger" onClick={()=>deleteService(s)}>Eliminar</button></div>)}</div><h3>Agregar un servicio</h3><form className="vb-admin-form" onSubmit={addService}><input required placeholder="Nombre del servicio" value={newService.title} onChange={e=>setNewService(a=>({...a,title:e.target.value}))}/><select value={newService.category} onChange={e=>setNewService(a=>({...a,category:e.target.value}))}>{categories.filter(x=>x!=="Todos").map(x=><option key={x}>{x}</option>)}</select><input type="number" min="0" placeholder="Precio (vacío = cotizar)" value={newService.price} onChange={e=>setNewService(a=>({...a,price:e.target.value}))}/><textarea required placeholder="Descripción del servicio" value={newService.description} onChange={e=>setNewService(a=>({...a,description:e.target.value}))}/><button className="vb-button vb-primary">Agregar servicio</button></form></div>}
    {tab==="projects"&&<div className="vb-admin-stack"><h2>Proyectos publicados</h2>{projects.map(p=><div key={p.id} className="vb-edit-row"><strong>{p.title}</strong><span>{p.status}</span><button className="vb-mini-danger" onClick={()=>deleteProject(p.id)}>Eliminar</button></div>)}<h3>Nuevo proyecto</h3><form className="vb-admin-form" onSubmit={addProject}><input required placeholder="Título del proyecto" value={newProject.title} onChange={e=>setNewProject(a=>({...a,title:e.target.value}))}/><input placeholder="Tipo de proyecto" value={newProject.client} onChange={e=>setNewProject(a=>({...a,client:e.target.value}))}/><textarea required placeholder="Descripción pública (sin datos confidenciales)" value={newProject.description} onChange={e=>setNewProject(a=>({...a,description:e.target.value}))}/><input placeholder="Tecnologías separadas por comas" value={newProject.technologies} onChange={e=>setNewProject(a=>({...a,technologies:e.target.value}))}/><input placeholder="URL pública opcional" value={newProject.live_url} onChange={e=>setNewProject(a=>({...a,live_url:e.target.value}))}/><button className="vb-button vb-primary">Publicar proyecto</button></form></div>}
    {tab==="config"&&<div className="vb-admin-stack"><h2>Información de Villabyte</h2><p>El correo y el teléfono comercial no están verificados. Agrégalos aquí cuando los confirmes. Las credenciales y los correos del servidor se configuran en variables privadas, no en el panel público.</p><form className="vb-admin-form" onSubmit={updateConfig}><label>Título del sitio<input value={config.hero_title||""} onChange={e=>setConfig(a=>({...a,hero_title:e.target.value}))}/></label><label>Descripción comercial<textarea value={config.hero_subtitle||""} onChange={e=>setConfig(a=>({...a,hero_subtitle:e.target.value}))}/></label><label>Correo comercial<input type="email" placeholder="Correo confirmado de Villabyte" value={config.contact_email||""} onChange={e=>setConfig(a=>({...a,contact_email:e.target.value}))}/></label><label>WhatsApp / Teléfono<input placeholder="+502 ..." value={config.phone||""} onChange={e=>setConfig(a=>({...a,phone:e.target.value}))}/></label><label>Ubicación / cobertura<input value={config.location||""} onChange={e=>setConfig(a=>({...a,location:e.target.value}))}/></label><button className="vb-button vb-primary">Guardar información <Check size={16}/></button></form></div>}
   </div>}
  </main>}
 </div>;
}
