export const STATUS_COLORS: Record<string, string> = {
  New: '#3B82F6',
  Contacted: '#8B5CF6',
  Qualified: '#06B6D4',
  Proposal: '#F59E0B',
  Negotiation: '#F97316',
  Won: '#10B981',
  Lost: '#EF4444',
};

export const SCORE_THRESHOLDS = {
  HOT: 80,
  WARM: 50,
  COLD: 0,
} as const;

export const SCORE_COLORS = {
  hot: '#10B981',
  warm: '#F59E0B',
  cold: '#EF4444',
} as const;

export function getScoreLabel(score: number): 'hot' | 'warm' | 'cold' {
  if (score >= SCORE_THRESHOLDS.HOT) return 'hot';
  if (score >= SCORE_THRESHOLDS.WARM) return 'warm';
  return 'cold';
}

export const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Manufacturing',
  'Retail', 'Education', 'Real Estate', 'Consulting',
  'Media', 'Energy', 'Transportation', 'Other',
];

export const COMPANY_SIZES = [
  '1-10', '11-50', '51-200', '201-1000', '1001-5000', '5000+',
];

export const PIPELINE_STAGES = [
  'New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation',
] as const;
