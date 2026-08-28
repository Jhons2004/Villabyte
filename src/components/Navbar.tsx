import React from 'react';
import { Code2, Shield, LayoutDashboard, Settings } from 'lucide-react';

interface NavbarProps {
  currentView: 'landing' | 'admin' | 'architecture';
  onViewChange: (view: 'landing' | 'admin' | 'architecture') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange
}) => {
  return (
    <nav className="h-20 flex items-center justify-between px-6 md:px-12 border-b border-[#d4af37]/20 bg-[#0a1122]/90 backdrop-blur-md sticky top-0 z-50 text-white">
      <div 
        onClick={() => onViewChange('landing')}
        className="flex items-center space-x-3 cursor-pointer group"
      >
        <div className="w-10 h-10 bg-[#d4af37] rounded-lg flex items-center justify-center transform rotate-45 shadow-lg shadow-[#d4af37]/20 group-hover:rotate-90 transition-transform">
          <span className="transform -rotate-45 font-bold text-xl text-[#0a1122]">V</span>
        </div>
        <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-[#d4af37] bg-clip-text text-transparent">
          VILLABYTE
        </span>
      </div>

      <div className="hidden lg:flex items-center space-x-8 text-sm font-medium tracking-widest text-[#d4af37]/70">
        <a 
          href="#servicios" 
          onClick={() => onViewChange('landing')}
          className="hover:text-[#d4af37] cursor-pointer transition-colors"
        >
          CAPACIDADES
        </a>
        <a 
          href="#portafolio" 
          onClick={() => onViewChange('landing')}
          className="hover:text-[#d4af37] cursor-pointer transition-colors"
        >
          PORTAFOLIO & PREVIEW
        </a>
        <button 
          onClick={() => onViewChange('architecture')}
          className="hover:text-[#d4af37] cursor-pointer transition-colors uppercase bg-transparent border-none text-inherit text-sm font-medium tracking-widest"
        >
          INFRAESTRUCTURA
        </button>
      </div>

      <div className="flex items-center gap-3">
        {currentView === 'admin' ? (
          <button
            onClick={() => onViewChange('landing')}
            className="px-5 py-2 border border-[#d4af37] text-[#d4af37] rounded-md text-xs hover:bg-[#d4af37]/10 transition-colors uppercase font-bold"
          >
            Ver Landing
          </button>
        ) : (
          <div className="text-xs text-[#d4af37]/60 font-mono hidden sm:block">
            Enterprise B2B Ready
          </div>
        )}
      </div>
    </nav>
  );
};
