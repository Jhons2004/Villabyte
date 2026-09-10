import React, { useEffect, useRef, useState } from 'react';
import { GlobalConfig } from '../types';
import { ArrowRight, Layers, Sparkles, Shield, Cpu, Activity } from 'lucide-react';

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  // Hypnotic Canvas Animation (concentric harmonic rings, orbital particle stream, ethereal golden aura)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle nodes for subtle golden constellation
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.6 + 0.6,
      alpha: Math.random() * 0.4 + 0.2
    }));

    let angle = 0;

    const render = () => {
      angle += 0.0035;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height * 0.48;

      // 1. Hypnotic Ambient Radial Glow
      const ambientGlow = ctx.createRadialGradient(
        centerX + (mousePos.x - 0.5) * 60,
        centerY + (mousePos.y - 0.5) * 60,
        10,
        centerX,
        centerY,
        Math.max(width, height) * 0.6
      );
      ambientGlow.addColorStop(0, 'rgba(212, 175, 55, 0.08)');
      ambientGlow.addColorStop(0.3, 'rgba(16, 28, 54, 0.45)');
      ambientGlow.addColorStop(0.7, 'rgba(5, 10, 22, 0.85)');
      ambientGlow.addColorStop(1, 'rgba(3, 7, 18, 1)');

      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Mesmerizing Concentric Harmonic Rings
      const ringCount = 5;
      for (let i = 1; i <= ringCount; i++) {
        const baseRadius = 80 + i * 55;
        const pulse = Math.sin(angle * 2 + i * 0.8) * 8;
        const r = baseRadius + pulse;

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);

        // Gradient stroke for hypnotic rotation
        const ringGrad = ctx.createLinearGradient(
          centerX - r,
          centerY - r,
          centerX + r,
          centerY + r
        );
        const opacity = 0.08 + (ringCount - i) * 0.035;
        ringGrad.addColorStop(0, `rgba(212, 175, 55, ${opacity * 1.5})`);
        ringGrad.addColorStop(0.5, `rgba(255, 255, 255, ${opacity * 0.6})`);
        ringGrad.addColorStop(1, `rgba(212, 175, 55, ${opacity * 0.2})`);

        ctx.strokeStyle = ringGrad;
        ctx.lineWidth = i % 2 === 0 ? 1 : 1.5;
        ctx.setLineDash([12 + i * 4, 18 + i * 6]);
        ctx.lineDashOffset = (i % 2 === 0 ? 1 : -1) * angle * 80;
        ctx.stroke();
        ctx.restore();

        // Subtle orbital beads
        const beadAngle = angle * (1.2 / i) + (i * Math.PI) / 3;
        const beadX = centerX + Math.cos(beadAngle) * r;
        const beadY = centerY + Math.sin(beadAngle) * r;

        ctx.beginPath();
        ctx.arc(beadX, beadY, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(212, 175, 55, 0.7)';
        ctx.shadowColor = '#d4af37';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 3. Fine Minimalist Precision Crosshairs & Vector Axes
      ctx.save();
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.07)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 12]);
      // Horizontal axis
      ctx.beginPath();
      ctx.moveTo(centerX - 380, centerY);
      ctx.lineTo(centerX + 380, centerY);
      ctx.stroke();
      // Vertical axis
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 280);
      ctx.lineTo(centerX, centerY + 280);
      ctx.stroke();
      ctx.restore();

      // 4. Drifting Golden Dust Particles with Soft Connecting Threads
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`;
        ctx.fill();

        // Connect closely situated particles with subtle threads
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(212, 175, 55, ${0.08 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [mousePos]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  };

  return (
    <header
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-[92vh] lg:min-h-screen bg-[#030712] flex flex-col items-center justify-center overflow-hidden pt-24 pb-16 px-6 select-none"
    >
      {/* Hypnotic Ambient Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Subtle Radial Vignette for Supreme Contrast */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#030712_85%)] pointer-events-none z-0" />

      {/* Main Minimalist Center Stage */}
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center space-y-10">
        
        {/* Hypnotic Emblem / Floating Badge */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#0a1122]/90 border border-[#d4af37]/30 backdrop-blur-xl shadow-2xl shadow-[#d4af37]/10 transition-transform duration-500 hover:scale-105">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-80" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4af37]" />
          </span>
          <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-gray-200">
            {config.company_name || 'VILLABYTE'} &bull; INGENIERÍA CRÍTICA DE SOFTWARE
          </span>
          <span className="w-px h-3 bg-white/20" />
          <span className="text-[10px] font-mono text-[#d4af37] tracking-wider font-semibold">
            B2B &bull; 99.98% SLA
          </span>
        </div>

        {/* Minimalist Hypnotic Typography */}
        <div className="space-y-6 max-w-4xl">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-white tracking-tight leading-[1.08]">
            Ingeniería IT a la{' '}
            <span className="relative inline-block bg-gradient-to-r from-[#ffffff] via-[#f7e7a9] to-[#d4af37] bg-clip-text text-transparent">
              Medida Exacta
            </span>
          </h1>

          <p className="text-gray-300 font-light text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed tracking-wide text-balance">
            {config.hero_subtitle ||
              'Desarrollamos algoritmos avanzados, sistemas robustos y plataformas web corporativas. Trazabilidad y control absoluto de sus procesos.'}
          </p>
        </div>

        {/* Minimalist Interactive Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 w-full max-w-md">
          <button
            onClick={onOpenContact}
            className="w-full sm:w-auto px-9 py-4 rounded-full bg-[#d4af37] hover:bg-[#f3c623] text-[#030712] font-semibold text-xs tracking-[0.18em] uppercase transition-all duration-300 shadow-xl shadow-[#d4af37]/25 hover:shadow-[#d4af37]/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
          >
            <span>Iniciar Consulta</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          <button
            onClick={onExplorePortfolio}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/[0.03] hover:bg-white/[0.08] text-white/90 hover:text-white border border-white/15 hover:border-[#d4af37]/60 backdrop-blur-md font-semibold text-xs tracking-[0.18em] uppercase transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Layers className="w-4 h-4 text-[#d4af37]" />
            <span>Explorar Casos</span>
          </button>
        </div>

        {/* Hypnotic Telemetry Ribbon (Minimalist, sleek, high-tech) */}
        <div className="pt-8 border-t border-white/10 w-full max-w-3xl grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <span className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">FastAPI</span>
            <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase mt-1">Microservicios</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xl sm:text-2xl font-mono font-bold text-[#d4af37] tracking-tight">PostgreSQL</span>
            <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase mt-1">Persistencia ACID</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">100%</span>
            <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase mt-1">Trazabilidad</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xl sm:text-2xl font-mono font-bold text-emerald-400 tracking-tight">Zero-Trust</span>
            <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase mt-1">Seguridad</span>
          </div>
        </div>

      </div>

      {/* Subtle Bottom Ambient Fade into Next Section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a1122] to-transparent pointer-events-none z-10" />
    </header>
  );
};
