export type SearchType = 'Chat' | 'GrantMatch' | 'ProfileAnalysis';

export interface Wallet {
  memberIndex: number;
  availableCredits: number;
  usedCredits: number;
  expiredCredits: number;
  lastUpdated: string;
  nextExpiryOn: string | null;
}

export interface UsageInfo {
  model: string;
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
}

export interface ChargeRequest extends UsageInfo {
  searchType: SearchType;
  prompt: string;
  answer?: string;
  requestKey: string;
}

export interface ChargeResult {
  searchIndex: number;
  searchType: string;
  answer?: string;
  creditsCharged: number;
  creditsDue: number;
  shortfall: number; 
  remainingCredits: number;
  model: string;
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  totalTokens: number;
  duplicate: boolean;
}

export interface CheckBalanceResponse {
  status: number;
  message: string;
  canSearch: boolean;
  availableCredits: number;
  requiredCredits: number;
}

export interface WalletState {
  wallet: Wallet | null;
  loading: boolean;
  loaded: boolean;
  charging: boolean;
  lastCharge: ChargeResult | null;
  error: any;
}