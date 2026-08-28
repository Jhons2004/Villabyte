import React, { useState, useEffect } from 'react';
import { GlobalConfig, ServiceItem, PortfolioProject } from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { PortfolioSection } from './components/PortfolioSection';
import { Footer } from './components/Footer';
import { AdminCMS } from './components/AdminCMS';
import { ArchitectureView } from './components/ArchitectureView';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'admin' | 'architecture'>('landing');

  // CMS state
  const [config, setConfig] = useState<GlobalConfig>({
    company_name: "VILLABYTE",
    hero_title: "Ingeniería IT a la Medida Exacta.",
    hero_subtitle: "Desarrollamos algoritmos avanzados, sistemas robustos y plataformas web corporativas. Trazabilidad y control absoluto de sus procesos.",
    contact_email: "contacto@villabyte.com",
    location: "Bogotá / Remoto B2B",
    phone: "+57 (300) 123-4567"
  });

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data from backend API
  useEffect(() => {
    Promise.all([
      fetch('/api/config').then(res => res.json()),
      fetch('/api/services').then(res => res.json()),
      fetch('/api/projects').then(res => res.json())
    ])
      .then(([configData, servicesData, projectsData]) => {
        if (configData) setConfig(configData);
        if (Array.isArray(servicesData)) setServices(servicesData);
        if (Array.isArray(projectsData)) setProjects(projectsData);
      })
      .catch(err => console.error("Error fetching CMS data:", err))
      .finally(() => setLoading(false));
  }, []);

  // Handlers for CMS updates
  const handleUpdateConfig = async (newConfig: GlobalConfig) => {
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
      }
    } catch (err) {
      console.error("Error updating config:", err);
      setConfig(newConfig); // optimistic update
    }
  };

  const handleAddService = async (serviceData: Omit<ServiceItem, 'id'>) => {
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData)
      });
      const newSrv = await res.json();
      setServices(prev => [...prev, newSrv]);
    } catch (err) {
      console.error("Error adding service:", err);
      const fallback: ServiceItem = { id: `srv-${Date.now()}`, ...serviceData };
      setServices(prev => [...prev, fallback]);
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      await fetch(`/api/services/${id}`, { method: 'DELETE' });
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error("Error deleting service:", err);
      setServices(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleAddProject = async (projectData: Omit<PortfolioProject, 'id'>) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      const newProj = await res.json();
      setProjects(prev => [...prev, newProj]);
    } catch (err) {
      console.error("Error adding project:", err);
      const fallback: PortfolioProject = { id: `proj-${Date.now()}`, created_at: new Date().toISOString().split('T')[0], ...projectData };
      setProjects(prev => [...prev, fallback]);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Error deleting project:", err);
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1122] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-serif text-sm tracking-wider text-gray-300">Cargando Entorno Corporativo VILLABYTE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col antialiased bg-[#0a1122] selection:bg-[#d4af37] selection:text-[#0a1122]">
      
      {/* Navigation */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Main Views */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <>
            <HeroSection
              config={config}
              onExplorePortfolio={() => {
                const el = document.getElementById('portafolio');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenContact={() => {
                const el = document.getElementById('contacto');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <ServicesSection services={services} />
            <PortfolioSection projects={projects} />
            <Footer config={config} onOpenAdmin={() => setCurrentView('admin')} />
          </>
        )}

        {currentView === 'admin' && (
          <AdminCMS
            config={config}
            onUpdateConfig={handleUpdateConfig}
            services={services}
            onAddService={handleAddService}
            onDeleteService={handleDeleteService}
            projects={projects}
            onAddProject={handleAddProject}
            onDeleteProject={handleDeleteProject}
          />
        )}

        {currentView === 'architecture' && (
          <ArchitectureView />
        )}
      </main>

    </div>
  );
}
