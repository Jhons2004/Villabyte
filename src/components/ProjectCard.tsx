import React, { useState } from 'react';
import { PortfolioProject } from '../types';
import { ExternalLink, FileCode, CheckCircle, Cpu, Layers } from 'lucide-react';

interface ProjectCardProps {
  project: PortfolioProject;
  onSelectProject: (project: PortfolioProject) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelectProject }) => {
  const isFlagship = project.title.includes("Sistema Nacional de la Calidad");

  if (isFlagship) {
    return (
      <div className="lg:col-span-8 bg-[#0a1122] rounded-3xl p-1 shadow-2xl group overflow-hidden border border-[#d4af37]/30">
        <div className="h-full bg-[#0a1122] rounded-[22px] p-8 md:p-12 relative flex flex-col justify-center overflow-hidden">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37] opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#d4af37]/20 px-4 py-2 rounded-full w-max mb-6 border border-[#d4af37]/30">
              <span className="w-2 h-2 rounded-full bg-[#f3c623] animate-pulse"></span>
              <span className="text-xs text-[#d4af37] uppercase tracking-wider font-bold">Proyecto Institucional Insignia</span>
            </div>
            
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6 leading-tight">
              {project.title}
            </h3>
            
            <p className="text-gray-300 font-light mb-8 max-w-2xl text-lg leading-relaxed">
              {project.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-8">
              {project.technologies.map((tech, i) => (
                <span key={i} className="px-3 py-1 text-xs font-semibold bg-white/5 text-gray-200 border border-white/10 rounded-lg backdrop-blur-sm">
                  {tech}
                </span>
              ))}
            </div>
            
            <button 
              onClick={() => onSelectProject(project)}
              className="flex items-center gap-2 text-[#d4af37] font-semibold hover:text-white transition-colors group-hover:translate-x-2 transform duration-300"
            >
              Ver documentación técnica y funcional 
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#152033] border border-white/10 rounded-3xl p-8 shadow-sm hover:border-[#d4af37]/50 transition-all flex flex-col justify-between group">
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className="px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-[#d4af37]/20 text-[#d4af37]">
            {project.client}
          </span>
          <span className="text-xs text-gray-400">{project.status}</span>
        </div>
        
        <h4 className="text-2xl font-bold text-white font-serif mb-3 group-hover:text-[#d4af37] transition-colors">
          {project.title}
        </h4>
        
        <p className="text-gray-300 font-light text-sm mb-6 leading-relaxed">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-6">
          {project.technologies.map((tech, i) => (
            <span key={i} className="px-2.5 py-0.5 text-[11px] bg-white/5 text-gray-300 rounded border border-white/5">
              {tech}
            </span>
          ))}
        </div>
      </div>

      <button 
        onClick={() => onSelectProject(project)}
        className="w-full py-3 text-xs uppercase tracking-wider font-semibold text-[#0a1122] bg-[#d4af37] hover:bg-[#f3c623] rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <FileCode className="w-4 h-4" /> Ver Documentación
      </button>
    </div>
  );
};
