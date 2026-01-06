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
  category: string; // e.g., "科研论文", "竞赛获奖"
  item: string;     // e.g., "SCI一区一作"
  score: string;    // e.g., "加 3 分"
}

export interface TimelineItem {
  period: string;  // e.g., "大一上学期", "暑假"
  title: string;   // e.g., "保研扫盲与绩点奠基"
  content: string; // e.g., "重点关注..."
  tag: string;     // e.g., "关键节点"
}

// New Interface for Success Cases
export interface SuccessCase {
  admissionSchool: string; // e.g. 复旦大学
  admissionMajor: string;  // e.g. 软件工程
  year: string;            // e.g. 2023年录取
  originBackground: string; // e.g. 211工程 | 3.92 (1/150)
  highlights: string;       // e.g. 挑战杯金奖，预推免入围
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
  
  // Charts
  admissionTrend: ChartDataPoint[]; 
  graduateDestinations: ChartDataPoint[]; 
  
  // New: Specific Destination List
  destinationSchools: string[]; 
  
  // New: Similar Cases (The requested feature)
  similarCases: SuccessCase[];

  // Refined Content Sections
  policyAnalysis: string; 
  bonusPolicy: BonusPointItem[]; 
  
  // New: Grade Specific Timeline
  gradeGuidance: string; // Short summary guidance for the specific grade
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