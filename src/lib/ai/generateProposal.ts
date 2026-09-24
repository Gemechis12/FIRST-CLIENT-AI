import { getAIProvider } from "./provider";

export async function generateProposal({ 
  prospect, 
  offer, 
  projectDetails 
}: { 
  prospect: any, 
  offer: any,
  projectDetails: any
}) {
  const provider = getAIProvider();

  if (provider) {
    const systemPrompt = `You are an expert freelance copywriter.
    Your goal is to write a highly professional, persuasive, and clear project proposal for a potential client.
    
    IMPORTANT RULES:
    - Never invent previous clients, testimonials, certifications, revenue, results, or years of experience.
    - Focus strictly on the client's problem, the proposed solution, deliverables, and timeline.
    - Use Markdown formatting for sections (e.g. ## Proposed Solution).
    - Return ONLY valid JSON in this exact structure:
    {
      "title": "A strong, professional title for the proposal (e.g. Video Production Proposal for Acme Corp)",
      "content": "The full proposal text formatted in Markdown..."
    }`;

    const prompt = `Prospect Name: ${prospect.name}
    Contact Person: ${prospect.contactName || "Client"}
    Industry: ${prospect.industry || "Not specified"}
    Observed Problem: ${prospect.observedProblem || "Needs operational/creative support."}
    
    My Offer Headline: ${offer.headline}
    My Solution: ${offer.solution}
    Offer Deliverables: ${offer.deliverables}
    
    Custom Project Details (override offer defaults if provided):
    Project Title: ${projectDetails.title || "Not specified"}
    Client Requirements: ${projectDetails.clientRequirements || "Not specified"}
    Deliverables: ${projectDetails.deliverables || "Use offer deliverables"}
    Timeline: ${projectDetails.timeline || offer.timeline || "Not specified"}
    Price: ${projectDetails.price || "TBD"}
    Payment Terms: ${projectDetails.paymentTerms || "TBD"}
    Revisions: ${projectDetails.revisions || offer.revisionPolicy || "Not specified"}
    
    Structure the content exactly like this, using standard markdown headers (##):
    
    [A brief personalized greeting]
    ## Project Understanding
    ## Proposed Solution
    ## Deliverables
    ## Timeline & Process
    ## Revisions
    ## Investment & Payment Terms
    ## Next Steps
    [Closing]`;

    try {
      const response = await provider.generateStructuredResponse<any>(prompt, systemPrompt);
      return response;
    } catch (error) {
      console.error("AI Generation failed, falling back to mock:", error);
    }
  }

  // MOCK FALLBACK
  await new Promise(resolve => setTimeout(resolve, 1500));

  const pName = prospect.contactName ? prospect.contactName.split(' ')[0] : (prospect.name || "Client");
  
  const opening = `Hi ${pName},\n\nThank you for taking the time to discuss the goals for ${prospect.name}. Based on our conversation, I've put together this proposal outlining exactly how we can tackle your current challenges and get the results you're looking for.`;
  
  const understanding = `You're currently looking to address ${prospect.observedProblem || 'some operational bottlenecks'}. While ${prospect.name} is already doing great work in the ${prospect.industry || 'industry'} space, this specific challenge is preventing you from reaching your full potential right now. ${projectDetails.clientRequirements ? `\n\nYou specifically mentioned: ${projectDetails.clientRequirements}` : ''}`;
  
  const solution = `My approach is designed specifically to solve this. We will focus on ${offer.solution || 'delivering a tailored strategy that aligns with your business goals'}. By focusing on this core area, we can ensure that the final outcome directly impacts your bottom line without unnecessary fluff.`;
  
  let deliverableText = offer.deliverables;
  try {
    const parsed = JSON.parse(offer.deliverables);
    if (Array.isArray(parsed)) {
      deliverableText = parsed.map(d => `• ${d}`).join('\n');
    }
  } catch (e) {
    if (deliverableText && !deliverableText.includes('•')) {
      deliverableText = `• ${deliverableText}`;
    }
  }

  const deliverables = projectDetails.deliverables || deliverableText || "• Custom Strategy\n• Implementation\n• Handover & Training";
  const timeline = projectDetails.timeline || offer.timeline || "2-4 weeks from project kickoff";
  const closing = `I'm ready to get started as soon as you give the green light. If everything looks good to you, simply let me know and I'll send over the invoice for the deposit so we can officially kick off the project.\n\nLooking forward to working together!\n\nBest regards,`;

  return {
    title: projectDetails.title || `Proposal for ${prospect.name}`,
    content: `${opening}\n\n## Project Understanding\n\n${understanding}\n\n## Proposed Solution\n\n${solution}\n\n## Deliverables\n\n${deliverables}\n\n## Timeline & Process\n\n${timeline}\n\n## Revisions\n\n${projectDetails.revisions || offer.revisionPolicy || 'Standard revision process'}\n\n## Investment & Payment Terms\n\nTotal Investment: ${projectDetails.price || 'TBD'}\nPayment Terms: ${projectDetails.paymentTerms || '50% upfront, 50% upon completion'}\n\n## Next Steps\n\n${closing}`
  };
}
