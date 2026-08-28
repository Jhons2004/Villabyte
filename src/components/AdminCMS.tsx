import React, { useState } from 'react';
import { GlobalConfig, ServiceItem, PortfolioProject, TrustedClient } from '../types';
import {
  Settings,
  Layers,
  Briefcase,
  Plus,
  Trash2,
  Edit2,
  Save,
  RefreshCw,
  CheckCircle,
  ArrowLeft,
  LogOut,
  Lock,
  Building2,
  Image,
  ExternalLink,
  ShieldCheck,
  Server,
  Code
} from 'lucide-react';

interface AdminCMSProps {
  config: GlobalConfig;
  onUpdateConfig: (newConfig: GlobalConfig) => void;
  services: ServiceItem[];
  onAddService: (service: Omit<ServiceItem, 'id'>) => void;
  onDeleteService: (id: string) => void;
  projects: PortfolioProject[];
  onAddProject: (project: Omit<PortfolioProject, 'id'>) => void;
  onDeleteProject: (id: string) => void;
  trustedClients: TrustedClient[];
  onAddTrustedClient: (client: Omit<TrustedClient, 'id'>) => void;
  onDeleteTrustedClient: (id: string) => void;
  onClose?: () => void;
}

export const AdminCMS: React.FC<AdminCMSProps> = ({
  config,
  onUpdateConfig,
  services,
  onAddService,
  onDeleteService,
  projects,
  onAddProject,
  onDeleteProject,
  trustedClients,
  onAddTrustedClient,
  onDeleteTrustedClient,
  onClose
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<'config' | 'services' | 'projects' | 'clients'>('config');
  const [configForm, setConfigForm] = useState<GlobalConfig>(config);
  const [savedMessage, setSavedMessage] = useState(false);

  // New Service Form
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    category: 'Inteligencia Artificial',
    icon: 'Bot',
    active: true
  });
  
  // New Project Form (Full Rich Fields)
  const [newProject, setNewProject] = useState({
    title: '',
    client: '',
    client_logo: '',
    description: '',
    technologies: 'FastAPI, PostgreSQL, Next.js, Python SQLAlchemy',
    tech_docs: '',
    architecture_details: '',
    status: 'En Producción (100% Operativo)',
    live_url: '',
    images: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop, https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&auto=format&fit=crop',
    enable_iframe: false
  });

  // New Trusted Client Form (Section 4)
  const [newClient, setNewClient] = useState({
    name: '',
    logo_url: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200&h=200&fit=crop',
    industry: '',
    website_url: '',
    featured: true
  });

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
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const imagesArray = newProject.images
      .split(',')
      .map(img => img.trim())
      .filter(img => img.length > 0);

    onAddProject({
      title: newProject.title,
      client: newProject.client,
      client_logo: newProject.client_logo || undefined,
      description: newProject.description,
      technologies: newProject.technologies.split(',').map(t => t.trim()),
      tech_docs: newProject.tech_docs,
      architecture_details: newProject.architecture_details || undefined,
      status: newProject.status,
      live_url: newProject.live_url || undefined,
      images: imagesArray.length > 0 ? imagesArray : ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop"],
      enable_iframe: newProject.enable_iframe,
      created_at: new Date().toISOString().split('T')[0]
    });

    setNewProject({
      title: '',
      client: '',
      client_logo: '',
      description: '',
      technologies: 'FastAPI, PostgreSQL, Next.js, Python SQLAlchemy',
      tech_docs: '',
      architecture_details: '',
      status: 'En Producción (100% Operativo)',
      live_url: '',
      images: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop',
      enable_iframe: false
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTrustedClient({
      name: newClient.name,
      logo_url: newClient.logo_url,
      industry: newClient.industry || undefined,
      website_url: newClient.website_url || undefined,
      featured: newClient.featured
    });

    setNewClient({
      name: '',
      logo_url: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200&h=200&fit=crop',
      industry: '',
      website_url: '',
      featured: true
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070c1a] text-white flex items-center justify-center px-6 pt-24 pb-12">
        <div className="bg-[#0a1122] border border-[#d4af37]/40 rounded-3xl max-w-md w-full p-8 shadow-2xl relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-6 left-6 text-gray-400 hover:text-white flex items-center gap-1.5 text-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al sitio
            </button>
          )}

          <div className="text-center mb-6 pt-4">
            <div className="w-14 h-14 bg-[#d4af37]/20 text-[#d4af37] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#d4af37]/30">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-serif font-bold">Panel Privado CMS</h2>
            <p className="text-xs text-gray-400 mt-1">Acceso restringido para administración y gestión de contenidos</p>
          </div>

          {loginError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs p-3 rounded-xl mb-4 text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase text-gray-400 mb-1 font-semibold">Correo de Administrador</label>
              <input
                type="email"
                required
                placeholder="admin@villabyte.com"
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
                placeholder="••••••••••••"
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
              {loggingIn ? 'Autenticando...' : 'Acceder al CMS'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070c1a] text-white pt-28 pb-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0a1122] p-6 rounded-2xl border border-white/10 shadow-xl">
          <div>
            <h1 className="text-3xl font-serif font-bold">Headless CMS — VILLABYTE</h1>
            <p className="text-gray-400 text-sm">Gestión dinámica de configuración global, servicios, portafolio y empresas aliadas.</p>
          </div>

          <div className="flex items-center gap-3">
            {onClose && (
              <button
                onClick={onClose}
                className="bg-[#152033] hover:bg-[#1f2d45] border border-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-[#d4af37]" /> Volver al Sitio Web
              </button>
            )}
            <button
              onClick={() => setIsAuthenticated(false)}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Cerrar Sesión
            </button>
          </div>
        </div>

        {savedMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 p-4 rounded-xl flex items-center gap-3 animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium">Cambios guardados y sincronizados exitosamente.</span>
          </div>
        )}

        {/* CMS Navigation Tabs (4 Sections) */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'config'
                ? 'bg-[#d4af37] text-[#0a1122] shadow-lg'
                : 'bg-[#152033] text-gray-300 hover:bg-[#1f2d45]'
            }`}
          >
            <Settings className="w-4 h-4" /> 1. Configuración Global
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'services'
                ? 'bg-[#d4af37] text-[#0a1122] shadow-lg'
                : 'bg-[#152033] text-gray-300 hover:bg-[#1f2d45]'
            }`}
          >
            <Layers className="w-4 h-4" /> 2. Servicios ({services.length})
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'projects'
                ? 'bg-[#d4af37] text-[#0a1122] shadow-lg'
                : 'bg-[#152033] text-gray-300 hover:bg-[#1f2d45]'
            }`}
          >
            <Briefcase className="w-4 h-4" /> 3. Portafolio & Proyectos ({projects.length})
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'clients'
                ? 'bg-[#d4af37] text-[#0a1122] shadow-lg'
                : 'bg-[#152033] text-gray-300 hover:bg-[#1f2d45]'
            }`}
          >
            <Building2 className="w-4 h-4" /> 4. Empresas que Confían ({trustedClients.length})
          </button>
        </div>

        {/* Tab 1: Global Config */}
        {activeTab === 'config' && (
          <div className="bg-[#0a1122] p-8 rounded-3xl border border-white/10 shadow-2xl">
            <h2 className="text-xl font-serif font-bold text-[#d4af37] mb-6">Información Institucional & Hero</h2>
            <form onSubmit={handleConfigSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase text-gray-400 font-semibold mb-2">Nombre de la Empresa</label>
                  <input
                    type="text"
                    value={configForm.company_name}
                    onChange={(e) => setConfigForm({ ...configForm, company_name: e.target.value })}
                    className="w-full bg-[#152033] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-400 font-semibold mb-2">Correo de Contacto B2B</label>
                  <input
                    type="email"
                    value={configForm.contact_email}
                    onChange={(e) => setConfigForm({ ...configForm, contact_email: e.target.value })}
                    className="w-full bg-[#152033] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-400 font-semibold mb-2">Ubicación / Modalidad</label>
                  <input
                    type="text"
                    value={configForm.location}
                    onChange={(e) => setConfigForm({ ...configForm, location: e.target.value })}
                    className="w-full bg-[#152033] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-400 font-semibold mb-2">Teléfono de Contacto</label>
                  <input
                    type="text"
                    value={configForm.phone}
                    onChange={(e) => setConfigForm({ ...configForm, phone: e.target.value })}
                    className="w-full bg-[#152033] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-gray-400 font-semibold mb-2">Título Principal (Hero H1)</label>
                <input
                  type="text"
                  value={configForm.hero_title}
                  onChange={(e) => setConfigForm({ ...configForm, hero_title: e.target.value })}
                  className="w-full bg-[#152033] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-gray-400 font-semibold mb-2">Subtítulo / Propuesta de Valor</label>
                <textarea
                  rows={3}
                  value={configForm.hero_subtitle}
                  onChange={(e) => setConfigForm({ ...configForm, hero_subtitle: e.target.value })}
                  className="w-full bg-[#152033] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="bg-[#d4af37] hover:bg-[#f3c623] text-[#0a1122] font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl transition-colors flex items-center gap-2 shadow-lg"
                >
                  <Save className="w-4 h-4" /> Guardar Configuración
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Services */}
        {activeTab === 'services' && (
          <div className="space-y-8">
            <div className="bg-[#0a1122] p-8 rounded-3xl border border-white/10 shadow-2xl">
              <h2 className="text-xl font-serif font-bold text-[#d4af37] mb-6">Agregar Nuevo Servicio</h2>
              <form onSubmit={handleServiceSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase text-gray-400 font-semibold mb-2">Título del Servicio</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Agentes IA Autónomos"
                      value={newService.title}
                      onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                      className="w-full bg-[#152033] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-gray-400 font-semibold mb-2">Categoría</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Inteligencia Artificial"
                      value={newService.category}
                      onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                      className="w-full bg-[#152033] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase text-gray-400 font-semibold mb-2">Descripción del Servicio</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Descripción técnica del alcance del servicio..."
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    className="w-full bg-[#152033] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#d4af37] hover:bg-[#f3c623] text-[#0a1122] font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Agregar Servicio
                  </button>
                </div>
              </form>
            </div>

            {/* List Services */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((srv) => (
                <div key={srv.id} className="bg-[#0a1122] border border-white/10 p-6 rounded-2xl flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#d4af37]/20 text-[#d4af37] px-2.5 py-1 rounded-md">
                      {srv.category}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2">{srv.title}</h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{srv.description}</p>
                  </div>
                  <button
                    onClick={() => onDeleteService(srv.id)}
                    className="p-2 text-gray-400 hover:text-red-400 bg-[#152033] hover:bg-red-500/10 rounded-xl border border-white/10 transition-colors ml-4"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Projects & Portfolio */}
        {activeTab === 'projects' && (
          <div className="space-y-8">
            <div className="bg-[#0a1122] p-8 rounded-3xl border border-white/10 shadow-2xl">
              <h2 className="text-xl font-serif font-bold text-[#d4af37] mb-6">Registrar Proyecto con Documentación & Carrusel</h2>
              <form onSubmit={handleProjectSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase text-gray-400 font-semibold mb-2">Título del Proyecto</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Dirección del Sistema Nacional de la Calidad"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      className="w-full bg-[#152033] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-gray-400 font-semibold mb-2">Cliente / Entidad</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Gobierno / Ministerio / Corporación X"
                      value={newProject.client}
                      onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                      className="w-full bg-[#152033] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-gray-400 font-semibold mb-2">URL del Logo del Cliente (Opcional)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... o URL de imagen"
                      value={newProject.client_logo}
                      onChange={(e) => setNewProject({ ...newProject, client_logo: e.target.value })}
                      className="w-full bg-[#152033] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-gray-400 font-semibold mb-2">Estado Operativo / ¿Funciona?</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. En Producción (99.9% Uptime)"
                      value={newProject.status}
                      onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                      className="w-full bg-[#152033] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase text-gray-400 font-semibold mb-2">Descripción General del Proyecto</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Detalle los objetivos del desarrollo y alcance de la solución..."
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full bg-[#152033] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase text-gray-400 font-semibold mb-2">Tecnologías (Separadas por comas)</label>
                    <input
                      type="text"
                      required
                      placeholder="FastAPI, PostgreSQL, Next.js, Docker, Python SQLAlchemy"
                      value={newProject.technologies}
                      onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                      className="w-full bg-[#152033] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-gray-400 font-semibold mb-2">URL del Sitio en Vivo / Demo (Opcional)</label>
                    <input
                      type="url"
                      placeholder="https://sistema-cliente.com"
                      value={newProject.live_url}
                      onChange={(e) => setNewProject({ ...newProject, live_url: e.target.value })}
                      className="w-full bg-[#152033] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase text-gray-400 font-semibold mb-2">Documentación Técnica / Auditoría</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Especificación de microservicios, seguridad, endpoints y persistencia de datos..."
                    value={newProject.tech_docs}
                    onChange={(e) => setNewProject({ ...newProject, tech_docs: e.target.value })}
                    className="w-full bg-[#152033] border border-white/10 rounded-xl p-3.5 text-sm text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-gray-400 font-semibold mb-2">Detalle de Arquitectura de Capas</label>
                  <textarea
                    rows={2}
                    placeholder="Ej. Frontend React -> Backend FastAPI -> Repositorio SQLAlchemy -> PostgreSQL..."
                    value={newProject.architecture_details}
                    onChange={(e) => setNewProject({ ...newProject, architecture_details: e.target.value })}
                    className="w-full bg-[#152033] border border-white/10 rounded-xl p-3.5 text-sm text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-gray-400 font-semibold mb-2">Carrusel de Fotos (URLs separadas por coma)</label>
                  <textarea
                    rows={2}
                    placeholder="https://images.unsplash.com/..., https://images.unsplash.com/..."
                    value={newProject.images}
                    onChange={(e) => setNewProject({ ...newProject, images: e.target.value })}
                    className="w-full bg-[#152033] border border-white/10 rounded-xl p-3.5 text-sm text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="iframeCheck"
                    checked={newProject.enable_iframe}
                    onChange={(e) => setNewProject({ ...newProject, enable_iframe: e.target.checked })}
                    className="w-4 h-4 rounded text-[#d4af37] focus:ring-[#d4af37]"
                  />
                  <label htmlFor="iframeCheck" className="text-xs text-gray-300 cursor-pointer">
                    Habilitar visor de ventana embebida (Iframe interactivo) en la ficha del proyecto
                  </label>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="bg-[#d4af37] hover:bg-[#f3c623] text-[#0a1122] font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <Plus className="w-4 h-4" /> Registrar Proyecto en Portafolio
                  </button>
                </div>
              </form>
            </div>

            {/* List Projects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <div key={proj.id} className="bg-[#0a1122] border border-white/10 p-6 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#d4af37]/20 text-[#d4af37] px-2.5 py-1 rounded-md">
                        {proj.client}
                      </span>
                      <span className="text-xs text-emerald-400 font-semibold">{proj.status}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">{proj.title}</h3>
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">{proj.description}</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {proj.technologies.map((t, idx) => (
                        <span key={idx} className="text-[10px] bg-[#152033] text-gray-300 px-2 py-0.5 rounded border border-white/5">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 mt-4 border-t border-white/10">
                    <span className="text-[11px] text-gray-500 font-mono">
                      {proj.images?.length || 1} fotos en carrusel
                    </span>
                    <button
                      onClick={() => onDeleteProject(proj.id)}
                      className="p-2 text-gray-400 hover:text-red-400 bg-[#152033] hover:bg-red-500/10 rounded-xl border border-white/10 transition-colors"
                      title="Eliminar Proyecto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Empresas que Confían en Nosotros (Requested Feature!) */}
        {activeTab === 'clients' && (
          <div className="space-y-8">
            <div className="bg-[#0a1122] p-8 rounded-3xl border border-white/10 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center border border-[#d4af37]/30">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#d4af37]">Empresas y Aliados que Confían en VILLABYTE</h2>
                  <p className="text-xs text-gray-400">Agregue empresas y entidades con su logo y nombre para exhibirlas en la vitrina de confianza.</p>
                </div>
              </div>

              <form onSubmit={handleClientSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase text-gray-400 font-semibold mb-2">Nombre de la Empresa o Entidad</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Dirección Nacional de Calidad, Banco X, Logística Y..."
                      value={newClient.name}
                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      className="w-full bg-[#152033] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-gray-400 font-semibold mb-2">Sector / Industria (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej. Sector Gubernamental, Finanzas, Logística..."
                      value={newClient.industry}
                      onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })}
                      className="w-full bg-[#152033] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-gray-400 font-semibold mb-2">URL del Logo de la Empresa</label>
                    <input
                      type="url"
                      required
                      placeholder="https://... URL de imagen PNG, SVG o JPEG del logo"
                      value={newClient.logo_url}
                      onChange={(e) => setNewClient({ ...newClient, logo_url: e.target.value })}
                      className="w-full bg-[#152033] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-gray-400 font-semibold mb-2">Sitio Web Oficial (Opcional)</label>
                    <input
                      type="url"
                      placeholder="https://empresa-cliente.com"
                      value={newClient.website_url}
                      onChange={(e) => setNewClient({ ...newClient, website_url: e.target.value })}
                      className="w-full bg-[#152033] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                {/* Logo Preview */}
                {newClient.logo_url && (
                  <div className="bg-[#152033] p-4 rounded-xl border border-white/10 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-[#0a1122] p-2 flex items-center justify-center border border-white/10">
                      <img src={newClient.logo_url} alt="preview" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="text-xs text-[#d4af37] font-bold">Vista previa del Logo</div>
                      <div className="text-xs text-gray-400">Así se visualizará en la vitrina pública del sitio web.</div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-[#d4af37] hover:bg-[#f3c623] text-[#0a1122] font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <Plus className="w-4 h-4" /> Agregar Empresa Aliada
                  </button>
                </div>
              </form>
            </div>

            {/* List Trusted Clients */}
            <div>
              <h3 className="text-lg font-serif font-bold text-white mb-4">Empresas Registradas ({trustedClients.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {trustedClients.map((client) => (
                  <div
                    key={client.id}
                    className="bg-[#0a1122] border border-white/10 hover:border-[#d4af37]/40 p-5 rounded-2xl flex flex-col justify-between items-center text-center relative group"
                  >
                    <button
                      onClick={() => onDeleteTrustedClient(client.id)}
                      className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-400 bg-[#152033] hover:bg-red-500/20 rounded-lg border border-white/10 transition-colors opacity-0 group-hover:opacity-100"
                      title="Eliminar empresa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-16 h-16 rounded-xl bg-[#152033] p-2.5 flex items-center justify-center border border-white/10 mb-3 mt-2">
                      <img
                        src={client.logo_url}
                        alt={client.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{client.name}</h4>
                      {client.industry && (
                        <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{client.industry}</p>
                      )}
                    </div>

                    {client.website_url && (
                      <a
                        href={client.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 text-[10px] text-[#d4af37] flex items-center gap-1 hover:underline"
                      >
                        <span>Visitar Web</span> <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
