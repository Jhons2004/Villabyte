import React, { useState } from 'react';
import { GlobalConfig, ServiceItem, PortfolioProject } from '../types';
import { Settings, Layers, Briefcase, Plus, Trash2, Edit2, Save, RefreshCw, CheckCircle, Database } from 'lucide-react';

interface AdminCMSProps {
  config: GlobalConfig;
  onUpdateConfig: (newConfig: GlobalConfig) => void;
  services: ServiceItem[];
  onAddService: (service: Omit<ServiceItem, 'id'>) => void;
  onDeleteService: (id: string) => void;
  projects: PortfolioProject[];
  onAddProject: (project: Omit<PortfolioProject, 'id'>) => void;
  onDeleteProject: (id: string) => void;
}

export const AdminCMS: React.FC<AdminCMSProps> = ({
  config,
  onUpdateConfig,
  services,
  onAddService,
  onDeleteService,
  projects,
  onAddProject,
  onDeleteProject
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('admin@villabyte.com');
  const [loginPassword, setLoginPassword] = useState('AdminVillabyte2026!');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<'config' | 'services' | 'projects'>('config');
  const [configForm, setConfigForm] = useState<GlobalConfig>(config);
  const [savedMessage, setSavedMessage] = useState(false);

  // New Service Form
  const [newService, setNewService] = useState({ title: '', description: '', category: 'Inteligencia Artificial', icon: 'Bot', active: true });
  
  // New Project Form
  const [newProject, setNewProject] = useState({ title: '', client: '', description: '', technologies: 'FastAPI, PostgreSQL, Next.js', tech_docs: '', status: 'En Producción' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || 'Credenciales inválidas');
      }
    } catch (err) {
      setLoginError('Error al conectar con el servidor');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleConfigSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(configForm);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddService(newService);
    setNewService({ title: '', description: '', category: 'Inteligencia Artificial', icon: 'Bot', active: true });
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProject({
      ...newProject,
      technologies: newProject.technologies.split(',').map(t => t.trim())
    });
    setNewProject({ title: '', client: '', description: '', technologies: 'FastAPI, PostgreSQL, Next.js', tech_docs: '', status: 'En Producción' });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070c1a] text-white flex items-center justify-center px-6 pt-24">
        <div className="bg-[#0a1122] border border-[#d4af37]/40 rounded-2xl max-w-md w-full p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-[#d4af37]/20 text-[#d4af37] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#d4af37]/30">
              <Settings className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-serif font-bold">Panel Administrador B2B</h2>
            <p className="text-xs text-gray-400 mt-1">Ingrese con sus credenciales de administrador</p>
          </div>

          <div className="bg-[#152033] p-4 rounded-xl border border-white/10 mb-6 text-xs text-gray-300 space-y-1">
            <p className="text-[#d4af37] font-bold">Credenciales Administrador:</p>
            <p>Usuario: <span className="font-mono text-white">admin@villabyte.com</span></p>
            <p>Contraseña: <span className="font-mono text-white">AdminVillabyte2026!</span></p>
          </div>

          {loginError && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-xs text-red-300">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase text-gray-400 mb-1 font-semibold">Correo Administrador</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-[#152033] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-gray-400 mb-1 font-semibold">Contraseña</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-[#152033] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full bg-[#d4af37] hover:bg-[#f3c623] text-[#0a1122] font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loggingIn ? 'Autenticando...' : 'Iniciar Sesión Admin CMS'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070c1a] text-white pt-28 pb-16 px-6 md:px-12 lg:px-24">
      <div className="container mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-white/10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/20 text-[#d4af37] text-xs font-bold uppercase mb-2">
              Panel Administrativo Privado
            </div>
            <h1 className="text-3xl font-serif font-bold">Headless CMS — VILLABYTE</h1>
            <p className="text-gray-400 text-sm">Gestione dinámicamente toda la configuración global, servicios y proyectos del portafolio.</p>
          </div>
        </div>

        {savedMessage && (
          <div className="mb-6 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-4 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-semibold">¡Cambios guardados y sincronizados con éxito en el CMS!</span>
          </div>
        )}

        {/* CMS Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs uppercase tracking-wider font-bold transition-all ${
              activeTab === 'config' 
                ? 'bg-[#d4af37] text-[#0a1122] shadow-lg shadow-[#d4af37]/20' 
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            <Settings className="w-4 h-4" /> 1. Configuración Global
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs uppercase tracking-wider font-bold transition-all ${
              activeTab === 'services' 
                ? 'bg-[#d4af37] text-[#0a1122] shadow-lg shadow-[#d4af37]/20' 
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            <Layers className="w-4 h-4" /> 2. Capacidades y Servicios ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs uppercase tracking-wider font-bold transition-all ${
              activeTab === 'projects' 
                ? 'bg-[#d4af37] text-[#0a1122] shadow-lg shadow-[#d4af37]/20' 
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            <Briefcase className="w-4 h-4" /> 3. Portafolio de Proyectos ({projects.length})
          </button>
        </div>

        {/* Tab 1: Global Config */}
        {activeTab === 'config' && (
          <div className="bg-[#0a1122] border border-white/10 rounded-2xl p-8 shadow-2xl max-w-3xl">
            <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#d4af37]" /> Editar Configuración Global & Hero
            </h2>
            <p className="text-xs text-gray-400 mb-6">Los cambios se reflejarán instantáneamente en la Landing Page corporativa.</p>

            <form onSubmit={handleConfigSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-1 font-semibold">Nombre de Empresa</label>
                  <input
                    type="text"
                    value={configForm.company_name}
                    onChange={(e) => setConfigForm({ ...configForm, company_name: e.target.value })}
                    className="w-full bg-[#152033] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-1 font-semibold">Correo de Contacto</label>
                  <input
                    type="email"
                    value={configForm.contact_email}
                    onChange={(e) => setConfigForm({ ...configForm, contact_email: e.target.value })}
                    className="w-full bg-[#152033] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1 font-semibold">Título Principal (Hero Title)</label>
                <input
                  type="text"
                  value={configForm.hero_title}
                  onChange={(e) => setConfigForm({ ...configForm, hero_title: e.target.value })}
                  className="w-full bg-[#152033] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1 font-semibold">Subtítulo Descriptivo (Hero Subtitle)</label>
                <textarea
                  rows={3}
                  value={configForm.hero_subtitle}
                  onChange={(e) => setConfigForm({ ...configForm, hero_subtitle: e.target.value })}
                  className="w-full bg-[#152033] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-1 font-semibold">Ubicación</label>
                  <input
                    type="text"
                    value={configForm.location}
                    onChange={(e) => setConfigForm({ ...configForm, location: e.target.value })}
                    className="w-full bg-[#152033] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-1 font-semibold">Teléfono</label>
                  <input
                    type="text"
                    value={configForm.phone}
                    onChange={(e) => setConfigForm({ ...configForm, phone: e.target.value })}
                    className="w-full bg-[#152033] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-[#d4af37] hover:bg-[#f3c623] text-[#0a1122] font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Guardar Configuración Global
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Services / Capabilities */}
        {activeTab === 'services' && (
          <div className="space-y-8">
            <div className="bg-[#0a1122] border border-white/10 rounded-2xl p-6 shadow-xl max-w-2xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#d4af37]" /> Añadir Nueva Solución / Servicio
              </h3>
              <form onSubmit={handleServiceSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Título del Servicio"
                    required
                    value={newService.title}
                    onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                    className="bg-[#152033] border border-white/10 rounded-lg p-3 text-sm text-white"
                  />
                  <input
                    type="text"
                    placeholder="Categoría (Ej. Inteligencia Artificial)"
                    required
                    value={newService.category}
                    onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                    className="bg-[#152033] border border-white/10 rounded-lg p-3 text-sm text-white"
                  />
                </div>
                <textarea
                  placeholder="Descripción técnica del servicio..."
                  required
                  rows={2}
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  className="w-full bg-[#152033] border border-white/10 rounded-lg p-3 text-sm text-white"
                />
                <button
                  type="submit"
                  className="bg-[#d4af37] text-[#0a1122] font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg hover:bg-[#f3c623]"
                >
                  Registrar Servicio en CMS
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((srv) => (
                <div key={srv.id} className="bg-[#0a1122] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#d4af37]">{srv.category}</span>
                    <h4 className="text-lg font-bold font-serif mt-1 mb-2">{srv.title}</h4>
                    <p className="text-xs text-gray-400 font-light mb-4">{srv.description}</p>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <span className="text-xs text-emerald-400 font-semibold">Activo</span>
                    <button
                      onClick={() => onDeleteService(srv.id)}
                      className="text-red-400 hover:text-red-300 p-2 rounded-lg bg-red-500/10"
                      title="Eliminar servicio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Portfolio Projects CRUD */}
        {activeTab === 'projects' && (
          <div className="space-y-8">
            <div className="bg-[#0a1122] border border-white/10 rounded-2xl p-6 shadow-xl max-w-3xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#d4af37]" /> Registrar Caso de Éxito en Portafolio
              </h3>
              <form onSubmit={handleProjectSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Título del Proyecto"
                    required
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    className="bg-[#152033] border border-white/10 rounded-lg p-3 text-sm text-white"
                  />
                  <input
                    type="text"
                    placeholder="Cliente o Institución"
                    required
                    value={newProject.client}
                    onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                    className="bg-[#152033] border border-white/10 rounded-lg p-3 text-sm text-white"
                  />
                </div>
                <textarea
                  placeholder="Descripción ejecutiva del proyecto..."
                  required
                  rows={2}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full bg-[#152033] border border-white/10 rounded-lg p-3 text-sm text-white"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Tecnologías (separadas por coma)"
                    value={newProject.technologies}
                    onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                    className="bg-[#152033] border border-white/10 rounded-lg p-3 text-sm text-white"
                  />
                  <input
                    type="text"
                    placeholder="Estado (Ej. En Producción)"
                    value={newProject.status}
                    onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                    className="bg-[#152033] border border-white/10 rounded-lg p-3 text-sm text-white"
                  />
                </div>
                <textarea
                  placeholder="Documentación técnica y funcional detallada..."
                  required
                  rows={3}
                  value={newProject.tech_docs}
                  onChange={(e) => setNewProject({ ...newProject, tech_docs: e.target.value })}
                  className="w-full bg-[#152033] border border-white/10 rounded-lg p-3 text-sm text-white font-mono text-xs"
                />
                <button
                  type="submit"
                  className="bg-[#d4af37] text-[#0a1122] font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg hover:bg-[#f3c623]"
                >
                  Crear Proyecto en el CMS
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj) => (
                <div key={proj.id} className="bg-[#0a1122] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase font-bold text-[#d4af37] px-2 py-0.5 bg-[#d4af37]/10 rounded">
                        {proj.client}
                      </span>
                      <span className="text-xs text-gray-400">{proj.status}</span>
                    </div>
                    <h4 className="text-xl font-bold font-serif mb-2">{proj.title}</h4>
                    <p className="text-xs text-gray-300 font-light mb-4">{proj.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {proj.technologies.map((t, idx) => (
                        <span key={idx} className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-300">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <span className="text-xs text-gray-500 font-mono">ID: {proj.id}</span>
                    <button
                      onClick={() => onDeleteProject(proj.id)}
                      className="text-red-400 hover:text-red-300 p-2 rounded-lg bg-red-500/10 flex items-center gap-1 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
