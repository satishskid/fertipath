
export interface PatientProfile {
  id?: string;
  patientCode: string;
  femaleProfile: FemaleProfile;
  maleProfile: MaleProfile;
  coupleHistory: CoupleHistory;
  holistic: HolisticAssessment;
}

export interface FemaleProfile {
  age?: string;
  cycle?: string;
  conditions?: string[];
  lifestyle?: {
    smoking?: string;
    alcohol?: string;
    bmi?: string;
  };
}

export interface MaleProfile {
  age?: string;
  conditions?: string[];
}

export interface CoupleHistory {
  timeTrying?: string;
  previousTreatments?: string;
  fertilityChallenges?: string[];
}

export interface HolisticAssessment {
  emotionalState?: string;
  financialComfort?: string;
  socialSupport?: string;
}

export interface MedicalFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  category: 'document' | 'ultrasound' | 'sperm_analysis' | 'embryo_image';
  uploadedAt: string;
  extractedData?: any;
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  category: 'consultation' | 'lab_results' | 'treatment' | 'procedure';
  details?: string;
  sourceFile?: string;
  extractedData?: any;
}

export interface TreatmentPathway {
  id?: string;
  name: string;
  description: string;
  successRate: number;
  timeline: string;
  costMin: number;
  costMax: number;
  suitability: number;
  pros: string[];
  cons: string[];
  recommendation?: string;
  priority: number;
}

export interface AnalysisResult {
  id: string;
  analysisType: 'document_analysis' | 'vision_analysis' | 'pathway_calculation';
  results: any;
  confidence?: number;
  createdAt: string;
}

export interface ClinicalRecommendation {
  id: string;
  category: 'additional_tests' | 'lifestyle' | 'treatment_considerations';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  source: 'ai_analysis' | 'clinical_guidelines' | 'patient_history';
  isActionable: boolean;
}

export interface AIConfiguration {
  provider: 'gemini' | 'gemma3' | 'fallback';
  isActive: boolean;
  config: any;
}

// Medical condition options
export const FEMALE_CONDITIONS = [
  { id: 'none', label: 'None Known' },
  { id: 'pcos', label: 'PCOS / PCOD' },
  { id: 'endometriosis', label: 'Endometriosis' },
  { id: 'lowOvarianReserve', label: 'Low Ovarian Reserve (AMH)' },
  { id: 'fibroids', label: 'Uterine Fibroids/Polyps' },
  { id: 'blockedTubes', label: 'Blocked Fallopian Tube(s)' },
  { id: 'thyroid', label: 'Thyroid Disorder' },
  { id: 'tuberculosis', label: 'History of Genital Tuberculosis' },
  { id: 'other', label: 'Other' }
];

export const MALE_CONDITIONS = [
  { id: 'none', label: 'None Known' },
  { id: 'varicocele', label: 'Varicocele' },
  { id: 'surgery', label: 'Previous Testicular Surgery/Injury' },
  { id: 'other', label: 'Other' }
];

export const AGE_RANGES_FEMALE = [
  { value: '< 25', label: 'Under 25' },
  { value: '25-29', label: '25-29' },
  { value: '30-34', label: '30-34' },
  { value: '35-37', label: '35-37' },
  { value: '38-40', label: '38-40' },
  { value: '41-42', label: '41-42' },
  { value: '> 42', label: 'Over 42' }
];

export const AGE_RANGES_MALE = [
  { value: '< 30', label: 'Under 30' },
  { value: '30-39', label: '30-39' },
  { value: '40-49', label: '40-49' },
  { value: '> 50', label: 'Over 50' }
];

export const CYCLE_PATTERNS = [
  { value: 'very-regular', label: 'Very Regular (26-32 days)' },
  { value: 'mostly-regular', label: 'Mostly Regular' },
  { value: 'irregular', label: 'Irregular' },
  { value: 'very-irregular', label: 'Very Irregular / Absent' }
];

export const TIME_TRYING = [
  { value: '< 6 months', label: 'Under 6 months' },
  { value: '6-12 months', label: '6-12 months' },
  { value: '1-2 years', label: '1-2 years' },
  { value: '2-3 years', label: '2-3 years' },
  { value: '> 3 years', label: 'Over 3 years' }
];

export const PREVIOUS_TREATMENTS = [
  { value: 'none', label: 'None' },
  { value: 'ovulation', label: 'Ovulation Induction (Tablets)' },
  { value: 'iui', label: 'IUI' },
  { value: 'ivf', label: 'IVF / ICSI' }
];

export const EMOTIONAL_STATES = [
  { value: 'positive', label: 'Manageable, feeling positive' },
  { value: 'some-stress', label: 'Some stress, but have good support' },
  { value: 'high-stress', label: 'High stress, feeling pressure from family/society' },
  { value: 'overwhelmed', label: 'Very high stress, feeling overwhelmed' }
];

export const FINANCIAL_COMFORT = [
  { value: '< 50000', label: 'Under ₹50,000' },
  { value: '50000-150000', label: '₹50,000 - ₹1.5 Lakh' },
  { value: '150000-300000', label: '₹1.5 Lakh - ₹3 Lakh' },
  { value: '> 300000', label: 'Over ₹3 Lakh' }
];
