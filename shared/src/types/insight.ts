export const InsightType = {
  NextBestAction: 'Next Best Action',
  RiskAssessment: 'Risk Assessment',
  ScoreExplanation: 'Score Explanation',
  WinProbability: 'Win Probability',
} as const;
export type InsightType = (typeof InsightType)[keyof typeof InsightType];

export interface AIInsight {
  id: string;
  leadId: string;
  type: InsightType;
  title: string;
  content: string;
  confidence: number;
  generatedAt: string;
}

export interface ScoreFactor {
  name: string;
  value: number;
  maxValue: number;
  description: string;
}

export interface LeadScore {
  score: number;
  factors: ScoreFactor[];
}
