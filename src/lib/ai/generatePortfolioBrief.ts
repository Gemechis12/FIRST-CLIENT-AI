import { getAIProvider } from "./provider";

export async function generatePortfolioBrief({ 
  service, 
  niche, 
  offer 
}: { 
  service: string, 
  niche: string, 
  offer: any 
}) {
  const provider = getAIProvider();

  if (provider) {
    const systemPrompt = `You are an expert creative director assigning a practice project to a beginner freelancer.
    Your goal is to invent a realistic, fictional client and a project brief for them.
    
    IMPORTANT RULES:
    - This must be clearly labeled as a practice project.
    - Do NOT invent fake results or metrics (e.g. "increased sales by 20%").
    - The description should focus on the challenge and the solution provided.
    - Return ONLY valid JSON in this exact structure:
    {
      "title": "Project Title",
      "practiceClient": "Fictional Client Name",
      "industry": "Industry based on niche",
      "background": "Why does this fictional client exist and what do they do?",
      "problem": "What specific problem are they facing?",
      "goal": "What is the goal of this practice project?",
      "targetAudience": "Who is the client trying to reach?",
      "creativeDirection": "What is the vibe or style?",
      "deliverables": "What exactly needs to be built?",
      "suggestedTools": "What tools should the freelancer use?",
      "successCriteria": "How do we know the project is done well?",
      "portfolioDescription": "A professional paragraph the freelancer can use on their portfolio to describe this project honestly."
    }`;

    const prompt = `Service: ${service}
    Niche: ${niche}
    Offer Headline: ${offer?.headline}
    
    Generate a realistic fictional practice project brief.`;

    try {
      const response = await provider.generateStructuredResponse<any>(prompt, systemPrompt);
      return response;
    } catch (error) {
      console.error("AI Generation failed, falling back to mock:", error);
    }
  }

  // MOCK FALLBACK
  await new Promise(resolve => setTimeout(resolve, 2000));

  const isVideo = service.toLowerCase().includes("video") || service.toLowerCase().includes("edit");
  const isDesign = service.toLowerCase().includes("design") || service.toLowerCase().includes("brand");

  if (isVideo) {
    return {
      title: "Short-Form Launch Campaign",
      practiceClient: "Aura Fitness (Fictional)",
      industry: niche || "Health & Wellness",
      background: "Aura Fitness is a boutique gym opening a new location. They have great equipment but no online presence.",
      problem: "They need to build hype before opening day, but their current videos are just unedited phone clips of empty rooms.",
      goal: "Create 3 high-energy short-form videos that make the gym look premium and inviting.",
      targetAudience: "Busy professionals aged 25-40 looking for a premium workout experience.",
      creativeDirection: "Fast-paced, high energy, clean aesthetic. Use dynamic text animations to highlight key amenities.",
      deliverables: "3x 15-second vertical videos (9:16) optimized for TikTok/Reels.",
      suggestedTools: "Premiere Pro, CapCut, or DaVinci Resolve.",
      successCriteria: "Videos must have good pacing, clear audio, and a strong call-to-action to 'Join the Waitlist'.",
      portfolioDescription: "Objective: To develop a high-energy social media launch campaign for a boutique fitness brand. The project focused on transforming raw footage into engaging, fast-paced vertical content designed to drive waitlist sign-ups prior to opening day."
    };
  }

  if (isDesign) {
    return {
      title: "Brand Identity Refresh",
      practiceClient: "Lumina Coffee (Fictional)",
      industry: niche || "Food & Beverage",
      background: "Lumina Coffee is an independent roaster that just started selling their beans online. Their current logo was made in Word.",
      problem: "Their packaging looks cheap, which makes it hard to justify their premium price point to online buyers.",
      goal: "Design a clean, modern brand identity and one coffee bag label.",
      targetAudience: "Coffee enthusiasts who care about ethical sourcing and aesthetic packaging.",
      creativeDirection: "Minimalist, earthy tones, premium feel. Focus on clean typography.",
      deliverables: "1 Primary Logo, 1 Brand Color Palette, 1 Coffee Bag Label Mockup.",
      suggestedTools: "Figma, Illustrator, or Canva.",
      successCriteria: "The logo must look good scaled down on a phone screen and printed on a bag.",
      portfolioDescription: "Objective: To establish a premium brand identity for an independent coffee roaster transitioning to e-commerce. The project included developing a scalable logo, a cohesive color palette, and packaging design concepts aimed at a high-end specialty market."
    };
  }

  return {
    title: `Strategic ${service} Campaign`,
    practiceClient: "Acme Corp (Fictional)",
    industry: niche || "B2B",
    background: `Acme Corp is a growing company in the ${niche || 'B2B'} space looking to scale their operations.`,
    problem: `They are struggling to implement effective ${service} internally.`,
    goal: `Deliver a complete ${service} solution that addresses their core bottlenecks.`,
    targetAudience: "Their ideal customers and stakeholders.",
    creativeDirection: "Professional, trustworthy, and clear.",
    deliverables: `A complete ${service} package based on the Starter tier of your offer.`,
    suggestedTools: "Standard industry tools for this service.",
    successCriteria: "Must look professional and be ready to present to a real client.",
    portfolioDescription: `Objective: To develop a comprehensive ${service} strategy for a growing business in the ${niche || 'B2B'} sector. The project focused on creating scalable assets and a clear implementation roadmap to address operational bottlenecks.`
  };
}
