import { getAIProvider } from "./provider";

export async function generateNiches(service: any, onboardingData: any) {
  const provider = getAIProvider();

  if (provider) {
    const systemPrompt = `You are an expert freelance business consultant.
    Your goal is to help a beginner freelancer identify 5 realistic, profitable niches for their selected service.
    
    IMPORTANT RULES:
    - Keep it beginner-friendly and realistic.
    - Focus on specific industries or customer types.
    - Explain WHY this niche needs the service.
    - Return ONLY valid JSON in this exact structure:
    {
      "niches": [
        {
          "name": "Niche Name",
          "whyTheyNeed": "Why this specific niche desperately needs this service.",
          "commonProblems": "The biggest pain points this niche faces.",
          "exampleClients": "Examples of businesses in this niche.",
          "opportunity": "Why this is a good opportunity (e.g. high budget, underserved)."
        }
      ]
    }`;

    const prompt = `Skill: ${onboardingData.skill}
    Selected Service: ${service.title}
    Service Description: ${service.description}
    Experience Level: ${onboardingData.experienceLevel}
    
    Generate 5 realistic niches for this freelance service.`;

    try {
      const response = await provider.generateStructuredResponse<{ niches: any[] }>(prompt, systemPrompt);
      return response.niches;
    } catch (error) {
      console.error("AI Generation failed, falling back to mock:", error);
    }
  }

  // MOCK FALLBACK
  await new Promise(resolve => setTimeout(resolve, 1500));

  let serviceNoun = "The Service";
  if (service && service.title) {
    serviceNoun = service.title;
  }

  return [
    {
      name: "Local E-commerce Brands",
      whyTheyNeed: `They have great products but struggle to showcase them online effectively using ${serviceNoun}.`,
      commonProblems: "Low conversion rates, poor quality visuals, high ad spend with low return.",
      exampleClients: "Boutique clothing stores, artisan food makers, handmade cosmetics.",
      opportunity: "Many are transitioning from retail to online and need professional help quickly."
    },
    {
      name: "Health & Wellness Coaches",
      whyTheyNeed: `They need to build authority and trust, and ${serviceNoun} is the best way to do it.`,
      commonProblems: "Look unprofessional compared to big brands, struggle to explain complex topics simply.",
      exampleClients: "Personal trainers, nutritionists, mental health advocates.",
      opportunity: "High lifetime value per client means they are willing to invest in their personal brand."
    },
    {
      name: "B2B SaaS Startups",
      whyTheyNeed: `They need to explain software clearly to investors and users using ${serviceNoun}.`,
      commonProblems: "Highly technical products that confuse everyday users, boring marketing materials.",
      exampleClients: "New project management tools, AI startups, fintech apps.",
      opportunity: "They usually have recent funding and need to move fast."
    },
    {
      name: "Real Estate Agencies",
      whyTheyNeed: `The market is highly visual and competitive. They need ${serviceNoun} to stand out.`,
      commonProblems: "Listings sit too long, agents struggle to build personal brands.",
      exampleClients: "Boutique agencies, luxury realtors, property management firms.",
      opportunity: "A single good project can lead to recurring work for every new property."
    },
    {
      name: "Online Course Creators",
      whyTheyNeed: `They are essentially digital marketing businesses that constantly need ${serviceNoun}.`,
      commonProblems: "Launch fatigue, low course completion rates, high competition.",
      exampleClients: "Business coaches, language teachers, specialized skill instructors.",
      opportunity: "They understand the value of digital assets and are used to hiring freelancers."
    }
  ];
}
