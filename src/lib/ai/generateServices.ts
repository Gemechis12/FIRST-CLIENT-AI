import { getAIProvider } from "./provider";

export async function generateServices(onboardingData: any) {
  const provider = getAIProvider();

  if (provider) {
    const systemPrompt = `You are an expert freelance business consultant.
    Your goal is to help a beginner freelancer identify 5 actionable, realistic services they can offer based on their existing skills and experience.
    
    IMPORTANT RULES:
    - Keep it beginner-friendly and realistic.
    - Focus on clear deliverables (what the client actually buys).
    - Ensure it solves a real business problem.
    - Return ONLY valid JSON in this exact structure:
    {
      "services": [
        {
          "title": "Clear Service Title",
          "description": "Short explanation of the service.",
          "targetClients": "Who needs this.",
          "problemsSolved": "What pain point it fixes.",
          "deliverables": "What the client actually receives (e.g., 3 videos, 1 website).",
          "isBeginnerFriendly": true
        }
      ]
    }`;

    const prompt = `Skill: ${onboardingData.skill || ""}
    Experience Level: ${onboardingData.experienceLevel || ""}
    Has Clients Before: ${onboardingData.hasClientsBefore ? "Yes" : "No"}
    Main Goal: ${onboardingData.mainGoal || ""}
    
    Generate 5 realistic freelance services for this person.`;

    try {
      const response = await provider.generateStructuredResponse<{ services: any[] }>(prompt, systemPrompt);
      return response.services;
    } catch (error) {
      console.error("AI Generation failed, falling back to mock:", error);
      // Fallback to mock if AI fails
    }
  }

  // MOCK FALLBACK
  await new Promise(resolve => setTimeout(resolve, 1500));

  let skillPrefix = "Freelance";
  if (onboardingData.skill) {
    skillPrefix = onboardingData.skill.split(" ")[0];
  }

  return [
    {
      title: `${skillPrefix} for Social Media`,
      description: `Create platform-native ${onboardingData.skill.toLowerCase()} for Instagram, TikTok, and YouTube Shorts.`,
      targetClients: "E-commerce brands, local businesses, content creators.",
      problemsSolved: "Lack of consistent posting, low engagement, no time to create content.",
      deliverables: "4-8 short-form pieces per month, captions, hashtags.",
      isBeginnerFriendly: true
    },
    {
      title: `B2B ${skillPrefix} Consulting`,
      description: `Help businesses optimize their ${onboardingData.skill.toLowerCase()} strategy for B2B lead generation.`,
      targetClients: "SaaS companies, agencies, consultants.",
      problemsSolved: "Low conversion rates, poor quality leads, unoptimized funnels.",
      deliverables: "Strategy audit, implementation roadmap, monthly analytics report.",
      isBeginnerFriendly: false
    },
    {
      title: `One-Off ${skillPrefix} Projects`,
      description: `Deliver specific ${onboardingData.skill.toLowerCase()} projects on demand.`,
      targetClients: "Startups, small businesses needing quick turnaround.",
      problemsSolved: "Need specialized skills temporarily, overflow work from agencies.",
      deliverables: "Completed project files, 2 rounds of revisions.",
      isBeginnerFriendly: true
    },
    {
      title: `${skillPrefix} Retainer`,
      description: `Ongoing monthly ${onboardingData.skill.toLowerCase()} support.`,
      targetClients: "Growing businesses with consistent needs but no budget for full-time hires.",
      problemsSolved: "Unpredictable quality, managing multiple freelancers.",
      deliverables: "Set number of hours or deliverables per month.",
      isBeginnerFriendly: false
    },
    {
      title: `${skillPrefix} for Local Businesses`,
      description: `Basic ${onboardingData.skill.toLowerCase()} setup and management for brick-and-mortar stores.`,
      targetClients: "Restaurants, gyms, salons, real estate agents.",
      problemsSolved: "No online presence, outdated materials, struggling to attract local foot traffic.",
      deliverables: "Initial setup, local SEO basics, weekly updates.",
      isBeginnerFriendly: true
    }
  ];
}
