import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, LockKeyhole, MessageSquare, Send, ShieldCheck } from "lucide-react";

type TicketInfo = {
  ticket: {id:string;name:string;email:string;service_title:string;description:string;status:string;created_at:string};
  messages: Array<{id:string;sender_type:string;body:string;created_at:string;notification_sent?:boolean}>;
};
async function call(url:string, init?:RequestInit){
  const r=await fetch(url,{...init,credentials:"same-origin",headers:{"Content-Type":"application/json",...(init?.headers||{})}});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw Error(data.error||"No se pudo completar la operación");
  return data;
}
export default function TicketPortal({onBack}:{onBack:()=>void}){
 const [email,setEmail]=useState("");
 const [accessCode,setAccessCode]=useState("");
 const [authenticated,setAuthenticated]=useState(false);
 const [ticket,setTicket]=useState<TicketInfo|null>(null);
 const [message,setMessage]=useState("");
 const [notice,setNotice]=useState("");
 const [loading,setLoading]=useState(false);
 async function refresh(){const x=await call("/api/tickets/thread");setTicket(x);}
 useEffect(()=>{let alive=true;call("/api/tickets/session").then(s=>{
  if(alive&&s.authenticated){setAuthenticated(true);return refresh();}
 }).catch(()=>{});return()=>{alive=false};},[]);
 async function login(e:React.FormEvent){
  e.preventDefault();setLoading(true);setNotice("");
  try{await call("/api/tickets/login",{method:"POST",body:JSON.stringify({email,accessCode})});setAuthenticated(true);setAccessCode("");await refresh();}
  catch(err){setNotice(err instanceof Error?err.message:"No se pudo iniciar sesión");}
  finally{setLoading(false);}
 }
 async function send(e:React.FormEvent){
  e.preventDefault();if(!message.trim())return;setLoading(true);setNotice("");
  try{const result=await call("/api/tickets/thread",{method:"POST",body:JSON.stringify({message})});setMessage("");
    setNotice(result.notified?"Mensaje guardado y aviso enviado a Villabyte.":"Mensaje guardado en tu ticket. Villabyte podrá leerlo en el panel.");await refresh();}
  catch(err){setNotice(err instanceof Error?err.message:"No se pudo enviar el mensaje");}
  finally{setLoading(false);}
 }
 async function logout(){await call("/api/tickets/logout",{method:"POST"}).catch(()=>{});setAuthenticated(false);setTicket(null);setMessage("");setNotice("");}
 return <main className="vb-ticket-wrap">
  <div className="vb-container">
   <button className="vb-ticket-back" onClick={onBack}><ArrowLeft size={17}/> Volver a Villabyte</button>
   <div className="vb-ticket-header"><span className="vb-eyebrow">SEGUIMIENTO PRIVADO</span><h1>Mi <em>ticket.</em></h1><p>Consulta el estado de tu solicitud y conversa con Villabyte sin crear una cuenta de usuario.</p></div>
   {!authenticated ? <form className="vb-ticket-panel" onSubmit={login}>
    <LockKeyhole size={31} color="#d5aa68"/><h2>Acceder a mi solicitud</h2>
    <p>Utiliza el correo con el que enviaste la solicitud y el código privado que recibiste al registrarla. No compartas ese código.</p>
    <label>Correo electrónico<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@correo.com"/></label>
    <label>Código privado del ticket<input required autoComplete="off" minLength={24} value={accessCode} onChange={e=>setAccessCode(e.target.value.trim())} placeholder="Código entregado al registrar la solicitud"/></label>
    <button className="vb-button vb-primary" disabled={loading} type="submit">{loading?"Validando...":"Entrar a mi ticket"} <ArrowLeft size={16} style={{transform:"rotate(180deg)"}}/></button>
    <p className="vb-ticket-foot"><ShieldCheck size={15}/> Solo podrás ver la solicitud vinculada a tu código de acceso. Si perdiste el código, contacta a Villabyte desde el correo con el que hiciste la solicitud.</p>
   </form> : <div className="vb-ticket-panel">
    <div className="vb-ticket-top"><div><span className="vb-eyebrow">TICKET / {ticket?.ticket.id.slice(0,8)}</span><h2>{ticket?.ticket.service_title||"Mi solicitud"}</h2><p>Estado: <strong>{ticket?.ticket.status||"Cargando..."}</strong></p></div><button className="vb-mini-action" onClick={logout}>Cerrar sesión del ticket</button></div>
    {ticket&&<><div className="vb-ticket-original"><strong>Solicitud inicial</strong><p>{ticket.ticket.description}</p></div>
    <div className="vb-ticket-thread" aria-live="polite">{ticket.messages.length?ticket.messages.map(m=><div className={"vb-ticket-message "+(m.sender_type==="client"?"client":"staff")} key={m.id}><div className="vb-ticket-message-meta"><strong>{m.sender_type==="client"?"Tú":"Villabyte"}</strong><small>{new Date(m.created_at).toLocaleString("es-GT")}</small></div><p>{m.body}</p></div>):<p className="vb-ticket-empty">Todavía no hay respuestas. Puedes escribir un mensaje de seguimiento.</p>}</div>
    <form onSubmit={send} className="vb-ticket-reply"><label><MessageSquare size={17}/> Escribir al equipo de Villabyte<textarea rows={4} maxLength={3000} required minLength={2} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Agrega información, una consulta o los avances de tu problema..."/></label><button className="vb-button vb-primary" disabled={loading||!message.trim()} type="submit">{loading?"Enviando...":"Enviar mensaje"} <Send size={17}/></button></form></>}
   </div>}
   {notice&&<div className="vb-ticket-notice" role="status"><CheckCircle2 size={17}/>{notice}</div>}
  </div>
 </main>;
}
