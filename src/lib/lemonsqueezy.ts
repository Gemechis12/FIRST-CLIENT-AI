import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

const apiKey = process.env.LEMONSQUEEZY_API_KEY;

export function configureLemonSqueezy() {
  if (apiKey) {
    lemonSqueezySetup({
      apiKey,
      onError: (error) => console.error("Lemon Squeezy API Error:", error),
    });
  } else if (process.env.NODE_ENV === "production") {
    console.error("Missing LEMONSQUEEZY_API_KEY environment variable.");
  }
}
