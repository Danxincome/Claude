export const LeadStatus = {
  New: 'New',
  Contacted: 'Contacted',
  Qualified: 'Qualified',
  Proposal: 'Proposal',
  Negotiation: 'Negotiation',
  Won: 'Won',
  Lost: 'Lost',
} as const;
export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];

export const LeadSource = {
  Website: 'Website',
  Referral: 'Referral',
  LinkedIn: 'LinkedIn',
  ColdOutreach: 'Cold Outreach',
  Event: 'Event',
  Advertisement: 'Advertisement',
  Other: 'Other',
} as const;
export type LeadSource = (typeof LeadSource)[keyof typeof LeadSource];

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  estimatedValue: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateLeadInput = Omit<Lead, 'id' | 'score' | 'createdAt' | 'updatedAt'>;
export type UpdateLeadInput = Partial<CreateLeadInput>;
