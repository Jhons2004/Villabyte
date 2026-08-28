import React from 'react';
import { ServiceItem } from '../types';
import { Bot, TrendingUp, MessageSquare, ShieldCheck, Cpu, Sparkles, Layers } from 'lucide-react';

interface ServicesSectionProps {
  services: ServiceItem[];
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ services }) => {
  // Helper to map icon string to Lucide icon
  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bot': return <Bot className="w-8 h-8" />;
      case 'TrendingUp': return <TrendingUp className="w-8 h-8" />;
      case 'MessageSquare': return <MessageSquare className="w-8 h-8" />;
      case 'ShieldCheck': return <ShieldCheck className="w-8 h-8" />;
      case 'Cpu': return <Cpu className="w-8 h-8" />;
      default: return <Sparkles className="w-8 h-8" />;
    }
  };

  return (
    <section id="servicios" className="py-24 bg-[#0a1122] text-white w-full border-t border-[#d4af37]/10">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-xs font-semibold text-[#d4af37] uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" /> Catálogo Avanzado B2B
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">Capacidades y Soluciones IT</h2>
          <div className="w-24 h-1 bg-[#d4af37] mx-auto mb-6"></div>
          <p className="text-slate-400 font-light text-lg">
            Soluciones de alta gama diseñadas específicamente para automatización inteligente, trazabilidad y transformación digital integral de procesos corporativos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const isFeatured = index === 0 || service.title.includes("Agentes");
            return (
              <div 
                key={service.id || index}
                className={`p-8 rounded-2xl transition-all duration-300 flex flex-col justify-between border ${
                  isFeatured 
                    ? 'bg-[#121b2d] text-white shadow-xl border-l-4 border-[#d4af37] transform lg:-translate-y-2' 
                    : 'bg-[#121b2d]/80 text-white shadow-sm border-[#d4af37]/20 hover:border-[#d4af37] hover:-translate-y-1'
                }`}
              >
                <div>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-md bg-[#0a1122] text-[#d4af37] border border-[#d4af37]/30">
                    {getServiceIcon(service.icon)}
                  </div>
                  
                  <div className="text-xs uppercase tracking-wider font-semibold text-[#d4af37] mb-2">
                    {service.category}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4 font-serif text-white">
                    {service.title}
                  </h3>
                  
                  <p className="font-light text-sm leading-relaxed text-slate-400">
                    {service.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>CMS Dinámico</span>
                  <span className="text-[#d4af37] flex items-center gap-1 font-mono">Activo B2B</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
