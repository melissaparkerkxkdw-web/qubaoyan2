
export interface UserInfo {
  name: string;
  phone: string;
  school: string;
  major: string;
  grade: string;
  rank: string;
  english: string;
  competition: string;
  research: string;
  consultationFocus: string;
}

export interface SchoolData {
  name: string;
  rate: number | null; 
  destinations: string;
  policy: string;
  source?: string;
}

// Updated to support categorized planning
export interface TimelineItem {
  stage: string;
  categoryContent: {
    gpa: string;
    english: string;
    research: string;
    contest: string;
  };
}

export interface AdmissionCase {
  student: string;
  school: string;
  major: string;
  gpa: string;
  english: string;
  offer: string;
}

export interface BonusItem {
  item: string;
  score: string;
  desc: string;
}

export interface BonusScheme {
  category: string;
  items: BonusItem[];
}

export interface AIResponse {
  // Switched overallAnalysis to SWOT structure
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  planning: TimelineItem[]; 
  researchAdvice: string; // Keep as string for rich text formatting
  competitions: string;
  bonusScheme: BonusScheme[]; // New field for detailed policy
  targetSchools: Record<string, string>; 
  admissionCases: AdmissionCase[]; // New field for success cases
  missingData?: {
    rate?: number;
    policy?: string;
    destinations?: string;
  };
}
