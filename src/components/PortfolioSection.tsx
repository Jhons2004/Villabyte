import React, { useState } from 'react';
import { PortfolioProject } from '../types';
import { ProjectCard } from './ProjectCard';
import { X, FileCode, CheckCircle, Cpu, Layers, ChevronLeft, ChevronRight, Monitor, ExternalLink, RefreshCw } from 'lucide-react';

interface PortfolioSectionProps {
  projects: PortfolioProject[];
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [iframeUrl, setIframeUrl] = useState(window.location.origin);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const nextSlide = () => {
    if (projects.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  };

  const prevSlide = () => {
    if (projects.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const handleRefreshIframe = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <section id="portafolio" className="py-24 bg-[#0a1122] text-white w-full border-t border-white/10 relative">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <div className="text-sm text-[#d4af37] font-bold tracking-widest uppercase mb-2">Desarrollos en Producción & Carrusel</div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Portafolio CMS & Carrusel Dinámico</h2>
            <p className="text-gray-400 font-light text-lg">
              Casos de éxito sincronizados en tiempo real desde el gestor de proyectos. Visualice nuestro carrusel interactivo y el visor de vista previa en iframe.
            </p>
          </div>
          <div className="flex gap-8 text-center bg-[#152033] p-6 rounded-xl border border-white/10">
            <div>
              <span className="block text-4xl font-black text-white">{projects.length || 3}</span>
              <span className="text-xs uppercase text-gray-400 font-semibold mt-1 block">Casos de Éxito</span>
            </div>
            <div className="w-px bg-white/10"></div>
            <div>
              <span className="block text-4xl font-black text-[#d4af37]">100%</span>
              <span className="text-xs uppercase text-gray-400 font-semibold mt-1 block">CMS Propio</span>
            </div>
          </div>
        </div>

        {/* Interactive Carousel for Projects */}
        <div className="mb-20 bg-[#121b2d] border border-[#d4af37]/30 rounded-2xl p-6 md:p-10 shadow-2xl relative">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#d4af37]"></span>
              <h3 className="text-xl font-serif font-bold">Carrusel de Proyectos B2B (Gestor CMS)</h3>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={prevSlide}
                className="p-3 rounded-xl bg-[#0a1122] border border-white/10 hover:border-[#d4af37] text-white transition-colors"
                title="Anterior"
              >
                <ChevronLeft className="w-5 h-5 text-[#d4af37]" />
              </button>
              <button 
                onClick={nextSlide}
                className="p-3 rounded-xl bg-[#0a1122] border border-white/10 hover:border-[#d4af37] text-white transition-colors"
                title="Siguiente"
              >
                <ChevronRight className="w-5 h-5 text-[#d4af37]" />
              </button>
            </div>
          </div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#d4af37]/20 text-[#d4af37]">
                  {projects[currentIndex]?.client || 'Institución B2B'} &bull; {projects[currentIndex]?.status}
                </div>
                <h4 className="text-2xl md:text-3xl font-serif font-bold text-white">
                  {projects[currentIndex]?.title}
                </h4>
                <p className="text-gray-300 font-light leading-relaxed">
                  {projects[currentIndex]?.description}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {projects[currentIndex]?.technologies?.map((tech, i) => (
                    <span key={i} className="px-3 py-1 bg-[#0a1122] border border-[#d4af37]/30 text-[#d4af37] text-xs font-mono rounded-md">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => setSelectedProject(projects[currentIndex])}
                    className="px-6 py-3 bg-[#d4af37] hover:bg-[#f3c623] text-[#0a1122] font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FileCode className="w-4 h-4" /> Ver Documentación Técnica
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#0a1122] p-6 rounded-xl border border-white/10 space-y-4">
                <div className="text-xs uppercase font-bold text-[#d4af37] tracking-wider">Resumen de Arquitectura</div>
                <p className="text-xs text-gray-300 font-mono leading-relaxed bg-[#152033] p-4 rounded-lg border border-white/5">
                  {projects[currentIndex]?.tech_docs || 'Sistema integrado con autenticación robusta y despliegue en contenedores Cloud Run.'}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-white/10">
                  <span>Proyecto {currentIndex + 1} de {projects.length}</span>
                  <span className="text-[#d4af37] font-bold">Activo en Servidor</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">No hay proyectos registrados en el CMS.</div>
          )}

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {projects.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-3 h-3 rounded-full transition-all ${idx === currentIndex ? 'bg-[#d4af37] w-8' : 'bg-white/20'}`}
              />
            ))}
          </div>
        </div>

        {/* Grid of all projects */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          {projects.map((project) => (
            <div key={project.id} className={project.title.includes("Sistema Nacional de la Calidad") ? "lg:col-span-8" : "lg:col-span-4"}>
              <ProjectCard project={project} onSelectProject={setSelectedProject} />
            </div>
          ))}
        </div>

        {/* Live System Iframe Preview Showcase */}
        <div className="bg-[#121b2d] border border-[#d4af37]/30 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-[#0a1122] px-6 py-4 border-b border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-[#d4af37]" />
              <div>
                <h3 className="font-serif font-bold text-white">Visualizador Iframe en Vivo (Sistema VILLABYTE)</h3>
                <p className="text-xs text-gray-400">Vista integrada del entorno de producción y cliente</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input
                type="text"
                value={iframeUrl}
                onChange={(e) => setIframeUrl(e.target.value)}
                className="bg-[#152033] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 w-full md:w-80 font-mono focus:outline-none focus:border-[#d4af37]"
              />
              <button
                onClick={handleRefreshIframe}
                className="p-2 rounded-lg bg-[#152033] hover:bg-white/10 text-[#d4af37] border border-white/10 transition-colors"
                title="Actualizar Vista"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <a
                href={iframeUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-[#d4af37] text-[#0a1122] hover:bg-[#f3c623] transition-colors"
                title="Abrir en Nueva Pestana"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="p-4 bg-[#070c1a]">
            <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40 h-[500px] relative">
              {isRefreshing ? (
                <div className="absolute inset-0 bg-[#0a1122]/80 flex items-center justify-center z-10">
                  <div className="w-8 h-8 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : null}
              <iframe
                src={iframeUrl}
                title="Sistema Preview"
                className="w-full h-full border-0"
              />
            </div>
            <div className="mt-3 text-center text-xs text-gray-400">
              * Nota: El iframe permite visualizar la aplicación de manera interactiva. Si alguna regla de seguridad del navegador restringe el embedding directo, puede abrirlo con el botón de enlace externo.
            </div>
          </div>
        </div>

      </div>

      {/* Project Tech Docs Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#152033] border border-[#d4af37]/30 rounded-2xl max-w-2xl w-full p-8 shadow-2xl relative text-white animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setSelectedProject(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 rounded-lg bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#d4af37]/20 text-[#d4af37] mb-4">
              {selectedProject.client}
            </div>

            <h3 className="text-2xl md:text-3xl font-serif font-bold mb-4">{selectedProject.title}</h3>
            
            <p className="text-gray-300 font-light mb-6 leading-relaxed">
              {selectedProject.description}
            </p>

            <div className="mb-6">
              <h4 className="text-xs uppercase font-bold text-[#d4af37] tracking-wider mb-2">Tecnologías Aplicadas</h4>
              <div className="flex flex-wrap gap-2">
                {selectedProject.technologies.map((t, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white/5 border border-white/10 text-xs rounded-md">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-[#0a1122] p-5 rounded-xl border border-white/10 mb-6">
              <h4 className="text-xs uppercase font-bold text-[#d4af37] tracking-wider mb-2 flex items-center gap-2">
                <FileCode className="w-4 h-4" /> Documentación Técnica / Funcional
              </h4>
              <p className="text-sm text-gray-300 font-mono leading-relaxed">
                {selectedProject.tech_docs}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedProject(null)}
                className="bg-[#d4af37] hover:bg-[#f3c623] text-[#0a1122] font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-lg transition-colors"
              >
                Cerrar Documentación
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
