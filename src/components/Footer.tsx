import React, { useState } from 'react';
import { GlobalConfig } from '../types';
import { Code2, Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  config: GlobalConfig;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ config, onOpenAdmin }) => {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          subject: `Solicitud B2B - ${formData.name}`,
          page: window.location.href
        })
      });
      const data = await res.json();
      if (data.ok) {
        setSent(true);
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setSent(false), 6000);
      } else {
        setErrorMsg(data.error || 'Error al enviar el mensaje.');
      }
    } catch (err: any) {
      setErrorMsg('Error de red al conectar con el servicio SMTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer id="contacto" className="bg-[#070c1a] pt-20 pb-10 border-t border-white/10 text-white">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          
          <div className="lg:col-span-6 space-y-6">
            <div className="text-3xl font-serif font-bold tracking-wider flex items-center gap-2">
              <Code2 className="w-7 h-7 text-[#d4af37]" />
              VILLA<span className="text-[#d4af37]">BYTE</span>
            </div>
            <p className="text-gray-400 text-sm font-light leading-relaxed max-w-md">
              Desarrollo de sistemas a la medida, algoritmos y plataformas web corporativas. Una empresa legalmente constituida comprometida con la excelencia técnica y la seguridad de la información.
            </p>

            <div className="space-y-3 pt-4 text-sm text-gray-300">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#d4af37]" />
                <span>{config.contact_email}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#d4af37]" />
                <span>{config.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#d4af37]" />
                <span>{config.phone}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#0a1122] p-8 rounded-2xl border border-white/10 shadow-2xl">
            <h3 className="text-xl font-serif font-bold mb-2">Contacto B2B Directo</h3>
            <p className="text-xs text-gray-400 mb-6">Solicite una consultoría técnica o cotización con nuestro equipo de arquitectura.</p>

            {errorMsg && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-xs text-red-300">
                {errorMsg}
              </div>
            )}

            {sent ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-emerald-300">¡Mensaje Enviado con Éxito!</h4>
                <p className="text-xs text-gray-300">Un arquitecto de software se pondrá en contacto con usted a la brevedad vía SMTP.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Nombre / Empresa</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#152033] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    placeholder="Ej. Juan Pérez (Banco Nacional)"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Correo Corporativo</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#152033] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    placeholder="jperez@empresa.com"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Requerimiento del Proyecto</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#152033] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    placeholder="Describa brevemente su requerimiento de sistema o CMS..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#d4af37] hover:bg-[#f3c623] text-[#0a1122] font-bold text-xs uppercase tracking-wider py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> {loading ? 'Enviando vía SMTP...' : 'Enviar Solicitud B2B'}
                </button>
              </form>
            )}
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div>
            &copy; {new Date().getFullYear()} {config.company_name}. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-6">
            <span>Arquitectura Headless CMS &bull; FastAPI + SQLAlchemy + Neon PostgreSQL</span>
            <button
              onClick={onOpenAdmin}
              className="text-[#d4af37]/70 hover:text-[#d4af37] underline transition-colors uppercase font-mono tracking-wider"
            >
              [ Panel Admin CMS ]
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
