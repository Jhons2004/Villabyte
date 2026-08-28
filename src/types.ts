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
  client_logo?: string;
  description: string;
  technologies: string[];
  tech_docs: string;
  architecture_details?: string;
  status: string;
  live_url?: string;
  images: string[];
  enable_iframe?: boolean;
  created_at: string;
}

export interface TrustedClient {
  id: string;
  name: string;
  logo_url: string;
  industry?: string;
  website_url?: string;
  featured: boolean;
}
