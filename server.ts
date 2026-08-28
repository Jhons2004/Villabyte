import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory store for CMS data and persistent state
interface GlobalConfigData {
  company_name: string;
  hero_title: string;
  hero_subtitle: string;
  contact_email: string;
  location: string;
  phone: string;
}

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  active: boolean;
}

interface PortfolioProjectItem {
  id: string;
  title: string;
  client: string;
  description: string;
  technologies: string[];
  tech_docs: string;
  status: string;
  created_at: string;
}

let inMemoryConfig: GlobalConfigData = {
  company_name: "VILLABYTE",
  hero_title: "Ingeniería IT a la Medida Exacta.",
  hero_subtitle: "Desarrollamos algoritmos avanzados, sistemas robustos y plataformas web corporativas. Trazabilidad y control absoluto de sus procesos.",
  contact_email: "contacto@villabyte.com",
  location: "Bogotá / Remoto B2B",
  phone: "+57 (300) 123-4567"
};

let inMemoryServices: ServiceItem[] = [
  {
    id: "srv-1",
    title: "Agentes IA Corporativos",
    description: "Sistemas inteligentes autónomos integrados para automatización de flujos de trabajo complejos y toma de decisiones empresariales.",
    category: "Inteligencia Artificial",
    icon: "Bot",
    active: true
  },
  {
    id: "srv-2",
    title: "Agentes Predictivos",
    description: "Modelos analíticos avanzados para anticipar tendencias de mercado, fallas operativas y comportamientos de usuarios.",
    category: "Inteligencia Artificial",
    icon: "TrendingUp",
    active: true
  },
  {
    id: "srv-3",
    title: "Chatbots con IA Avanzada",
    description: "Asistentes conversacionales con memoria contextual y acceso seguro a bases de conocimiento corporativas.",
    category: "Atención y Automatización",
    icon: "MessageSquare",
    active: true
  },
  {
    id: "srv-4",
    title: "Trazabilidad y Auditoría",
    description: "Algoritmos de control inmutable para registrar cada transacción y evento operativo en tiempo real.",
    category: "Seguridad y Datos",
    icon: "ShieldCheck",
    active: true
  },
  {
    id: "srv-5",
    title: "Transformación Digital Completa",
    description: "Migración, reingeniería y modernización de arquitecturas monolíticas hacia sistemas distribuidos de alta disponibilidad.",
    category: "Ingeniería de Software",
    icon: "Cpu",
    active: true
  }
];

let inMemoryProjects: PortfolioProjectItem[] = [
  {
    id: "proj-1",
    title: "Dirección del Sistema Nacional de la Calidad",
    client: "Gobierno / Entidad Nacional",
    description: "Implementación de un sistema de alto nivel para la gestión, control y trazabilidad de normativas técnicas a escala nacional.",
    technologies: ["FastAPI", "PostgreSQL", "Next.js", "Python SQLAlchemy", "Tailwind CSS"],
    tech_docs: "Arquitectura basada en microservicios backend con FastAPI y validación Pydantic estricta. PostgreSQL como base de datos relacional con índices optimizados para consultas de alta concurrencia. Frontend moderno con renderizado híbrido y seguridad enterprise.",
    status: "En Producción",
    created_at: "2026-01-15"
  },
  {
    id: "proj-2",
    title: "Plataforma de Trazabilidad Logística B2B",
    client: "Corporación Logística Andina",
    description: "Sistema centralizado de control de flujos de inventario y trazabilidad aduanera con alertas en tiempo real.",
    technologies: ["Node.js", "PostgreSQL", "TypeScript", "React"],
    tech_docs: "Diseño relacional con tablas normalizadas para auditoría de eventos y transacciones en tiempo real.",
    status: "Activo",
    created_at: "2026-03-10"
  }
];

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", company: "VILLABYTE", timestamp: new Date().toISOString() });
});

// Admin Login Endpoint
app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;
  if (email === "admin@villabyte.com" && password === "AdminVillabyte2026!") {
    return res.json({
      success: true,
      token: "villabyte-admin-token-2026",
      user: {
        email: "admin@villabyte.com",
        name: "Administrador Villabyte"
      }
    });
  }
  res.status(401).json({
    success: false,
    error: "Credenciales inválidas. Usuario admin: admin@villabyte.com / AdminVillabyte2026!"
  });
});

// Contact SMTP proxy via Google Apps Script API (Exact URL provided by user)
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, company, subject, message, page } = req.body;
    const appsScriptUrl = "https://script.google.com/macros/s/AKfycbznNNt_-UqwNrL9XDnodbrfHi9KrHtCH8xRONz7N7seKT1jSPARnPR2mycLCT1Sk-RR/exec";
    const apiKey = "VILLABYTE_CONTACTO_2026_CAMBIAR_ESTA_CLAVE";

    const payload = {
      apiKey,
      name,
      email,
      phone: phone || "",
      company: company || "",
      subject: subject || "Solicitud B2B desde Villabyte",
      message,
      page: page || "https://villabyte.com",
      website: "" // honeypot
    };

    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    res.json(result);
  } catch (err: any) {
    console.error("Error forwarding contact to Apps Script SMTP:", err);
    res.status(500).json({ ok: false, error: err.message || "Error al enviar correo mediante Apps Script SMTP" });
  }
});

// Global Config Endpoints
app.get("/api/config", (req, res) => {
  res.json(inMemoryConfig);
});

app.put("/api/config", (req, res) => {
  inMemoryConfig = { ...inMemoryConfig, ...req.body };
  res.json({ success: true, data: inMemoryConfig });
});

// Services Endpoints
app.get("/api/services", (req, res) => {
  res.json(inMemoryServices);
});

app.post("/api/services", (req, res) => {
  const newService: ServiceItem = {
    id: `srv-${Date.now()}`,
    ...req.body
  };
  inMemoryServices.push(newService);
  res.status(201).json(newService);
});

app.put("/api/services/:id", (req, res) => {
  const { id } = req.params;
  const index = inMemoryServices.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Servicio no encontrado" });
  }
  inMemoryServices[index] = { ...inMemoryServices[index], ...req.body };
  res.json(inMemoryServices[index]);
});

app.delete("/api/services/:id", (req, res) => {
  const { id } = req.params;
  inMemoryServices = inMemoryServices.filter(s => s.id !== id);
  res.json({ success: true, id });
});

// Portfolio Projects Endpoints (CRUD as requested)
app.get("/api/projects", (req, res) => {
  res.json(inMemoryProjects);
});

app.post("/api/projects", (req, res) => {
  const newProj: PortfolioProjectItem = {
    id: `proj-${Date.now()}`,
    created_at: new Date().toISOString().split('T')[0],
    ...req.body
  };
  inMemoryProjects.push(newProj);
  res.status(201).json(newProj);
});

app.put("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  const index = inMemoryProjects.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Proyecto no encontrado" });
  }
  inMemoryProjects[index] = { ...inMemoryProjects[index], ...req.body };
  res.json(inMemoryProjects[index]);
});

app.delete("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  inMemoryProjects = inMemoryProjects.filter(p => p.id !== id);
  res.json({ success: true, id });
});

// FastAPI & SQLAlchemy Architecture Reference Code API
app.get("/api/architecture/fastapi-code", (req, res) => {
  res.json({
    models: `
# ==========================================
# 1. MODELOS DE BASE DE DATOS (SQLAlchemy)
# ==========================================
from sqlalchemy import Column, String, Text, Boolean, DateTime, ARRAY
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class GlobalConfigModel(Base):
    __tablename__ = "global_config"
    id = Column(String, primary_key=True, default="main")
    company_name = Column(String(100), nullable=False, default="VILLABYTE")
    hero_title = Column(String(255), nullable=False)
    hero_subtitle = Column(Text, nullable=False)
    contact_email = Column(String(100), nullable=False)
    location = Column(String(100), nullable=False)
    phone = Column(String(50), nullable=True)

class ServiceModel(Base):
    __tablename__ = "services"
    id = Column(String, primary_key=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    icon = Column(String(50), nullable=False, default="Cpu")
    active = Column(Boolean, default=True)

class PortfolioProjectModel(Base):
    __tablename__ = "portfolio_projects"
    id = Column(String, primary_key=True)
    title = Column(String(200), nullable=False)
    client = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    technologies = Column(ARRAY(String), nullable=False)
    tech_docs = Column(Text, nullable=False)
    status = Column(String(50), default="En Producción")
    created_at = Column(DateTime, default=datetime.utcnow)
`,
    schemas: `
# ==========================================
# 2. ESQUEMAS DE VALIDACIÓN (Pydantic)
# ==========================================
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

class GlobalConfigBase(BaseModel):
    company_name: str
    hero_title: str
    hero_subtitle: str
    contact_email: EmailStr
    location: str
    phone: Optional[str] = None

class ServiceCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    description: str
    category: str
    icon: str = "Cpu"
    active: bool = True

class PortfolioProjectCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    client: str
    description: str
    technologies: List[str]
    tech_docs: str
    status: Optional[str] = "En Producción"
`,
    router: `
# ==========================================
# 3. ENDPOINTS CRUD (FastAPI Router)
# ==========================================
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

router = APIRouter(prefix="/api/projects", tags=["Portfolio Projects"])

@router.get("/", response_model=List[PortfolioProjectSchema])
def get_projects(db: Session = Depends(get_db)):
    return db.query(PortfolioProjectModel).all()

@router.post("/", response_model=PortfolioProjectSchema, status_code=201)
def create_project(project: PortfolioProjectCreate, db: Session = Depends(get_db)):
    db_project = PortfolioProjectModel(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.put("/{project_id}", response_model=PortfolioProjectSchema)
def update_project(project_id: str, project: PortfolioProjectCreate, db: Session = Depends(get_db)):
    db_project = db.query(PortfolioProjectModel).filter(PortfolioProjectModel.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    for key, value in project.dict().items():
        setattr(db_project, key, value)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.delete("/{project_id}")
def delete_project(project_id: str, db: Session = Depends(get_db)):
    db_project = db.query(PortfolioProjectModel).filter(PortfolioProjectModel.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    db.delete(db_project)
    db.commit()
    return {"success": True, "id": project_id}
`
  });
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[VILLABYTE SERVER] Running on http://localhost:${PORT}`);
  });
}

startServer();
