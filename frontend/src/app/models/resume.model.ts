export interface Education {
  degree: string;
  institution: string;
  graduationYear: number | null;
}

export interface SocialHandles {
  linkedin?: string | null;
  github?: string | null;
  twitter?: string | null;
  portfolio?: string | null;
  other?: string[];
}

export interface ResumeSummary {
  id: string;
  name: string;
  currentRole: string;
  experienceYears: number;
  skills: string[];
  education: Education[];
  summary: string;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  socialHandles?: SocialHandles | null;
  rawText?: string | null;
}

export interface ResumeUploadResponse {
  id: string;
  fileName: string;
  uploadDate: string;
  status: 'processing' | 'completed' | 'error';
}
