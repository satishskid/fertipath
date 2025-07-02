
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface StoryBoardChapter {
  chapter: number;
  title: string;
  subtitle: string;
  description: string;
  patientContent: string;
  partnerContent: string;
  familyContent: string;
  actionItems: string[];
  checklistItems: string[];
  estimatedTimeframe: string;
  dependencies: string[];
  encouragementNote: string;
  commonConcerns: string[];
  supportTips: string[];
  iconName: string;
  colorTheme: string;
}

function generateStoryBoardChapters(
  patientProfile: any,
  treatmentPathways: any[]
): StoryBoardChapter[] {
  const primaryTreatment = treatmentPathways?.[0]?.name || 'IVF';
  const femaleAge = patientProfile?.femaleAge || '30-34';
  const timeTrying = patientProfile?.timeTrying || '1-2 years';
  
  return [
    {
      chapter: 1,
      title: "Your Fertility Journey Begins",
      subtitle: "Understanding where you are and where you're going",
      description: "Welcome to your personalized fertility journey. Every journey is unique, and we're here to guide you through each step with evidence-based care and emotional support.",
      patientContent: `Starting a fertility journey can feel overwhelming, but you're not alone. Based on your profile, we've created a personalized roadmap that considers your age (${femaleAge}), how long you've been trying (${timeTrying}), and your unique medical history. This journey is about hope, science, and taking one step at a time.`,
      partnerContent: "Your support as a partner is crucial in this journey. Understanding the process, being present for appointments when possible, and providing emotional support will make a significant difference.",
      familyContent: "Family support plays a vital role in fertility treatment success. Being understanding, patient, and offering practical help can greatly reduce stress for the couple.",
      actionItems: [
        "Complete all initial assessments honestly",
        "Schedule your first consultation",
        "Start taking recommended supplements",
        "Begin tracking your cycle (if not already doing so)"
      ],
      checklistItems: [
        "Medical history forms completed",
        "Insurance coverage verified",
        "Initial consultation scheduled",
        "Support system identified"
      ],
      estimatedTimeframe: "Week 1-2",
      dependencies: [],
      encouragementNote: "Every successful pregnancy started with the first step. You're taking that step today, and that's something to be proud of.",
      commonConcerns: [
        "How long will this process take?",
        "What if the treatment doesn't work?",
        "How much will this cost?",
        "Will there be side effects?"
      ],
      supportTips: [
        "Join online support communities",
        "Practice stress-reduction techniques",
        "Maintain open communication with your partner",
        "Focus on what you can control today"
      ],
      iconName: "Heart",
      colorTheme: "hopeful"
    },
    {
      chapter: 2,
      title: "Comprehensive Medical Evaluation",
      subtitle: "Understanding your body's unique story",
      description: "A thorough medical evaluation helps us understand exactly what's happening with your fertility and creates the foundation for your personalized treatment plan.",
      patientContent: "This phase involves detailed testing for both partners. While it might seem like a lot of tests, each one provides valuable information that helps us create the most effective treatment plan for you. Think of it as gathering all the pieces of your fertility puzzle.",
      partnerContent: "Both partners typically need testing. Male factor contributes to about 30-40% of fertility challenges, so your participation in testing is equally important.",
      familyContent: "This is often an emotionally intense time with multiple appointments. Offering to help with scheduling, transportation, or just being available to talk can be incredibly supportive.",
      actionItems: [
        "Complete all recommended blood tests",
        "Schedule imaging studies (ultrasounds, HSG if needed)",
        "Partner completes semen analysis",
        "Review genetic screening options"
      ],
      checklistItems: [
        "Baseline blood work completed",
        "Pelvic ultrasound done",
        "HSG scheduled (if recommended)",
        "Semen analysis completed",
        "Results reviewed with doctor"
      ],
      estimatedTimeframe: "Week 3-6",
      dependencies: ["Chapter 1 completed"],
      encouragementNote: "Knowledge is power. Every test brings us closer to understanding your body and optimizing your chances of success.",
      commonConcerns: [
        "Will the tests be painful?",
        "What if they find something serious?",
        "How accurate are these tests?",
        "When will we get results?"
      ],
      supportTips: [
        "Schedule tests during less stressful times",
        "Bring headphones for relaxation during procedures",
        "Plan something nice after difficult tests",
        "Ask questions - your medical team is here to help"
      ],
      iconName: "Activity",
      colorTheme: "scientific"
    },
    {
      chapter: 3,
      title: `Your ${primaryTreatment} Treatment Plan`,
      subtitle: "Personalized approach based on your unique needs",
      description: `Based on your evaluation, ${primaryTreatment} appears to be the most suitable treatment approach for your situation. This chapter outlines what to expect throughout your treatment cycle.`,
      patientContent: `Your personalized ${primaryTreatment} protocol has been designed specifically for your age, medical history, and test results. While the process may seem complex, our team will guide you through each step, and you'll have 24/7 support whenever you need it.`,
      partnerContent: `Your role during ${primaryTreatment} treatment is crucial. From medication support to emotional encouragement, your partnership makes this journey stronger.`,
      familyContent: `${primaryTreatment} treatment involves multiple appointments and can be emotionally and physically demanding. Your understanding and flexibility with schedules and mood changes is deeply appreciated.`,
      actionItems: [
        "Attend treatment planning consultation",
        "Complete medication training session",
        "Schedule monitoring appointments",
        "Prepare emotionally and physically for treatment"
      ],
      checklistItems: [
        "Treatment calendar received",
        "Medications ordered and received",
        "Injection training completed",
        "Monitoring schedule confirmed",
        "Emergency contact numbers saved"
      ],
      estimatedTimeframe: "Week 7-10",
      dependencies: ["Chapter 2 completed", "Test results reviewed"],
      encouragementNote: `${primaryTreatment} has helped millions of families worldwide. Your medical team has the experience and expertise to give you the best possible chance of success.`,
      commonConcerns: [
        "Will the medications make me feel sick?",
        "How many monitoring appointments will I need?",
        "What's the success rate for someone like me?",
        "What if I respond poorly to medications?"
      ],
      supportTips: [
        "Set up a comfortable injection station at home",
        "Track your symptoms and share with your team",
        "Plan for flexibility in your schedule",
        "Connect with others going through similar treatment"
      ],
      iconName: "Target",
      colorTheme: "scientific"
    },
    {
      chapter: 4,
      title: "Treatment Cycle and Monitoring",
      subtitle: "Day-by-day guidance through your treatment",
      description: "This is the active treatment phase where careful monitoring ensures optimal results. Every appointment and medication adjustment is precisely timed for your success.",
      patientContent: "During this phase, you'll have frequent monitoring appointments to track how your body is responding to treatment. It's normal to feel anxious about results - remember that our team is making adjustments in real-time to optimize your outcomes.",
      partnerContent: "This can be an emotionally intense time with frequent appointments and hormone fluctuations. Your patience, understanding, and presence (when wanted) mean everything.",
      familyContent: "The treatment cycle requires strict timing and can cause stress. Being flexible with plans and offering practical support (like meal preparation) can be incredibly helpful.",
      actionItems: [
        "Take medications exactly as prescribed",
        "Attend all monitoring appointments",
        "Track symptoms and side effects",
        "Follow pre-procedure instructions carefully"
      ],
      checklistItems: [
        "Daily medications administered correctly",
        "Monitoring appointments attended",
        "Trigger shot administered (if applicable)",
        "Pre-procedure instructions followed",
        "Support person arranged for procedure day"
      ],
      estimatedTimeframe: "Week 11-12",
      dependencies: ["Chapter 3 completed", "Medications started"],
      encouragementNote: "Every injection, every appointment, every careful step is bringing you closer to your goal. Your dedication to following the protocol shows incredible strength.",
      commonConcerns: [
        "What if my follicles don't grow well?",
        "Will the procedure be painful?",
        "How will I know if it's working?",
        "What if we need to cancel the cycle?"
      ],
      supportTips: [
        "Keep a treatment diary",
        "Prepare comfort items for procedure day",
        "Stay hydrated and eat well",
        "Practice relaxation techniques"
      ],
      iconName: "Calendar",
      colorTheme: "supportive"
    },
    {
      chapter: 5,
      title: "The Two-Week Wait and Beyond",
      subtitle: "Navigating hope, anxiety, and next steps",
      description: "The period between treatment and testing is emotionally challenging. This chapter provides strategies for managing this time and understanding next steps regardless of the outcome.",
      patientContent: "The two-week wait is often the hardest part of the fertility journey. It's completely normal to analyze every symptom and feel anxious. Remember that whatever the outcome, you've been incredibly brave, and there are always next steps available.",
      partnerContent: "Your partner may be especially emotional during this time. Being patient, avoiding pressure about symptoms, and planning gentle distractions can help immensely.",
      familyContent: "This is a time when well-meaning questions can feel overwhelming. Following the couple's lead about how much they want to share is the most supportive approach.",
      actionItems: [
        "Follow post-procedure care instructions",
        "Schedule beta HCG test",
        "Practice self-care and stress management",
        "Plan for both possible outcomes"
      ],
      checklistItems: [
        "Post-procedure medications taken",
        "Rest day(s) completed",
        "Beta test scheduled",
        "Support plan in place",
        "Follow-up appointment scheduled"
      ],
      estimatedTimeframe: "Week 13-14",
      dependencies: ["Chapter 4 completed", "Procedure completed"],
      encouragementNote: "Regardless of this cycle's outcome, you've shown incredible courage and strength. Every step forward is progress, and your medical team is here to support you through whatever comes next.",
      commonConcerns: [
        "Should I be feeling symptoms by now?",
        "What if the test is negative?",
        "How long should we wait before trying again?",
        "When will we know if it worked?"
      ],
      supportTips: [
        "Avoid early home pregnancy tests",
        "Plan gentle activities to pass time",
        "Connect with support groups",
        "Focus on taking care of your body and mind"
      ],
      iconName: "Clock",
      colorTheme: "hopeful"
    }
  ];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientCode } = body;

    if (!patientCode) {
      return NextResponse.json(
        { error: 'Patient code is required' },
        { status: 400 }
      );
    }

    // Find patient with their current data
    const patient = await prisma.patient.findUnique({
      where: { patientCode },
      include: {
        pathways: true,
        analysisResults: true
      }
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Delete existing story board chapters for this patient
    await prisma.storyBoard.deleteMany({
      where: { patientId: patient.id }
    });

    // Generate new story board chapters
    const chapters = generateStoryBoardChapters(patient, patient.pathways);

    // Save chapters to database
    const savedChapters = [];
    for (const chapter of chapters) {
      const savedChapter = await prisma.storyBoard.create({
        data: {
          patientId: patient.id,
          chapter: chapter.chapter,
          title: chapter.title,
          subtitle: chapter.subtitle,
          description: chapter.description,
          patientContent: chapter.patientContent,
          partnerContent: chapter.partnerContent,
          familyContent: chapter.familyContent,
          actionItems: chapter.actionItems,
          checklistItems: chapter.checklistItems,
          estimatedTimeframe: chapter.estimatedTimeframe,
          dependencies: chapter.dependencies,
          encouragementNote: chapter.encouragementNote,
          commonConcerns: chapter.commonConcerns,
          supportTips: chapter.supportTips,
          iconName: chapter.iconName,
          colorTheme: chapter.colorTheme,
          isCompleted: false
        }
      });
      savedChapters.push(savedChapter);
    }

    return NextResponse.json({
      success: true,
      storyBoard: savedChapters,
      totalChapters: savedChapters.length,
      message: 'Story board generated successfully'
    });

  } catch (error) {
    console.error('Error generating story board:', error);
    return NextResponse.json(
      { error: 'Failed to generate story board' },
      { status: 500 }
    );
  }
}
