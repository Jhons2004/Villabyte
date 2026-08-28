import React, { useState } from 'react';
import { PortfolioProject } from '../types';
import { ExternalLink, FileCode, CheckCircle2, ChevronLeft, ChevronRight, Layers, Building2, Monitor, Sparkles } from 'lucide-react';

interface ProjectCardProps {
  project: PortfolioProject;
  onSelectProject: (project: PortfolioProject) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelectProject }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const images = project.images && project.images.length > 0
    ? project.images
    : ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop"];

  const isFlagship = project.title.toLowerCase().includes("calidad") || project.title.toLowerCase().includes("nacional");

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={`bg-[#0a1122] rounded-3xl border ${isFlagship ? 'border-[#d4af37]/50 shadow-2xl shadow-[#d4af37]/5' : 'border-white/10 hover:border-[#d4af37]/40'} overflow-hidden transition-all duration-300 flex flex-col justify-between group`}>
      {/* Top Image Carousel Area */}
      <div className="relative h-56 md:h-64 w-full bg-[#152033] overflow-hidden">
        <img
          src={images[activeImageIndex]}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1122] via-[#0a1122]/30 to-transparent" />

        {/* Client Logo & Status Badge Overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 bg-[#070c1a]/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 shadow-md">
            {project.client_logo ? (
              <img
                src={project.client_logo}
                alt={project.client}
                className="w-5 h-5 rounded-full object-cover border border-[#d4af37]"
              />
            ) : (
              <Building2 className="w-4 h-4 text-[#d4af37]" />
            )}
            <span className="text-xs font-semibold text-white tracking-wide">{project.client}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-950/85 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{project.status || 'En Producción'}</span>
          </div>
        </div>

        {/* Carousel Image Controls (if multiple images) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImg}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all opacity-0 group-hover:opacity-100 z-10"
              title="Imagen anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImg}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all opacity-0 group-hover:opacity-100 z-10"
              title="Siguiente imagen"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all ${idx === activeImageIndex ? 'w-5 bg-[#d4af37]' : 'w-1.5 bg-white/40'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content Body */}
      <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
        <div>
          {isFlagship && (
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/30 px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Proyecto Insignia B2B</span>
            </div>
          )}

          <h3 className="text-2xl font-serif font-bold text-white mb-3 group-hover:text-[#d4af37] transition-colors leading-snug">
            {project.title}
          </h3>

          <p className="text-gray-300 font-light text-sm mb-6 leading-relaxed line-clamp-3">
            {project.description}
          </p>

          {/* Technologies Chips */}
          <div className="mb-6">
            <div className="text-[11px] uppercase font-bold text-gray-400 tracking-wider mb-2">Tecnologías Implementadas</div>
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.map((tech, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs font-mono bg-[#152033] text-gray-200 border border-white/10 rounded-lg hover:border-[#d4af37]/40 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-white/10 flex items-center gap-3">
          <button
            onClick={() => onSelectProject(project)}
            className="flex-1 py-3 text-xs uppercase tracking-wider font-bold text-[#0a1122] bg-[#d4af37] hover:bg-[#f3c623] rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <FileCode className="w-4 h-4" /> Documentación & Arquitectura
          </button>

          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-[#152033] hover:bg-[#1d2c45] border border-white/10 hover:border-[#d4af37]/50 text-[#d4af37] rounded-xl transition-colors"
              title="Ver Demo / En vivo"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
