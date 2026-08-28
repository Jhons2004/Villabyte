import React from 'react';
import { TrustedClient } from '../types';
import { Building2, ExternalLink, ShieldCheck } from 'lucide-react';

interface TrustedClientsSectionProps {
  clients: TrustedClient[];
}

export const TrustedClientsSection: React.FC<TrustedClientsSectionProps> = ({ clients }) => {
  if (!clients || clients.length === 0) return null;

  return (
    <section className="py-20 bg-[#070c1a] border-y border-[#d4af37]/15 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] bg-[#d4af37]/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#152033] border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold uppercase tracking-wider mb-4 shadow-inner">
            <ShieldCheck className="w-4 h-4" />
            <span>Confianza y Trayectoria Empresarial</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
            Empresas y Entidades que Confían en <span className="text-[#d4af37]">Nosotros</span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base mt-3 leading-relaxed">
            Impulsamos la infraestructura de software de alta exigencia, seguridad y precisión técnica para organizaciones líderes en sus sectores.
          </p>
        </div>

        {/* Company Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {clients.map((client) => (
            <div
              key={client.id}
              className="group bg-[#0a1122]/90 hover:bg-[#101c36] border border-white/10 hover:border-[#d4af37]/50 rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center text-center shadow-lg hover:shadow-[#d4af37]/10"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-[#152033] border border-white/10 flex items-center justify-center p-3 mb-4 group-hover:scale-105 transition-transform duration-300 shadow-inner">
                {client.logo_url ? (
                  <img
                    src={client.logo_url}
                    alt={client.name}
                    className="w-full h-full object-contain rounded-lg filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    onError={(e) => {
                      // Fallback icon if image fails to load
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-[#d4af37]" />
                )}
              </div>

              <h3 className="text-base font-semibold text-white group-hover:text-[#d4af37] transition-colors line-clamp-1">
                {client.name}
              </h3>

              {client.industry && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                  {client.industry}
                </p>
              )}

              {client.website_url && (
                <a
                  href={client.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-[11px] text-[#d4af37]/80 hover:text-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span>Conocer más</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Trust Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 text-xs text-gray-400 bg-[#0a1122] border border-white/10 px-5 py-2.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Garantía de confidencialidad NDA, seguridad estricta y SLA 99.9% de disponibilidad continua.</span>
          </div>
        </div>
      </div>
    </section>
  );
};
