export type ProjectCategory = 'all' | 'logo' | 'branding' | 'social' | 'print' | 'packaging' | 'other';

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: 'logo' | 'branding' | 'social' | 'print' | 'packaging' | 'other';
  description: string;
  problemStatement?: string;
  solutionStatement?: string;
  resultsStatement?: string;
  coverImage: string;
  tags: string[];
  client: string;
  year: string;
  role: string;
  liveUrl?: string;
  repoUrl?: string;
  featured?: boolean;
  createdAt: number;
}

export interface SkillCategory {
  title: string;
  titleEn: string;
  skills: {
    name: string;
    level: number;
    iconName?: string;
  }[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  roleEn: string;
  company: string;
  location: string;
  period: string;
  description: string;
  descriptionEn: string;
  highlights: string[];
  highlightsEn: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  degreeEn: string;
  institution: string;
  year: string;
  details: string;
}

export interface ProfileData {
  name: string;
  nameEn: string;
  title: string;
  titleEn: string;
  bio: string;
  bioEn: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  avatarUrl: string;
  resumeUrl: string;
  socials: {
    github: string;
    linkedin: string;
    twitter: string;
    behance: string;
    website: string;
  };
  metrics: {
    completedProjects: number;
    yearsExperience: number;
    satisfiedClients: number;
    onTimeDeliveryRate: number;
  };
}

export type Language = 'bn' | 'en';
