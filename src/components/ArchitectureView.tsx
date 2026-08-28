import React, { useEffect, useState } from 'react';
import { Database, Code, Terminal, CheckCircle2, Shield } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [codeData, setCodeData] = useState({ models: '', schemas: '', router: '' });

  useEffect(() => {
    fetch('/api/architecture/fastapi-code')
      .then(res => res.json())
      .then(data => setCodeData(data))
      .catch(err => console.error("Error loading architecture code:", err));
  }, []);

  return (
    <div className="min-h-screen bg-[#070c1a] text-white pt-28 pb-16 px-6 md:px-12 lg:px-24">
      <div className="container mx-auto max-w-5xl">
        
        <div className="mb-10 pb-6 border-b border-white/10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/20 text-[#d4af37] text-xs font-bold uppercase mb-2">
            Arquitectura de Software Full-Stack (FastAPI + SQLAlchemy + PostgreSQL)
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold">Arquitectura Backend de VILLABYTE</h1>
          <p className="text-gray-400 text-sm mt-2">
            Modelos de base de datos relacionales robustos y optimizados para escalar consultas de alto volumen en Neon PostgreSQL.
          </p>
        </div>

        <div className="space-y-12">
          
          {/* Models */}
          <div className="bg-[#0a1122] border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-serif flex items-center gap-2 text-[#d4af37]">
                <Database className="w-5 h-5" /> 1. Modelos de Base de Datos (SQLAlchemy)
              </h2>
              <span className="text-xs uppercase bg-white/5 px-3 py-1 rounded text-gray-300">GlobalConfig, Service, PortfolioProject</span>
            </div>
            <pre className="bg-[#0d1117] p-5 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed border border-white/5">
              {codeData.models || "Cargando modelos SQLAlchemy..."}
            </pre>
          </div>

          {/* Schemas */}
          <div className="bg-[#0a1122] border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-serif flex items-center gap-2 text-[#d4af37]">
                <Code className="w-5 h-5" /> 2. Esquemas de Validación (Pydantic)
              </h2>
              <span className="text-xs uppercase bg-white/5 px-3 py-1 rounded text-gray-300">Validación de Entrada y Salida</span>
            </div>
            <pre className="bg-[#0d1117] p-5 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed border border-white/5">
              {codeData.schemas || "Cargando esquemas Pydantic..."}
            </pre>
          </div>

          {/* Router */}
          <div className="bg-[#0a1122] border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-serif flex items-center gap-2 text-[#d4af37]">
                <Terminal className="w-5 h-5" /> 3. Enrutador CRUD (FastAPI Router)
              </h2>
              <span className="text-xs uppercase bg-white/5 px-3 py-1 rounded text-gray-300">REST API Endpoints</span>
            </div>
            <pre className="bg-[#0d1117] p-5 rounded-xl text-xs font-mono text-purple-300 overflow-x-auto leading-relaxed border border-white/5">
              {codeData.router || "Cargando enrutador FastAPI..."}
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
};
