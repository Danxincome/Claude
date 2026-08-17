import type { Lead, ScoreFactor } from '../../../shared/src/index';
import type { Activity } from '../../../shared/src/index';

const HIGH_VALUE_INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Energy'];
const QUALITY_SOURCES = ['Referral', 'Event', 'LinkedIn'];

export class ScoringService {
  calculateScore(lead: Lead, activities: Activity[]): { score: number; factors: ScoreFactor[] } {
    const factors: ScoreFactor[] = [];

    const companyScore = this.scoreCompanyProfile(lead);
    factors.push({ name: 'Company Profile', value: companyScore, maxValue: 20, description: 'Company relevance and size indicators' });

    const sourceScore = this.scoreSource(lead);
    factors.push({ name: 'Lead Source', value: sourceScore, maxValue: 10, description: 'Quality of acquisition channel' });

    const engagementScore = this.scoreEngagement(activities);
    factors.push({ name: 'Engagement', value: engagementScore, maxValue: 25, description: 'Activity frequency and recency' });

    const dealScore = this.scoreDealValue(lead);
    factors.push({ name: 'Deal Value', value: dealScore, maxValue: 15, description: 'Estimated deal size potential' });

    const roleScore = this.scoreRole(lead);
    factors.push({ name: 'Decision Maker', value: roleScore, maxValue: 15, description: 'Seniority and buying authority' });

    const velocityScore = this.scorePipelineVelocity(lead);
    factors.push({ name: 'Pipeline Velocity', value: velocityScore, maxValue: 15, description: 'Speed of progression through stages' });

    const totalScore = Math.min(100, factors.reduce((sum, f) => sum + f.value, 0));
    return { score: totalScore, factors };
  }

  private scoreCompanyProfile(lead: Lead): number {
    let score = 5;
    if (lead.company.length > 0) score += 3;

    const companyLower = lead.company.toLowerCase();
    if (HIGH_VALUE_INDUSTRIES.some(ind => companyLower.includes(ind.toLowerCase()))) score += 5;

    if (lead.estimatedValue > 100000) score += 4;
    else if (lead.estimatedValue > 50000) score += 2;

    if (companyLower.includes('inc') || companyLower.includes('corp') || companyLower.includes('ltd')) score += 3;

    return Math.min(20, score);
  }

  private scoreSource(lead: Lead): number {
    if (lead.source === 'Referral') return 10;
    if (lead.source === 'Event') return 8;
    if (lead.source === 'LinkedIn') return 7;
    if (lead.source === 'Website') return 5;
    if (lead.source === 'Advertisement') return 4;
    if (lead.source === 'Cold Outreach') return 3;
    return 2;
  }

  private scoreEngagement(activities: Activity[]): number {
    if (activities.length === 0) return 0;

    let score = Math.min(15, activities.length * 3);

    const hasCall = activities.some(a => a.type === 'Call');
    const hasMeeting = activities.some(a => a.type === 'Meeting');
    if (hasMeeting) score += 5;
    else if (hasCall) score += 3;

    const latest = activities.reduce((newest, a) => a.createdAt > newest ? a.createdAt : newest, '');
    if (latest) {
      const daysSinceLastActivity = (Date.now() - new Date(latest).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastActivity <= 3) score += 5;
      else if (daysSinceLastActivity <= 7) score += 3;
      else if (daysSinceLastActivity > 14) score -= 3;
    }

    return Math.max(0, Math.min(25, score));
  }

  private scoreDealValue(lead: Lead): number {
    if (lead.estimatedValue >= 200000) return 15;
    if (lead.estimatedValue >= 100000) return 12;
    if (lead.estimatedValue >= 50000) return 8;
    if (lead.estimatedValue >= 25000) return 5;
    return 2;
  }

  private scoreRole(lead: Lead): number {
    const titleLower = lead.title.toLowerCase();
    if (['ceo', 'cto', 'coo', 'cfo', 'ciso', 'founder', 'co-founder', 'owner'].some(t => titleLower.includes(t))) return 15;
    if (['vp', 'vice president', 'head of', 'director'].some(t => titleLower.includes(t))) return 12;
    if (['manager', 'lead', 'principal'].some(t => titleLower.includes(t))) return 8;
    if (titleLower.length > 0) return 4;
    return 2;
  }

  private scorePipelineVelocity(lead: Lead): number {
    const statusWeights: Record<string, number> = {
      New: 2,
      Contacted: 5,
      Qualified: 8,
      Proposal: 11,
      Negotiation: 14,
      Won: 15,
      Lost: 0,
    };

    const baseScore = statusWeights[lead.status] || 0;
    const daysInPipeline = (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24);

    if (lead.status === 'Won' || lead.status === 'Lost') return baseScore;
    if (daysInPipeline > 60) return Math.max(0, baseScore - 5);
    if (daysInPipeline < 7 && baseScore >= 5) return Math.min(15, baseScore + 1);

    return Math.min(15, baseScore);
  }
}
