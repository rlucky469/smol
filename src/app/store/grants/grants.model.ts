export interface IGrant {
  id: string;
  title: string;
  funder: string;
  amountLabel: string;
  deadlineLabel: string;
  tags: string[];
  donorTypeLabel: string;
  bullets: string[];
  matchScore: number;
  matchLabel: 'Excellent' | 'Good' | 'Fair';
  url: string;
  image: string;
}

export interface GrantProfile {
  name: string;
  description: string;
}

export interface GrantStats {
  totalMatches: number;
  highMatchScore: number;
  availableFunding: string;
  upcomingDeadlines: number;
}

export interface GrantFilters {
  searchText: string;
  sortBy: string;
  amount: string;
  match: string;
  type: string;
}

export interface GrantsState {
  profileId: string | null;
  profile: GrantProfile;
  profileLoaded: boolean;
  initialCountryIds: number[];
  initialIssueIds: number[];
  countryIds: number[];
  issueIds: number[];
  filters: GrantFilters;
  page: number;
  pageSize: number;
  grants: IGrant[];
  stats: GrantStats;
  loading: boolean;
  error: any;
}

export const SORT_OPTIONS = ['Highest Match', 'Newest', 'Deadline Soonest', 'Amount: High to Low'];
export const AMOUNT_OPTIONS = ['All Amounts', 'Under $10K', '$10K - $50K', '$50K - $250K', '$250K+'];
export const MATCH_OPTIONS = ['All Matches', 'Excellent', 'Good', 'Fair'];
export const TYPE_OPTIONS = ['All Types', 'Government', 'Foundation'];

export const SORT_API_MAP: Record<string, string> = {
  'Highest Match': '',
  'Newest': 'Newest',
  'Deadline Soonest': 'DeadlineSoonest',
  'Amount: High to Low': 'AmountHighToLow',
};

export const MATCH_API_MAP: Record<string, string> = {
  'All Matches': '',
  'Excellent': 'Excellent',
  'Good': 'Good',
  'Fair': 'Fair',
};

export const TYPE_API_MAP: Record<string, string> = {
  'All Types': '',
  'Government': 'GV',
  'Foundation': 'FN',
};

export const DEFAULT_GRANT_FILTERS: GrantFilters = {
  searchText: '',
  sortBy: 'Highest Match',
  amount: 'All Amounts',
  match: 'All Matches',
  type: 'All Types',
};

export const EMPTY_GRANT_STATS: GrantStats = {
  totalMatches: 0,
  highMatchScore: 0,
  availableFunding: '$0',
  upcomingDeadlines: 0,
};
