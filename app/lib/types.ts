
export interface PatientProfile {
  id?: string;
  patientCode: string;
  femaleProfile: FemaleProfile;
  maleProfile: MaleProfile;
  coupleHistory: CoupleHistory;
  holistic: HolisticAssessment;
  // Enhanced profile features
  location?: LocationPreferences;
  journey?: JourneyProgress;
  interfaceMode?: 'patient' | 'doctor';
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
  originalFileName?: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  category: 'document' | 'ultrasound' | 'sperm_analysis' | 'embryo_image' | 'whatsapp_image' | 'medical_image' | 'lab_results';
  uploadedAt: string;
  extractedData?: any;
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  processingTime?: number;
  confidence?: number;
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
  // Enhanced pathway features
  evidenceLevel?: 'high' | 'moderate' | 'low';
  researchLinks?: string[];
  alternativePaths?: string[];
  telemedicineSteps?: any;
  inPersonSteps?: any;
  remoteMonitoring?: boolean;
  virtualConsults?: boolean;
  estimatedDuration?: string;
  preparationSteps?: any;
  milestones?: any;
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
  // Enhanced recommendation features
  evidenceLevel?: 'high' | 'moderate' | 'low';
  researchBasis?: string;
  patientView?: string;
  doctorView?: string;
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

// New interfaces for enhanced features

export interface LocationPreferences {
  zipCode?: string;
  preferredGender?: 'male' | 'female' | 'no_preference';
  experienceLevel?: 'junior' | 'experienced' | 'senior';
  specialization?: string;
  maxDistance?: number; // in kilometers
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface JourneyProgress {
  currentPhase: number;
  completedPhases: number[];
  journeyStarted: string;
  estimatedCompletion?: string;
  stepsCompleted?: number;
  totalSteps?: number;
}

export interface JourneyStep {
  id: string;
  patientId: string;
  step: number;
  title: string;
  description: string;
  status: 'upcoming' | 'current' | 'completed' | 'skipped';
  category: 'consultation' | 'test' | 'procedure' | 'medication' | 'lifestyle';
  scheduledDate?: string;
  completedDate?: string;
  estimatedDuration?: string;
  canBeRemote: boolean;
  requiresInPerson: boolean;
  virtualOptions?: any;
  preparationSteps: string[];
  whatToExpect?: string;
  afterCare?: string;
  iconName?: string;
  illustrationUrl?: string;
  patientTips: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DoctorRecommendation {
  id: string;
  patientId: string;
  doctorName: string;
  clinicName: string;
  specialization: string;
  gender: 'male' | 'female';
  experience: 'junior' | 'experienced' | 'senior';
  address: string;
  zipCode: string;
  distance?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  phoneNumber?: string;
  email?: string;
  website?: string;
  rating?: number;
  reviewCount: number;
  acceptsInsurance: boolean;
  availableSlots?: any;
  averageWaitTime?: string;
  offersTelemedicine: boolean;
  virtualConsultFee?: number;
  consultationFee?: number;
  treatmentCosts?: any;
  matchScore?: number;
  matchReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoryBoard {
  id: string;
  patientId: string;
  chapter: number;
  title: string;
  subtitle?: string;
  description: string;
  illustrationUrl?: string;
  iconName?: string;
  colorTheme?: string;
  patientContent: string;
  partnerContent?: string;
  familyContent?: string;
  actionItems: string[];
  checklistItems: string[];
  resources?: any;
  estimatedTimeframe?: string;
  dependencies: string[];
  encouragementNote?: string;
  commonConcerns: string[];
  supportTips: string[];
  isCompleted: boolean;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TelemedicineSession {
  id: string;
  patientId: string;
  doctorId: string;
  sessionType: 'consultation' | 'follow_up' | 'monitoring' | 'counseling';
  scheduledDate: string;
  duration: number; // in minutes
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  meetingUrl?: string;
  notes?: string;
  prescription?: any;
  nextSteps?: string[];
  recordingUrl?: string;
  cost: number;
  createdAt: string;
  updatedAt: string;
}

export interface FileUploadError {
  success: false;
  error: string;
  errorCode: string;
  details: string;
  processingTime?: number;
}

export interface FileUploadSuccess {
  success: true;
  fileId: string;
  originalFileName: string;
  sanitizedFileName: string;
  fileCategory: string;
  extractedData: any;
  timelineEvents: TimelineEvent[];
  processingTime: number;
  message: string;
}

export type FileUploadResponse = FileUploadError | FileUploadSuccess;

// Enhanced constants for new features

export const DOCTOR_PREFERENCES = [
  { value: 'no_preference', label: 'No Preference' },
  { value: 'male', label: 'Male Doctor' },
  { value: 'female', label: 'Female Doctor' }
];

export const EXPERIENCE_LEVELS = [
  { value: 'junior', label: 'Junior (1-5 years)' },
  { value: 'experienced', label: 'Experienced (5-15 years)' },
  { value: 'senior', label: 'Senior (15+ years)' }
];

export const SPECIALIZATIONS = [
  { value: 'reproductive_endocrinology', label: 'Reproductive Endocrinology' },
  { value: 'ivf_specialist', label: 'IVF Specialist' },
  { value: 'gynecologist', label: 'Gynecologist' },
  { value: 'urologist', label: 'Urologist (Male Fertility)' },
  { value: 'fertility_counselor', label: 'Fertility Counselor' }
];

export const JOURNEY_PHASES = [
  { phase: 1, title: 'Patient Profile', description: 'Complete medical and personal history' },
  { phase: 2, title: 'Medical Timeline', description: 'Upload and organize medical documents' },
  { phase: 3, title: 'AI Analysis', description: 'Deep analysis of medical data' },
  { phase: 4, title: 'Clinical Suggestions', description: 'Personalized recommendations' },
  { phase: 5, title: 'Treatment Pathways', description: 'Detailed treatment plans and options' }
];

export const STORY_BOARD_THEMES = [
  { value: 'hopeful', label: 'Hopeful Journey', color: '#10B981' },
  { value: 'scientific', label: 'Scientific Approach', color: '#3B82F6' },
  { value: 'supportive', label: 'Supportive Care', color: '#8B5CF6' },
  { value: 'empowering', label: 'Empowering Choice', color: '#F59E0B' }
];
