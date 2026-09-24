export const PLANS = {
  FREE: "FREE",
  PRO: "PRO"
} as const;

export const PLAN_CONFIG = {
  [PLANS.FREE]: {
    name: "Free",
    price: 0,
    currency: "USD",
    interval: null
  },
  [PLANS.PRO]: {
    name: "Pro",
    price: 15,
    currency: "USD",
    interval: "month"
  }
};

export type Plan = keyof typeof PLANS;

export const LIMITS = {
  [PLANS.FREE]: {
    service_generation: 3,
    niche_generation: 3,
    offer_generation: 3,
    portfolio_generation: 3,
    outreach_generation: 5,
    proposal_generation: 3,
    prospects: 10,
    portfolioProjects: 3,
    proposals: 3
  },
  [PLANS.PRO]: {
    service_generation: 30,
    niche_generation: 30,
    offer_generation: 30,
    portfolio_generation: 30,
    outreach_generation: 100,
    proposal_generation: 50,
    prospects: 1000,
    portfolioProjects: 1000,
    proposals: 1000
  }
};

export const ACTIONS = {
  SERVICE_GENERATION: "service_generation",
  NICHE_GENERATION: "niche_generation",
  OFFER_GENERATION: "offer_generation",
  PORTFOLIO_GENERATION: "portfolio_generation",
  OUTREACH_GENERATION: "outreach_generation",
  PROPOSAL_GENERATION: "proposal_generation",
} as const;

export type ActionType = typeof ACTIONS[keyof typeof ACTIONS];

export function getCurrentPeriod() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
