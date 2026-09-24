import { getAIProvider } from "./provider";

export async function generateOutreach({ 
  prospect, 
  service, 
  offer,
  tone
}: { 
  prospect: any, 
  service: string, 
  offer: any,
  tone: string
}) {
  const provider = getAIProvider();

  if (provider) {
    const systemPrompt = `You are an expert freelance copywriter.
    Your goal is to write highly personalized, non-spammy outreach messages to a potential client.
    
    IMPORTANT RULES:
    - Tone should be: ${tone}.
    - Do NOT make false claims (e.g. do not say you've worked with them before, do not claim fake statistics).
    - Focus on the prospect's observed problem and how the service solves it.
    - Make it concise. No one reads long cold emails.
    - Return ONLY valid JSON in this exact structure:
    {
      "messages": [
        {
          "type": "Short DM",
          "platform": "Instagram/Twitter",
          "content": "The message body...",
          "subject": null
        },
        {
          "type": "Personalized DM",
          "platform": "LinkedIn",
          "content": "A slightly longer, professional DM...",
          "subject": null
        },
        {
          "type": "Email",
          "platform": "Email",
          "content": "The email body...",
          "subject": "The email subject line"
        },
        {
          "type": "Follow-up #1",
          "platform": "Email",
          "content": "A polite follow-up message...",
          "subject": "Re: Previous subject"
        },
        {
          "type": "Follow-up #2",
          "platform": "Email",
          "content": "A final polite follow-up message...",
          "subject": "Re: Previous subject"
        }
      ]
    }`;

    const prompt = `Prospect Name: ${prospect.name}
    Contact Person: ${prospect.contactName || "Not known"}
    Industry: ${prospect.industry || "Not known"}
    Platform: ${prospect.platform || "Not known"}
    Observed Problem: ${prospect.observedProblem || "No specific problem noted."}
    
    My Service: ${service}
    My Offer: ${offer?.headline}
    
    Generate the outreach messages.`;

    try {
      const response = await provider.generateStructuredResponse<{ messages: any[] }>(prompt, systemPrompt);
      return response.messages;
    } catch (error) {
      console.error("AI Generation failed, falling back to mock:", error);
    }
  }

  // MOCK FALLBACK
  await new Promise(resolve => setTimeout(resolve, 1500));

  const pName = prospect.contactName ? prospect.contactName.split(' ')[0] : (prospect.name || "there");
  const pProblem = prospect.observedProblem || `reaching your audience effectively on ${prospect.platform || 'social media'}`;
  
  // Apply tone variations to greetings/closings
  const getGreeting = () => {
    switch(tone) {
      case 'Professional': return `Hi ${pName},`;
      case 'Friendly': return `Hey ${pName}!`;
      case 'Casual': return `Hey ${pName},`;
      case 'Direct': return `${pName},`;
      default: return `Hi ${pName},`;
    }
  };

  const getClosing = () => {
    switch(tone) {
      case 'Professional': return `Best regards,`;
      case 'Friendly': return `Cheers!`;
      case 'Casual': return `Best,`;
      case 'Direct': return `Thanks,`;
      default: return `Best,`;
    }
  };

  const cta = "Would you be open to a quick 5-min chat next week to see if I can help?";

  return [
    {
      type: "Short DM",
      platform: prospect.platform || "Instagram",
      content: `${getGreeting()}\n\nLove what you're doing with ${prospect.name}! I noticed you might be struggling with ${pProblem}.\n\nI actually help ${prospect.industry || 'businesses like yours'} with ${service}. I have a package specifically designed to solve this.\n\n${cta}`,
      subject: null
    },
    {
      type: "Personalized DM",
      platform: prospect.platform || "LinkedIn",
      content: `${getGreeting()}\n\nI've been following ${prospect.name} for a bit and really love your mission. \n\nI was looking at your recent content and noticed ${pProblem}. A lot of ${prospect.industry || 'businesses'} run into this exact issue when they try to scale.\n\nMy core service is ${service} (specifically, ${offer?.headline || 'delivering high quality results'}). \n\n${cta}`,
      subject: null
    },
    {
      type: "Email",
      platform: "Email",
      subject: `Idea for ${prospect.name}'s ${service}`,
      content: `${getGreeting()}\n\nI came across ${prospect.name} and was really impressed by your recent work. \n\nI'm reaching out because I noticed ${pProblem}, and I think you're leaving potential revenue on the table.\n\nI help ${prospect.industry || 'businesses'} just like yours solve this through targeted ${service}. My typical deliverable includes custom strategy tailored to your exact needs.\n\n${cta}\n\n${getClosing()}`
    },
    {
      type: "Follow-up #1",
      platform: prospect.platform || "Email",
      subject: `Re: Idea for ${prospect.name}'s ${service}`,
      content: `${getGreeting()}\n\nJust bumping this to the top of your inbox. \n\nI know things get busy at ${prospect.name}, but I'd love to show you how my ${service} could help you fix ${pProblem}.\n\nAre you free for a quick chat on Thursday?`
    },
    {
      type: "Follow-up #2",
      platform: prospect.platform || "Email",
      subject: `Re: Idea for ${prospect.name}'s ${service}`,
      content: `${getGreeting()}\n\nChecking in one last time! If ${service} isn't a priority for ${prospect.name} right now, no worries at all.\n\nFeel free to keep my contact info for the future when you're ready to tackle ${pProblem}.\n\n${getClosing()}`
    }
  ];
}
