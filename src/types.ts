export interface UserFormData {
  name: string;
  contact: string; 
  university: string;
  major: string;
  grade: string; 
  gpaRanking: string;
  englishScore: string; 
  competitions: string;
  research: string;
  targetFocus: string; 
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface DetailedAdvice {
  title: string;
  level: '国家级' | '省部级' | '校级';
  description: string;
}

export interface BonusPointItem {
  category: string;
  item: string;
  score: string;
}

export interface TimelineItem {
  period: string;
  title: string;
  content: string;
  tag: string;
}

export interface SuccessCase {
  admissionSchool: string; 
  admissionMajor: string;  
  year: string;            
  originBackground: string; 
  highlights: string;       
}

export interface ReportData {
  summary: string;
  metrics: {
    gpaScore: number;
    researchScore: number;
    englishScore: number;
    competitionScore: number;
    admissionRate: number; 
  };
  
  admissionTrend: ChartDataPoint[]; 
  graduateDestinations: ChartDataPoint[]; 
  destinationSchools: string[]; 
  similarCases: SuccessCase[];

  policyAnalysis: string; 
  bonusPolicy: BonusPointItem[]; 
  
  gradeGuidance: string; 
  timeline: TimelineItem[]; 
  
  competitionsRecommended: DetailedAdvice[];
  researchRecommended: DetailedAdvice[];
  
  recommendations: {
    type: '冲刺' | '稳妥' | '保底';
    schools: string[];
    successRate: number; 
    note: string;
  }[];
  career: {
    direction: string;
    salaryRange: string;
  };
  pengpaiPlanRecommended: boolean;
}

export const CONSTANTS = {
  FEISHU_WEBHOOK: "https://open.feishu.cn/open-apis/bot/v2/hook/25faa1d2-76d3-4f88-8277-a5a625b6f789",
  DEEPSEEK_API_KEY: "sk-f2335a96cee0449386e3822542892783",
  DEEPSEEK_API_URL: "https://api.deepseek.com/chat/completions"
};