import { getAIProvider } from "./provider";

export async function generateOffer(service: any, niche: any, onboardingData: any) {
  const provider = getAIProvider();

  if (provider) {
    const systemPrompt = `You are an expert freelance business consultant.
    Your goal is to help a beginner freelancer create a compelling, structured offer.
    
    IMPORTANT RULES:
    - Keep it beginner-friendly and realistic.
    - Clearly separate the offer into 3 tiers (Starter, Growth, Premium).
    - Provide suggested starting prices, but clearly label them as suggestions.
    - Do NOT invent fake results or case studies.
    - Return ONLY valid JSON in this exact structure:
    {
      "headline": "A catchy, clear headline for the offer.",
      "targetCustomer": "Who this is exactly for.",
      "problem": "The specific problem this solves.",
      "solution": "How this service solves it.",
      "deliverables": "A summary of what they get.",
      "timeline": "Estimated timeline (e.g., 2 weeks).",
      "revisionPolicy": "Suggested revision policy (e.g., 2 rounds).",
      "packages": [
        {
          "name": "Starter",
          "price": "Suggested Price (e.g. $500)",
          "description": "What's included in the starter package."
        },
        {
          "name": "Growth",
          "price": "Suggested Price (e.g. $1000)",
          "description": "What's included in the growth package."
        },
        {
          "name": "Premium",
          "price": "Suggested Price (e.g. $2500)",
          "description": "What's included in the premium package."
        }
      ]
    }`;

    const prompt = `Skill: ${onboardingData.skill}
    Selected Service: ${service.title}
    Selected Niche: ${niche.name}
    Experience Level: ${onboardingData.experienceLevel}
    
    Generate a structured, 3-tier freelance offer.`;

    try {
      const response = await provider.generateStructuredResponse<any>(prompt, systemPrompt);
      return response;
    } catch (error) {
      console.error("AI Generation failed, falling back to mock:", error);
    }
  }

  // MOCK FALLBACK
  await new Promise(resolve => setTimeout(resolve, 2000));

  const serviceName = service?.title || "My Service";
  const nicheName = niche?.name || "My Niche";

  return {
    headline: `The Ultimate ${serviceName} for ${nicheName}`,
    targetCustomer: `Ambitious ${nicheName} who want to scale.`,
    problem: `Most ${nicheName} struggle with ${service?.problemsSolved || 'standing out and converting leads'}.`,
    solution: `I provide done-for-you ${serviceName} that fixes this bottleneck directly.`,
    deliverables: service?.deliverables || "A complete, ready-to-use digital asset package.",
    timeline: "2 to 4 weeks depending on package tier.",
    revisionPolicy: "2 rounds of revisions included to ensure you are 100% satisfied.",
    packages: [
      {
        name: "Starter",
        price: "$500 (Suggested)",
        description: "The essential deliverables to get you off the ground. Perfect for testing a new concept."
      },
      {
        name: "Growth",
        price: "$1,500 (Suggested)",
        description: "A comprehensive package designed for established businesses looking to optimize."
      },
      {
        name: "Premium",
        price: "$3,000 (Suggested)",
        description: "The full white-glove experience. Complete strategic overhaul and implementation."
      }
    ]
  };
}
