export interface AIProvider {
  generateStructuredResponse<T>(prompt: string, systemPrompt?: string): Promise<T>;
}

export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.AI_API_KEY || "";
    this.model = process.env.AI_MODEL || "gpt-4o-mini";
    // Allows overriding base URL for OpenAI-compatible endpoints
    this.baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
  }

  async generateStructuredResponse<T>(prompt: string, systemPrompt: string = "You are a helpful assistant. Always return valid JSON."): Promise<T> {
    if (!this.apiKey) {
      throw new Error("Missing AI_API_KEY");
    }

    const payload = {
      model: this.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    };

    let response;
    let data;

    try {
      response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(payload)
      });

      data = await response.json();
    } catch (error) {
      console.error("AI Provider Network Error:", error);
      throw new Error("AI generation is temporarily unavailable due to network failure.");
    }

    if (!response.ok) {
      console.error("AI API Error:", data);
      throw new Error("AI generation is temporarily unavailable. Please try again.");
    }

    try {
      const content = data.choices[0].message.content;
      return JSON.parse(content) as T;
    } catch (error) {
      // Retry once if parsing fails
      console.warn("Invalid JSON received, retrying...");
      try {
        const retryResponse = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`
          },
          body: JSON.stringify(payload)
        });
        const retryData = await retryResponse.json();
        const retryContent = retryData.choices[0].message.content;
        return JSON.parse(retryContent) as T;
      } catch (retryError) {
        console.error("AI Provider Retry Parse Error:", retryError);
        throw new Error("AI generation returned invalid format. Please try again.");
      }
    }
  }
}

export function getAIProvider(): AIProvider | null {
  if (process.env.AI_API_KEY) {
    return new OpenAIProvider();
  }
  return null; // Signals to use mock fallback
}
