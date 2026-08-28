export interface GlobalConfig {
  company_name: string;
  hero_title: string;
  hero_subtitle: string;
  contact_email: string;
  location: string;
  phone: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  active: boolean;
}

export interface PortfolioProject {
  id: string;
  title: string;
  client: string;
  description: string;
  technologies: string[];
  tech_docs: string;
  status: string;
  created_at: string;
}
