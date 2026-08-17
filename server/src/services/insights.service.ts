import type { Lead, Activity, AIInsight } from '../../../shared/src/index';
import { InsightType } from '../../../shared/src/index';
import { InsightRepository } from '../repositories/insight.repository';
import type { ScoreFactor } from '../../../shared/src/index';

export class InsightsService {
  private insightRepo = new InsightRepository();

  generateInsights(lead: Lead, activities: Activity[], factors: ScoreFactor[]): AIInsight[] {
    this.insightRepo.deleteByLeadId(lead.id);
    const insights: AIInsight[] = [];

    insights.push(this.generateScoreExplanation(lead, factors));

    const actionInsight = this.generateNextBestAction(lead, activities);
    if (actionInsight) insights.push(actionInsight);

    const riskInsight = this.generateRiskAssessment(lead, activities);
    if (riskInsight) insights.push(riskInsight);

    insights.push(this.generateWinProbability(lead, activities));

    return insights;
  }

  private generateScoreExplanation(lead: Lead, factors: ScoreFactor[]): AIInsight {
    const topFactors = [...factors].sort((a, b) => b.value - a.value).slice(0, 3);
    const breakdown = topFactors
      .map(f => `${f.name}: ${f.value}/${f.maxValue} - ${f.description}`)
      .join('. ');

    return this.insightRepo.create({
      leadId: lead.id,
      type: InsightType.ScoreExplanation,
      title: `Score Analysis: ${lead.score}/100`,
      content: `${lead.firstName}'s lead score of ${lead.score} is driven by: ${breakdown}. ${
        lead.score >= 80 ? 'This is a high-priority lead that warrants immediate attention.' :
        lead.score >= 50 ? 'This lead shows moderate potential. Focus on increasing engagement to move them forward.' :
        'This lead needs nurturing. Consider targeted content and consistent follow-up to build interest.'
      }`,
      confidence: 0.95,
    });
  }

  private generateNextBestAction(lead: Lead, activities: Activity[]): AIInsight | null {
    const daysSinceLastActivity = activities.length > 0
      ? (Date.now() - new Date(activities[0].createdAt).getTime()) / (1000 * 60 * 60 * 24)
      : Infinity;

    let title: string;
    let content: string;
    let confidence: number;

    switch (lead.status) {
      case 'New':
        if (activities.length === 0) {
          title = 'Schedule Discovery Call';
          content = `${lead.firstName} is a new lead with no interactions yet. Reach out within 24 hours with a personalized message referencing their ${lead.source.toLowerCase()} engagement. Discovery calls within the first 48 hours have 3x higher qualification rates.`;
          confidence = 0.90;
        } else {
          title = 'Qualify with Demo';
          content = `Initial contact has been made with ${lead.firstName}. Schedule a product demo to assess fit and move them to Qualified status. Focus on their role as ${lead.title} at ${lead.company} to personalize the presentation.`;
          confidence = 0.85;
        }
        break;
      case 'Contacted':
        title = 'Deepen Engagement';
        content = `${lead.firstName} has been contacted but not yet qualified. Send a case study relevant to ${lead.company}'s industry. Follow up with a call to discuss their specific needs and pain points.`;
        confidence = 0.82;
        break;
      case 'Qualified':
        title = 'Prepare Tailored Proposal';
        content = `${lead.firstName} is qualified and ready for a proposal. Create a custom proposal highlighting ROI metrics relevant to their role as ${lead.title}. Include pricing for the $${lead.estimatedValue.toLocaleString()} opportunity.`;
        confidence = 0.88;
        break;
      case 'Proposal':
        if (daysSinceLastActivity > 5) {
          title = 'Follow Up on Proposal';
          content = `It has been ${Math.round(daysSinceLastActivity)} days since the proposal was sent to ${lead.firstName}. Schedule a call to address questions, handle objections, and discuss next steps. Proposals without follow-up within 7 days close 40% less often.`;
          confidence = 0.85;
        } else {
          title = 'Engage Decision Makers';
          content = `The proposal is active with ${lead.firstName}. Identify other stakeholders at ${lead.company} who influence the decision. Offer a group call or executive briefing to build consensus.`;
          confidence = 0.78;
        }
        break;
      case 'Negotiation':
        title = 'Accelerate Close';
        content = `${lead.firstName} is in negotiations. Address any remaining concerns promptly. Consider offering a time-limited incentive or early-adopter benefits to create urgency. Keep communication frequency high during this critical stage.`;
        confidence = 0.87;
        break;
      default:
        return null;
    }

    return this.insightRepo.create({
      leadId: lead.id,
      type: InsightType.NextBestAction,
      title,
      content,
      confidence,
    });
  }

  private generateRiskAssessment(lead: Lead, activities: Activity[]): AIInsight | null {
    const daysSinceLastActivity = activities.length > 0
      ? (Date.now() - new Date(activities[0].createdAt).getTime()) / (1000 * 60 * 60 * 24)
      : Infinity;

    if (lead.status === 'Won' || lead.status === 'Lost') return null;

    let title: string | null = null;
    let content: string;
    let confidence: number;

    if (daysSinceLastActivity > 14 && lead.status !== 'New') {
      title = 'Stale Lead Warning';
      content = `No activity with ${lead.firstName} in ${Math.round(daysSinceLastActivity)} days. Leads inactive for more than 2 weeks have a 60% higher chance of going cold. Immediate re-engagement recommended — try a different channel or offer new value.`;
      confidence = 0.88;
    } else if (activities.length <= 1 && lead.status === 'New') {
      title = 'Low Engagement Risk';
      content = `${lead.firstName} has minimal engagement (${activities.length} interaction${activities.length === 1 ? '' : 's'}). New leads without substantive follow-up within the first week have a 70% drop-off rate. Prioritize outreach.`;
      confidence = 0.80;
    } else if (lead.estimatedValue > 150000 && lead.score < 60) {
      title = 'High-Value at Risk';
      content = `This $${lead.estimatedValue.toLocaleString()} opportunity has a below-average lead score of ${lead.score}. The gap between deal size and engagement suggests potential challenges. Consider executive-level outreach to re-energize the opportunity.`;
      confidence = 0.75;
    } else {
      return null;
    }

    return this.insightRepo.create({
      leadId: lead.id,
      type: InsightType.RiskAssessment,
      title,
      content,
      confidence,
    });
  }

  private generateWinProbability(lead: Lead, activities: Activity[]): AIInsight {
    let probability: number;
    const statusWeight: Record<string, number> = {
      New: 10,
      Contacted: 20,
      Qualified: 40,
      Proposal: 55,
      Negotiation: 75,
      Won: 100,
      Lost: 0,
    };

    probability = statusWeight[lead.status] || 10;

    if (activities.length > 5) probability += 10;
    else if (activities.length > 2) probability += 5;

    if (lead.score >= 80) probability += 10;
    else if (lead.score < 40) probability -= 10;

    const hasMeeting = activities.some(a => a.type === 'Meeting');
    if (hasMeeting) probability += 5;

    probability = Math.max(0, Math.min(100, probability));

    return this.insightRepo.create({
      leadId: lead.id,
      type: InsightType.WinProbability,
      title: `${probability}% Win Probability`,
      content: `Based on ${lead.firstName}'s current stage (${lead.status}), engagement level (${activities.length} activities), and lead score (${lead.score}/100), the estimated probability of closing this deal is ${probability}%. ${
        probability >= 70 ? 'Strong close indicators present — maintain momentum.' :
        probability >= 40 ? 'Moderate probability — focus on building value and addressing objections.' :
        'Early stage opportunity — consistent nurturing is key to improving close likelihood.'
      }`,
      confidence: 0.82,
    });
  }
}
