import React from 'react';
import { GlobalConfig } from '../types';
import { ShieldCheck, Code, Terminal, ArrowRight, Layers } from 'lucide-react';

interface HeroSectionProps {
  config: GlobalConfig;
  onExplorePortfolio: () => void;
  onOpenContact: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  config,
  onExplorePortfolio,
  onOpenContact
}) => {
  return (
    <header className="relative w-full min-h-screen bg-[#0a1122] flex items-center overflow-hidden pt-20">
      
      {/* Decorative background vectors & nodes */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-[#152033] opacity-40 transform -skew-x-12 translate-x-32 border-l border-white/5 pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] rounded-full border border-[#d4af37]/20 opacity-30 pointer-events-none"></div>
      <div className="absolute top-32 right-20 w-64 h-64 border border-white/5 rounded-lg transform rotate-45 opacity-50 pointer-events-none"></div>

      <div className="container mx-auto px-6 md:px-12 lg:px-24 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-12">
        
        {/* Main Text Content */}
        <div className="text-white space-y-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs uppercase tracking-widest text-gray-300 backdrop-blur-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#d4af37]"></span>
            </span>
            {config.company_name} — Empresa Legalmente Constituida
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-sans font-extrabold leading-tight tracking-tighter">
            <span className="block">{config.hero_title.split('.')[0] || "Liderando la"}</span>
            <span className="block text-[#d4af37]">
              {config.hero_title.split('.').slice(1).join('.') || "Transformación Digital"}
            </span>
          </h1>
          
          <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
            {config.hero_subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 pt-4">
            <a 
              href="#contacto"
              onClick={onOpenContact}
              className="px-8 py-4 bg-[#d4af37] text-[#0a1122] font-bold rounded-lg shadow-xl shadow-[#d4af37]/20 hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              Cotizar Proyecto <ArrowRight className="w-4 h-4" />
            </a>
            <button 
              onClick={onExplorePortfolio}
              className="border border-[#d4af37]/30 hover:border-[#d4af37] text-white text-center font-semibold py-4 px-8 rounded-lg transition-all duration-300 bg-[#121b2d]/80 backdrop-blur-md flex items-center justify-center gap-2"
            >
              <Layers className="w-4 h-4 text-[#d4af37]" /> Explorar Portafolio CMS
            </button>
          </div>
        </div>

        {/* Visual IDE Simulation */}
        <div className="hidden lg:flex justify-end relative">
          <div className="relative w-full max-w-lg aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#0d1117] flex flex-col z-10">
            <div className="h-10 bg-[#161b22] border-b border-white/5 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              <span className="ml-4 text-xs text-gray-400 font-mono flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-[#d4af37]" /> villabyte-core.py
              </span>
            </div>
            <div className="p-8 font-mono text-xs md:text-sm text-gray-300 opacity-90 overflow-hidden flex-1 space-y-3 leading-relaxed">
              <p className="text-gray-500"># Entorno FastAPI + SQLAlchemy + Neon PostgreSQL</p>
              <p><span className="text-pink-400">from</span> fastapi <span className="text-pink-400">import</span> FastAPI</p>
              <p><span className="text-pink-400">from</span> sqlalchemy.orm <span className="text-pink-400">import</span> Session</p>
              <p className="mt-2"><span className="text-blue-400">app</span> = FastAPI(title=<span className="text-green-300">"{config.company_name} CMS"</span>)</p>
              <p className="mt-2 text-yellow-200">@app.get("/api/v1/status")</p>
              <p><span className="text-pink-400">def</span> <span className="text-blue-300">get_system_status</span>():</p>
              <p className="ml-4 text-purple-300">return {'{'}</p>
              <p className="ml-8 text-blue-300">"status": "operational",</p>
              <p className="ml-8 text-blue-300">"trazabilidad": "active",</p>
              <p className="ml-8 text-blue-300">"security": "enterprise"</p>
              <p className="ml-4 text-purple-300">{'}'}</p>
              <p className="mt-4 text-emerald-400 font-semibold">&gt; [OK] Conectado a Neon Cloud DB.</p>
            </div>
          </div>
          
          {/* Floating Stats Card */}
          <div className="absolute -bottom-6 -left-12 bg-white p-5 rounded-xl shadow-2xl max-w-[260px] z-20 border-l-4 border-[#d4af37]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#f8fafc] flex items-center justify-center text-[#0a1122]">
                <ShieldCheck className="w-6 h-6 text-[#d4af37]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0a1122] leading-none">100%</p>
                <p className="text-xs text-gray-500 font-semibold uppercase mt-1">CMS Headless a la Medida</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
