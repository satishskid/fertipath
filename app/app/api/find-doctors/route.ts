
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Sample doctor data - in production, this would come from a medical directory API
const SAMPLE_DOCTORS = [
  {
    doctorName: "Dr. Priya Sharma",
    clinicName: "Mumbai Fertility Centre",
    specialization: "reproductive_endocrinology",
    gender: "female",
    experience: "senior",
    address: "Bandra West, Mumbai, Maharashtra 400050",
    zipCode: "400050",
    phoneNumber: "+91-9876543210",
    email: "dr.priya@mumbaifc.com",
    website: "https://mumbaifc.com",
    rating: 4.8,
    reviewCount: 245,
    acceptsInsurance: true,
    averageWaitTime: "2-3 weeks",
    offersTelemedicine: true,
    virtualConsultFee: 1500,
    consultationFee: 2500,
    treatmentCosts: {
      IUI: { min: 15000, max: 25000 },
      IVF: { min: 150000, max: 200000 },
      ICSI: { min: 180000, max: 250000 }
    }
  },
  {
    doctorName: "Dr. Rajesh Kumar",
    clinicName: "Delhi IVF Institute",
    specialization: "ivf_specialist",
    gender: "male",
    experience: "experienced",
    address: "CP, New Delhi, Delhi 110001",
    zipCode: "110001",
    phoneNumber: "+91-9876543211",
    email: "dr.rajesh@delhiivf.com",
    website: "https://delhiivf.com",
    rating: 4.6,
    reviewCount: 189,
    acceptsInsurance: true,
    averageWaitTime: "1-2 weeks",
    offersTelemedicine: true,
    virtualConsultFee: 1200,
    consultationFee: 2000,
    treatmentCosts: {
      IUI: { min: 12000, max: 20000 },
      IVF: { min: 140000, max: 180000 },
      ICSI: { min: 170000, max: 220000 }
    }
  },
  {
    doctorName: "Dr. Anita Desai",
    clinicName: "Bangalore Reproductive Health",
    specialization: "gynecologist",
    gender: "female",
    experience: "experienced",
    address: "Koramangala, Bangalore, Karnataka 560034",
    zipCode: "560034",
    phoneNumber: "+91-9876543212",
    email: "dr.anita@bangalorerepro.com",
    website: "https://bangalorerepro.com",
    rating: 4.7,
    reviewCount: 156,
    acceptsInsurance: false,
    averageWaitTime: "3-4 weeks",
    offersTelemedicine: false,
    virtualConsultFee: null,
    consultationFee: 1800,
    treatmentCosts: {
      IUI: { min: 10000, max: 18000 },
      IVF: { min: 120000, max: 160000 },
      ICSI: { min: 150000, max: 200000 }
    }
  },
  {
    doctorName: "Dr. Suresh Patel",
    clinicName: "Ahmedabad Fertility Solutions",
    specialization: "urologist",
    gender: "male",
    experience: "senior",
    address: "Satellite, Ahmedabad, Gujarat 380015",
    zipCode: "380015",
    phoneNumber: "+91-9876543213",
    email: "dr.suresh@ahmedabadfertility.com",
    website: "https://ahmedabadfertility.com",
    rating: 4.5,
    reviewCount: 98,
    acceptsInsurance: true,
    averageWaitTime: "1 week",
    offersTelemedicine: true,
    virtualConsultFee: 1000,
    consultationFee: 1500,
    treatmentCosts: {
      consultation: { min: 1500, max: 2000 },
      procedures: { min: 50000, max: 100000 }
    }
  },
  {
    doctorName: "Dr. Meera Nair",
    clinicName: "Chennai Advanced Fertility",
    specialization: "fertility_counselor",
    gender: "female",
    experience: "junior",
    address: "T. Nagar, Chennai, Tamil Nadu 600017",
    zipCode: "600017",
    phoneNumber: "+91-9876543214",
    email: "dr.meera@chennaifertility.com",
    website: "https://chennaifertility.com",
    rating: 4.4,
    reviewCount: 67,
    acceptsInsurance: false,
    averageWaitTime: "1-2 weeks",
    offersTelemedicine: true,
    virtualConsultFee: 800,
    consultationFee: 1200,
    treatmentCosts: {
      counseling: { min: 1200, max: 1500 },
      therapy: { min: 2000, max: 3000 }
    }
  }
];

function calculateDistance(zipCode1: string, zipCode2: string): number {
  // Simple zip code based distance calculation
  // In production, you'd use actual coordinates and geolocation APIs
  const zip1 = parseInt(zipCode1);
  const zip2 = parseInt(zipCode2);
  const diff = Math.abs(zip1 - zip2);
  
  // Rough estimate: difference in zip codes correlates to distance
  if (diff < 10) return Math.random() * 5 + 1; // 1-6 km
  if (diff < 100) return Math.random() * 15 + 5; // 5-20 km
  if (diff < 1000) return Math.random() * 50 + 20; // 20-70 km
  return Math.random() * 200 + 100; // 100-300 km
}

function calculateMatchScore(
  doctor: any,
  preferences: {
    preferredGender?: string;
    experienceLevel?: string;
    specialization?: string;
    maxDistance?: number;
    acceptsInsurance?: boolean;
    offersTelemedicine?: boolean;
  }
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  
  // Gender preference (20 points)
  if (preferences.preferredGender && preferences.preferredGender !== 'no_preference') {
    if (doctor.gender === preferences.preferredGender) {
      score += 20;
      reasons.push(`Matches preferred gender (${preferences.preferredGender})`);
    }
  } else {
    score += 10; // Neutral bonus for no preference
  }
  
  // Experience level (25 points)
  if (preferences.experienceLevel) {
    if (doctor.experience === preferences.experienceLevel) {
      score += 25;
      reasons.push(`Matches experience level (${preferences.experienceLevel})`);
    } else if (
      (preferences.experienceLevel === 'experienced' && doctor.experience === 'senior') ||
      (preferences.experienceLevel === 'senior' && doctor.experience === 'experienced')
    ) {
      score += 15;
      reasons.push('Close match for experience level');
    }
  }
  
  // Specialization (30 points)
  if (preferences.specialization) {
    if (doctor.specialization === preferences.specialization) {
      score += 30;
      reasons.push(`Exact specialization match (${preferences.specialization})`);
    } else if (
      doctor.specialization === 'reproductive_endocrinology' ||
      doctor.specialization === 'ivf_specialist'
    ) {
      score += 20;
      reasons.push('High-relevance fertility specialist');
    }
  }
  
  // Distance (15 points)
  if (preferences.maxDistance && doctor.distance) {
    if (doctor.distance <= preferences.maxDistance) {
      score += 15;
      reasons.push(`Within preferred distance (${doctor.distance.toFixed(1)}km)`);
    } else if (doctor.distance <= preferences.maxDistance * 1.5) {
      score += 8;
      reasons.push('Reasonably close to preferred distance');
    }
  }
  
  // Insurance acceptance (5 points)
  if (preferences.acceptsInsurance && doctor.acceptsInsurance) {
    score += 5;
    reasons.push('Accepts insurance');
  }
  
  // Telemedicine (5 points)
  if (preferences.offersTelemedicine && doctor.offersTelemedicine) {
    score += 5;
    reasons.push('Offers telemedicine consultations');
  }
  
  return { score: Math.min(score, 100), reasons };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      patientCode, 
      zipCode, 
      preferredGender, 
      experienceLevel, 
      specialization,
      maxDistance = 50,
      acceptsInsurance,
      offersTelemedicine 
    } = body;

    if (!patientCode) {
      return NextResponse.json(
        { error: 'Patient code is required' },
        { status: 400 }
      );
    }

    if (!zipCode) {
      return NextResponse.json(
        { error: 'Zip code is required for location-based recommendations' },
        { status: 400 }
      );
    }

    // Find patient
    const patient = await prisma.patient.findUnique({
      where: { patientCode }
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Calculate distances and match scores for all doctors
    const doctorsWithScores = SAMPLE_DOCTORS.map(doctor => {
      const distance = calculateDistance(zipCode, doctor.zipCode);
      const { score, reasons } = calculateMatchScore(doctor, {
        preferredGender,
        experienceLevel,
        specialization,
        maxDistance,
        acceptsInsurance,
        offersTelemedicine
      });
      
      return {
        ...doctor,
        distance,
        matchScore: score,
        matchReasons: reasons
      };
    });

    // Sort by match score and distance
    const sortedDoctors = doctorsWithScores.sort((a, b) => {
      if (Math.abs(a.matchScore - b.matchScore) < 5) {
        // If scores are close, prefer closer doctors
        return a.distance - b.distance;
      }
      return b.matchScore - a.matchScore;
    });

    // Take top 10 recommendations
    const recommendations = sortedDoctors.slice(0, 10);

    // Save recommendations to database
    const savedRecommendations = [];
    for (const doctor of recommendations) {
      const savedDoc = await prisma.doctorRecommendation.create({
        data: {
          patientId: patient.id,
          doctorName: doctor.doctorName,
          clinicName: doctor.clinicName,
          specialization: doctor.specialization,
          gender: doctor.gender,
          experience: doctor.experience,
          address: doctor.address,
          zipCode: doctor.zipCode,
          distance: doctor.distance,
          phoneNumber: doctor.phoneNumber,
          email: doctor.email,
          website: doctor.website,
          rating: doctor.rating,
          reviewCount: doctor.reviewCount,
          acceptsInsurance: doctor.acceptsInsurance,
          averageWaitTime: doctor.averageWaitTime,
          offersTelemedicine: doctor.offersTelemedicine,
          virtualConsultFee: doctor.virtualConsultFee,
          consultationFee: doctor.consultationFee,
          treatmentCosts: doctor.treatmentCosts,
          matchScore: doctor.matchScore,
          matchReason: doctor.matchReasons.join('; ')
        }
      });
      savedRecommendations.push(savedDoc);
    }

    // Update patient location data
    await prisma.patient.update({
      where: { id: patient.id },
      data: {
        zipCode: zipCode,
        preferredGender: preferredGender,
        experienceLevel: experienceLevel,
        specialization: specialization,
        locationData: {
          zipCode,
          searchRadius: maxDistance,
          lastSearched: new Date().toISOString(),
          preferences: {
            preferredGender,
            experienceLevel,
            specialization,
            acceptsInsurance,
            offersTelemedicine
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      recommendations: recommendations,
      searchCriteria: {
        zipCode,
        preferredGender,
        experienceLevel,
        specialization,
        maxDistance,
        acceptsInsurance,
        offersTelemedicine
      },
      message: `Found ${recommendations.length} doctor recommendations based on your preferences`
    });

  } catch (error) {
    console.error('Error finding doctors:', error);
    return NextResponse.json(
      { error: 'Failed to find doctor recommendations' },
      { status: 500 }
    );
  }
}
