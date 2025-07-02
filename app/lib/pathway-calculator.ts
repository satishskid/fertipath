
import { PatientProfile, TreatmentPathway } from './types';

export function calculateTreatmentPathways(profile: PatientProfile): TreatmentPathway[] {
  const age = parseInt(profile.femaleProfile.age?.split('-')[0] || '30');
  const timesTrying = profile.coupleHistory.timeTrying;
  const previousTreatments = profile.coupleHistory.previousTreatments;
  const conditions = profile.femaleProfile.conditions || [];
  const financialComfort = profile.holistic.financialComfort;

  const pathways: TreatmentPathway[] = [];

  // IUI Pathway
  const iuiSuccessRate = calculateIUISuccess(age, conditions, timesTrying);
  const iuiSuitability = calculateIUISuitability(profile);
  
  pathways.push({
    name: 'IUI (Intrauterine Insemination)',
    description: 'A simple procedure where prepared sperm is placed directly in the uterus around the time of ovulation.',
    successRate: iuiSuccessRate,
    timeline: '1 month per attempt',
    costMin: 15000,
    costMax: 30000,
    suitability: iuiSuitability,
    pros: ['Less invasive', 'Lower cost', 'Shorter timeline', 'Can be repeated multiple times'],
    cons: ['Lower success rate', 'May not address underlying issues', 'Multiple cycles may be needed'],
    priority: getSuitabilityPriority(iuiSuitability),
    recommendation: getIUIRecommendation(profile)
  });

  // FET Pathway (if applicable)
  if (previousTreatments === 'ivf') {
    const fetSuccessRate = calculateFETSuccess(age, conditions);
    const fetSuitability = calculateFETSuitability(profile);
    
    pathways.push({
      name: 'FET (Frozen Embryo Transfer)',
      description: 'Transfer of previously frozen embryos from a previous IVF cycle.',
      successRate: fetSuccessRate,
      timeline: '1-2 months',
      costMin: 50000,
      costMax: 90000,
      suitability: fetSuitability,
      pros: ['Uses existing embryos', 'Cost-effective', 'Less medication required', 'Proven embryo quality'],
      cons: ['Requires previous IVF cycle', 'Embryos may not survive thawing', 'No genetic testing'],
      priority: getSuitabilityPriority(fetSuitability),
      recommendation: getFETRecommendation(profile)
    });
  }

  // IVF/ICSI Pathway
  const ivfSuccessRate = calculateIVFSuccess(age, conditions);
  const ivfSuitability = calculateIVFSuitability(profile);
  
  pathways.push({
    name: 'IVF/ICSI',
    description: 'In vitro fertilization with intracytoplasmic sperm injection for optimal fertilization.',
    successRate: ivfSuccessRate,
    timeline: '2-3 months per cycle',
    costMin: 150000,
    costMax: 300000,
    suitability: ivfSuitability,
    pros: ['Higher success rate', 'Addresses multiple fertility issues', 'Can freeze extra embryos', 'Comprehensive treatment'],
    cons: ['More invasive', 'Higher cost', 'Requires hormone injections', 'Risk of multiple pregnancy'],
    priority: getSuitabilityPriority(ivfSuitability),
    recommendation: getIVFRecommendation(profile)
  });

  // IVF with PGT-A Pathway
  const pgtaSuccessRate = calculatePGTASuccess(age);
  const pgtaSuitability = calculatePGTASuitability(profile);
  
  pathways.push({
    name: 'IVF with PGT-A',
    description: 'IVF with preimplantation genetic testing to select chromosomally normal embryos.',
    successRate: pgtaSuccessRate,
    timeline: '3-4 months per cycle',
    costMin: 250000,
    costMax: 400000,
    suitability: pgtaSuitability,
    pros: ['Highest success rate per transfer', 'Reduces miscarriage risk', 'Genetic screening', 'Single embryo transfer'],
    cons: ['Most expensive', 'Longest timeline', 'Complex process', 'May require multiple cycles'],
    priority: getSuitabilityPriority(pgtaSuitability),
    recommendation: getPGTARecommendation(profile)
  });

  // Sort by priority and suitability
  return pathways.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return b.suitability - a.suitability;
  });
}

function calculateIUISuccess(age: number, conditions: string[], timesTrying?: string): number {
  let baseRate = 15;
  
  // Age adjustment
  if (age > 35) baseRate -= 5;
  if (age > 40) baseRate -= 5;
  
  // Condition adjustments
  if (conditions.includes('pcos')) baseRate -= 2;
  if (conditions.includes('endometriosis')) baseRate -= 3;
  if (conditions.includes('blockedTubes')) baseRate -= 8;
  if (conditions.includes('lowOvarianReserve')) baseRate -= 4;
  
  // Time trying adjustment
  if (timesTrying === '> 3 years') baseRate -= 3;
  
  return Math.max(baseRate, 5);
}

function calculateFETSuccess(age: number, conditions: string[]): number {
  let baseRate = 45;
  
  if (age > 35) baseRate -= 5;
  if (age > 40) baseRate -= 10;
  
  if (conditions.includes('endometriosis')) baseRate -= 5;
  if (conditions.includes('fibroids')) baseRate -= 3;
  
  return Math.max(baseRate, 25);
}

function calculateIVFSuccess(age: number, conditions: string[]): number {
  let baseRate = 50;
  
  if (age > 35) baseRate -= 10;
  if (age > 40) baseRate -= 15;
  if (age > 42) baseRate -= 10;
  
  if (conditions.includes('lowOvarianReserve')) baseRate -= 10;
  if (conditions.includes('endometriosis')) baseRate -= 5;
  
  return Math.max(baseRate, 20);
}

function calculatePGTASuccess(age: number): number {
  let baseRate = 65;
  
  if (age > 35) baseRate -= 5;
  if (age > 40) baseRate -= 10;
  if (age > 42) baseRate -= 5;
  
  return Math.max(baseRate, 45);
}

function calculateIUISuitability(profile: PatientProfile): number {
  let score = 70;
  const age = parseInt(profile.femaleProfile.age?.split('-')[0] || '30');
  const conditions = profile.femaleProfile.conditions || [];
  
  if (age < 35) score += 10;
  if (conditions.includes('blockedTubes')) score -= 30;
  if (conditions.includes('lowOvarianReserve')) score -= 15;
  if (profile.coupleHistory.previousTreatments === 'ivf') score -= 20;
  
  return Math.max(Math.min(score, 100), 0);
}

function calculateFETSuitability(profile: PatientProfile): number {
  let score = 85;
  const age = parseInt(profile.femaleProfile.age?.split('-')[0] || '30');
  
  if (age > 40) score -= 10;
  if (profile.coupleHistory.previousTreatments === 'ivf') score += 15;
  
  return Math.max(Math.min(score, 100), 0);
}

function calculateIVFSuitability(profile: PatientProfile): number {
  let score = 80;
  const age = parseInt(profile.femaleProfile.age?.split('-')[0] || '30');
  const conditions = profile.femaleProfile.conditions || [];
  
  if (age > 35) score += 10;
  if (conditions.includes('blockedTubes')) score += 15;
  if (conditions.includes('endometriosis')) score += 10;
  if (profile.coupleHistory.timeTrying === '> 3 years') score += 10;
  
  return Math.max(Math.min(score, 100), 0);
}

function calculatePGTASuitability(profile: PatientProfile): number {
  let score = 60;
  const age = parseInt(profile.femaleProfile.age?.split('-')[0] || '30');
  
  if (age > 35) score += 20;
  if (age > 40) score += 10;
  if (profile.coupleHistory.previousTreatments === 'ivf') score += 15;
  if (profile.holistic.financialComfort === '> 300000') score += 10;
  
  return Math.max(Math.min(score, 100), 0);
}

function getSuitabilityPriority(suitability: number): number {
  if (suitability >= 80) return 1;
  if (suitability >= 60) return 2;
  if (suitability >= 40) return 3;
  return 4;
}

function getIUIRecommendation(profile: PatientProfile): string {
  const age = parseInt(profile.femaleProfile.age?.split('-')[0] || '30');
  const conditions = profile.femaleProfile.conditions || [];
  
  if (conditions.includes('blockedTubes')) {
    return 'IUI may not be effective due to blocked tubes. Consider IVF.';
  }
  
  if (age < 35 && !conditions.includes('lowOvarianReserve')) {
    return 'Good candidate for IUI. Consider 3-4 cycles before moving to IVF.';
  }
  
  return 'IUI can be attempted, but success rates may be lower. Consider moving to IVF if unsuccessful after 2-3 cycles.';
}

function getFETRecommendation(profile: PatientProfile): string {
  return 'Excellent first choice to utilize existing embryos. Cost-effective with reasonable success rates.';
}

function getIVFRecommendation(profile: PatientProfile): string {
  const age = parseInt(profile.femaleProfile.age?.split('-')[0] || '30');
  
  if (age > 40) {
    return 'Consider PGT-A to improve embryo selection and reduce miscarriage risk.';
  }
  
  return 'Comprehensive treatment option with good success rates for your profile.';
}

function getPGTARecommendation(profile: PatientProfile): string {
  const age = parseInt(profile.femaleProfile.age?.split('-')[0] || '30');
  
  if (age > 35) {
    return 'Strongly recommended to maximize success per transfer and reduce miscarriage risk.';
  }
  
  return 'Consider if multiple IVF failures or if wanting to minimize cycles needed.';
}
