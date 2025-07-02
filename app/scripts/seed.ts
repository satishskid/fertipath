
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.treatmentPathway.deleteMany();
  await prisma.clinicalRecommendation.deleteMany();
  await prisma.analysisResult.deleteMany();
  await prisma.timeline.deleteMany();
  await prisma.medicalFile.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.aIConfiguration.deleteMany();

  // Create AI configurations
  console.log('🤖 Setting up AI configurations...');
  await prisma.aIConfiguration.createMany({
    data: [
      {
        provider: 'gemini',
        isActive: true,
        config: {
          model: 'gpt-4.1-mini',
          temperature: 0.7,
          maxTokens: 2048
        }
      },
      {
        provider: 'gemma3',
        isActive: false,
        config: {
          model: 'gemma3-local',
          temperature: 0.6,
          maxTokens: 1024
        }
      }
    ]
  });

  // Create a demo patient
  console.log('👥 Creating demo patient...');
  const demoPatient = await prisma.patient.create({
    data: {
      patientCode: 'SNTDEMO001',
      femaleAge: '30-34',
      femaleCycle: 'mostly-regular',
      femaleConditions: ['pcos'],
      femaleLifestyle: {
        smoking: 'never',
        alcohol: 'occasionally',
        bmi: 'normal'
      },
      maleAge: '30-39',
      maleConditions: ['none'],
      timeTrying: '1-2 years',
      previousTreatments: 'none',
      fertilityHistory: {
        naturalConceptions: 0,
        miscarriages: 0
      },
      emotionalState: 'some-stress',
      financialComfort: '150000-300000'
    }
  });

  console.log('📋 Creating demo treatment pathways...');
  await prisma.treatmentPathway.createMany({
    data: [
      {
        patientId: demoPatient.id,
        name: 'IUI (Intrauterine Insemination)',
        description: 'A simple procedure where prepared sperm is placed directly in the uterus around the time of ovulation.',
        successRate: 12.0,
        timeline: '1 month per attempt',
        costMin: 15000,
        costMax: 30000,
        suitability: 75.0,
        pros: ['Less invasive', 'Lower cost', 'Shorter timeline'],
        cons: ['Lower success rate', 'May not address PCOS effectively'],
        recommendation: 'Good option for 2-3 cycles given PCOS, then consider IVF if unsuccessful.',
        priority: 2
      },
      {
        patientId: demoPatient.id,
        name: 'IVF/ICSI',
        description: 'In vitro fertilization with intracytoplasmic sperm injection for optimal fertilization rates.',
        successRate: 45.0,
        timeline: '2-3 months per cycle',
        costMin: 150000,
        costMax: 300000,
        suitability: 85.0,
        pros: ['Higher success rate', 'Addresses PCOS effectively', 'Can freeze embryos'],
        cons: ['More invasive', 'Higher cost', 'Hormone injections required'],
        recommendation: 'Recommended approach given PCOS and patient age profile.',
        priority: 1
      },
      {
        patientId: demoPatient.id,
        name: 'IVF with PGT-A',
        description: 'IVF with preimplantation genetic testing to select chromosomally normal embryos.',
        successRate: 60.0,
        timeline: '3-4 months per cycle',
        costMin: 250000,
        costMax: 400000,
        suitability: 70.0,
        pros: ['Highest success rate', 'Reduces miscarriage risk', 'Single embryo transfer'],
        cons: ['Most expensive', 'Longest timeline', 'Complex process'],
        recommendation: 'Consider if standard IVF unsuccessful or if patient prefers highest success rate per transfer.',
        priority: 3
      }
    ]
  });

  console.log('🏥 Creating demo clinical recommendations...');
  await prisma.clinicalRecommendation.createMany({
    data: [
      {
        patientId: demoPatient.id,
        category: 'additional_tests',
        title: 'Updated Hormone Panel',
        description: 'Consider fresh AMH, FSH, and insulin levels to assess current PCOS status and ovarian reserve.',
        priority: 'high',
        source: 'clinical_guidelines',
        isActionable: true
      },
      {
        patientId: demoPatient.id,
        category: 'lifestyle',
        title: 'PCOS Management Protocol',
        description: 'Optimize insulin sensitivity through low-GI diet, consider metformin therapy, and ensure vitamin D supplementation.',
        priority: 'medium',
        source: 'clinical_guidelines',
        isActionable: true
      },
      {
        patientId: demoPatient.id,
        category: 'treatment_considerations',
        title: 'Ovulation Induction Strategy',
        description: 'Given PCOS, consider letrozole over clomiphene for ovulation induction due to better ovarian response.',
        priority: 'medium',
        source: 'ai_analysis',
        isActionable: true
      }
    ]
  });

  console.log('📅 Creating demo timeline...');
  await prisma.timeline.createMany({
    data: [
      {
        patientId: demoPatient.id,
        date: new Date('2024-01-15'),
        title: 'Initial Consultation',
        category: 'consultation',
        details: 'First fertility consultation. Discussed trying for 18 months with irregular cycles.',
        sourceFile: 'consultation_jan2024.pdf'
      },
      {
        patientId: demoPatient.id,
        date: new Date('2024-02-20'),
        title: 'Hormone Panel Results',
        category: 'lab_results',
        details: 'AMH: 6.8 ng/mL (high), FSH: 4.2 mIU/mL, LH: 12.1 mIU/mL, Insulin: elevated',
        sourceFile: 'lab_results_feb2024.pdf',
        extractedData: {
          amh: 6.8,
          fsh: 4.2,
          lh: 12.1,
          diagnosis: 'PCOS confirmed'
        }
      },
      {
        patientId: demoPatient.id,
        date: new Date('2024-03-10'),
        title: 'Ultrasound Scan',
        category: 'procedure',
        details: 'Transvaginal ultrasound: Multiple follicles consistent with PCOS, endometrial thickness 7mm',
        sourceFile: 'ultrasound_mar2024.pdf'
      }
    ]
  });

  console.log('✅ Database seeding completed successfully!');
  console.log(`📊 Created:`);
  console.log(`   - 1 Demo patient (${demoPatient.patientCode})`);
  console.log(`   - 3 Treatment pathways`);
  console.log(`   - 3 Clinical recommendations`);
  console.log(`   - 3 Timeline events`);
  console.log(`   - 2 AI configurations`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
