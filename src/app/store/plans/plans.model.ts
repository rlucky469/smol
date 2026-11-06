export interface AiPlan {
  aiPlanIndex: number;
  planName: string;
  planDescription: string;
  priceUSD: number;
  credits: number;
  bonusCredits: number;
  validityDays: number;
}

export interface PlansState {
  plans: AiPlan[];
  loading: boolean;
  loaded: boolean;
  error: any;
}
