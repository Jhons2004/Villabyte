import React, { useState } from 'react';
import { PortfolioProject } from '../types';
import { ProjectCard } from './ProjectCard';
import {
  X,
  FileCode,
  CheckCircle2,
  Cpu,
  Layers,
  ChevronLeft,
  ChevronRight,
  Monitor,
  ExternalLink,
  RefreshCw,
  Building2,
  ShieldCheck,
  Server,
  Database
} from 'lucide-react';

interface PortfolioSectionProps {
  projects: PortfolioProject[];
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'docs' | 'architecture' | 'gallery'>('docs');
  const [modalImageIndex, setModalImageIndex] = useState(0);

  const nextSlide = () => {
    if (projects.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  };

  const prevSlide = () => {
    if (projects.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const currentProj = projects[currentIndex] || null;

  return (
    <section id="portafolio" className="py-24 bg-[#0a1122] text-white w-full border-t border-white/10 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#152033] border border-[#d4af37]/30 text-[#d4af37] text-xs font-bold tracking-widest uppercase mb-3">
              <Server className="w-3.5 h-3.5" />
              <span>Sistemas en Producción & Trazabilidad B2B</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">
              Portafolio de Ingeniería & Casos de Éxito
            </h2>
            <p className="text-gray-300 font-light text-base md:text-lg leading-relaxed">
              Plataformas robustas, arquitecturas de software a la medida y sistemas de misión crítica desarrollados para entidades gubernamentales y corporaciones privadas.
            </p>
          </div>

          <div className="flex gap-6 text-center bg-[#121b2d] p-5 rounded-2xl border border-white/10 shadow-lg">
            <div>
              <span className="block text-3xl md:text-4xl font-black text-white">{projects.length}</span>
              <span className="text-[11px] uppercase text-gray-400 font-semibold mt-1 block">Casos Operativos</span>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <span className="block text-3xl md:text-4xl font-black text-[#d4af37]">99.9%</span>
              <span className="text-[11px] uppercase text-gray-400 font-semibold mt-1 block">SLA Disponibilidad</span>
            </div>
          </div>
        </div>

        {/* Dynamic Project Carousel Showcase */}
        {projects.length > 0 && currentProj && (
          <div className="mb-20 bg-[#101c36] border border-[#d4af37]/40 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/10 pb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#d4af37] animate-pulse" />
                <h3 className="text-xl md:text-2xl font-serif font-bold text-white">
                  Carrusel de Proyectos en Vivo
                </h3>
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={prevSlide}
                  className="p-3 rounded-xl bg-[#0a1122] border border-white/15 hover:border-[#d4af37] text-white hover:text-[#d4af37] transition-colors shadow-md"
                  title="Anterior proyecto"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-mono text-gray-400 px-2">
                  {currentIndex + 1} / {projects.length}
                </span>
                <button 
                  onClick={nextSlide}
                  className="p-3 rounded-xl bg-[#0a1122] border border-white/15 hover:border-[#d4af37] text-white hover:text-[#d4af37] transition-colors shadow-md"
                  title="Siguiente proyecto"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left Details */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 bg-[#0a1122] border border-white/15 px-3 py-1.5 rounded-full text-xs font-semibold text-white">
                    {currentProj.client_logo ? (
                      <img src={currentProj.client_logo} alt={currentProj.client} className="w-4 h-4 rounded-full object-cover" />
                    ) : (
                      <Building2 className="w-3.5 h-3.5 text-[#d4af37]" />
                    )}
                    <span>{currentProj.client}</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs px-3 py-1.5 rounded-full font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{currentProj.status || 'En Producción'}</span>
                  </div>
                </div>

                <h4 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white leading-tight">
                  {currentProj.title}
                </h4>

                <p className="text-gray-300 font-light text-sm md:text-base leading-relaxed">
                  {currentProj.description}
                </p>

                <div>
                  <div className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-2">Stack Tecnológico</div>
                  <div className="flex flex-wrap gap-2">
                    {currentProj.technologies?.map((tech, i) => (
                      <span key={i} className="px-3 py-1 bg-[#0a1122] border border-[#d4af37]/30 text-[#d4af37] text-xs font-mono rounded-lg">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setSelectedProject(currentProj);
                      setActiveTab('docs');
                    }}
                    className="px-6 py-3.5 bg-[#d4af37] hover:bg-[#f3c623] text-[#0a1122] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    <FileCode className="w-4 h-4" /> Ver Documentación & Arquitectura
                  </button>

                  {currentProj.live_url && (
                    <a
                      href={currentProj.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3.5 bg-[#0a1122] hover:bg-[#152033] border border-white/15 hover:border-[#d4af37]/50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
                    >
                      <span>Ver Demo / Sitio</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#d4af37]" />
                    </a>
                  )}
                </div>
              </div>

              {/* Right Media / Image Gallery Preview */}
              <div className="lg:col-span-5">
                <div className="relative rounded-2xl overflow-hidden border border-[#d4af37]/30 bg-[#0a1122] shadow-xl group">
                  <img
                    src={currentProj.images && currentProj.images.length > 0 ? currentProj.images[0] : "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop"}
                    alt={currentProj.title}
                    className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1122] via-transparent to-transparent opacity-80" />

                  <div className="absolute bottom-4 left-4 right-4 bg-[#070c1a]/90 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
                    <div className="text-[11px] uppercase font-bold text-[#d4af37] tracking-wider mb-1 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" /> Arquitectura & Trazabilidad
                    </div>
                    <p className="text-xs text-gray-300 font-mono line-clamp-2">
                      {currentProj.tech_docs}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-8">
              {projects.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${idx === currentIndex ? 'w-8 bg-[#d4af37]' : 'w-2 bg-white/20'}`}
                  title={`Ir al proyecto ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Grid of All Projects */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">
              Explorar Todos los Proyectos
            </h3>
            <p className="text-gray-400 text-sm">
              Seleccione cualquier desarrollo para inspeccionar su stack, documentación funcional y diagramas técnicos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelectProject={(p) => {
                  setSelectedProject(p);
                  setActiveTab('docs');
                  setModalImageIndex(0);
                }}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Comprehensive Tech Docs & Architecture Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0a1122] border border-[#d4af37]/40 rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl relative text-white my-8 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex justify-between items-start pb-6 border-b border-white/10">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <div className="inline-flex items-center gap-1.5 bg-[#152033] px-3 py-1 rounded-full text-xs font-semibold text-[#d4af37] border border-[#d4af37]/30">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{selectedProject.client}</span>
                  </div>
                  <div className="inline-flex items-center gap-1 bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{selectedProject.status || 'Operativo'}</span>
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">
                  {selectedProject.title}
                </h3>
              </div>

              <button 
                onClick={() => setSelectedProject(null)}
                className="text-gray-400 hover:text-white p-2 rounded-xl bg-[#152033] border border-white/10 hover:border-[#d4af37]/50 transition-colors"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 my-5 border-b border-white/10 pb-3">
              <button
                onClick={() => setActiveTab('docs')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                  activeTab === 'docs'
                    ? 'bg-[#d4af37] text-[#0a1122]'
                    : 'bg-[#152033] text-gray-300 hover:bg-[#1f2d45]'
                }`}
              >
                <FileCode className="w-4 h-4" /> Documentación Funcional
              </button>

              <button
                onClick={() => setActiveTab('architecture')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                  activeTab === 'architecture'
                    ? 'bg-[#d4af37] text-[#0a1122]'
                    : 'bg-[#152033] text-gray-300 hover:bg-[#1f2d45]'
                }`}
              >
                <Layers className="w-4 h-4" /> Arquitectura del Sistema
              </button>

              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                  activeTab === 'gallery'
                    ? 'bg-[#d4af37] text-[#0a1122]'
                    : 'bg-[#152033] text-gray-300 hover:bg-[#1f2d45]'
                }`}
              >
                <Monitor className="w-4 h-4" /> Galería & Capturas ({selectedProject.images?.length || 0})
              </button>
            </div>

            {/* Modal Tab Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {activeTab === 'docs' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs uppercase font-bold text-[#d4af37] tracking-wider mb-2">Descripción General del Requerimiento</h4>
                    <p className="text-gray-300 font-light leading-relaxed text-sm md:text-base">
                      {selectedProject.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs uppercase font-bold text-[#d4af37] tracking-wider mb-2">Stack Tecnológico Implementado</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies.map((t, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-[#152033] border border-white/10 text-xs font-mono rounded-lg text-gray-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#070c1a] p-5 rounded-2xl border border-white/10 space-y-3">
                    <h4 className="text-xs uppercase font-bold text-[#d4af37] tracking-wider flex items-center gap-2">
                      <FileCode className="w-4 h-4" /> Especificación Técnica & Auditoría
                    </h4>
                    <p className="text-sm text-gray-300 font-mono leading-relaxed bg-[#152033] p-4 rounded-xl border border-white/5">
                      {selectedProject.tech_docs}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'architecture' && (
                <div className="space-y-6">
                  <div className="bg-[#070c1a] p-6 rounded-2xl border border-[#d4af37]/30 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center border border-[#d4af37]/30">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">Desglose de Capas y Componentes</h4>
                        <p className="text-xs text-gray-400">Diseño desacoplado para alta concurrencia y tolerancia a fallos</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div className="bg-[#152033] p-4 rounded-xl border border-white/10 space-y-2">
                        <div className="text-xs font-bold text-[#d4af37] uppercase flex items-center gap-1.5">
                          <Monitor className="w-3.5 h-3.5" /> Capa Frontend
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          SPA / SSR React & Next.js con interfaces reactivas y validación de tipos estricta con TypeScript.
                        </p>
                      </div>

                      <div className="bg-[#152033] p-4 rounded-xl border border-white/10 space-y-2">
                        <div className="text-xs font-bold text-[#d4af37] uppercase flex items-center gap-1.5">
                          <Server className="w-3.5 h-3.5" /> Backend & APIs
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          Microservicios REST / GraphQL asíncronos con validación Pydantic y enrutamiento modular.
                        </p>
                      </div>

                      <div className="bg-[#152033] p-4 rounded-xl border border-white/10 space-y-2">
                        <div className="text-xs font-bold text-[#d4af37] uppercase flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5" /> Base de Datos
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          PostgreSQL / TimescaleDB con modelos SQLAlchemy normalizados y auditoría transaccional.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Detalle de Flujo de Datos</h5>
                      <p className="text-xs text-gray-300 font-mono bg-[#152033] p-4 rounded-xl border border-white/5 leading-relaxed">
                        {selectedProject.architecture_details || "Arquitectura distribuida basada en microservicios desacoplados con balanceo NGINX, pool de conexiones PostgreSQL e inmutabilidad en logs de auditoría."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'gallery' && (
                <div className="space-y-6">
                  {selectedProject.images && selectedProject.images.length > 0 ? (
                    <div>
                      {/* Main Big Image Preview */}
                      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/60 h-80 mb-4 flex items-center justify-center">
                        <img
                          src={selectedProject.images[modalImageIndex] || selectedProject.images[0]}
                          alt={`${selectedProject.title} screenshot ${modalImageIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white">
                          Captura {modalImageIndex + 1} de {selectedProject.images.length}
                        </div>
                      </div>

                      {/* Thumbnails row */}
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {selectedProject.images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setModalImageIndex(idx)}
                            className={`flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                              modalImageIndex === idx ? 'border-[#d4af37] scale-105' : 'border-white/20 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={img} alt="thumb" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400 bg-[#070c1a] rounded-2xl border border-white/10">
                      No hay capturas adicionales cargadas para este proyecto.
                    </div>
                  )}

                  {selectedProject.enable_iframe && selectedProject.live_url && (
                    <div className="bg-[#070c1a] p-4 rounded-2xl border border-white/10">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-[#d4af37] uppercase flex items-center gap-1.5">
                          <Monitor className="w-4 h-4" /> Entorno Embebido (Iframe Interactivo)
                        </span>
                        <a
                          href={selectedProject.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#d4af37] hover:underline flex items-center gap-1"
                        >
                          Abrir ventana completa <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-white/10 h-72 bg-black">
                        <iframe
                          src={selectedProject.live_url}
                          title={selectedProject.title}
                          className="w-full h-full border-0"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-white/10 flex justify-between items-center">
              <span className="text-xs text-gray-400">
                Registrado en Headless CMS &bull; VILLABYTE
              </span>
              <button
                onClick={() => setSelectedProject(null)}
                className="bg-[#d4af37] hover:bg-[#f3c623] text-[#0a1122] font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
