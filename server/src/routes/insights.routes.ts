import { Router, Request, Response } from 'express';
import { InsightRepository } from '../repositories/insight.repository';
import { LeadRepository } from '../repositories/lead.repository';
import { ActivityRepository } from '../repositories/activity.repository';
import { ScoringService } from '../services/scoring.service';
import { InsightsService } from '../services/insights.service';

const router = Router({ mergeParams: true });
const insightRepo = new InsightRepository();
const leadRepo = new LeadRepository();
const activityRepo = new ActivityRepository();
const scoringService = new ScoringService();
const insightsService = new InsightsService();

router.get('/', (req: Request, res: Response) => {
  const insights = insightRepo.findByLeadId(req.params.id);
  res.json({ success: true, data: insights });
});

router.post('/regenerate', (req: Request, res: Response) => {
  const lead = leadRepo.findById(req.params.id);
  if (!lead) {
    res.status(404).json({ success: false, error: 'Lead not found' });
    return;
  }

  const activities = activityRepo.findByLeadId(req.params.id);
  const { score, factors } = scoringService.calculateScore(lead, activities);
  leadRepo.updateScore(req.params.id, score);

  const updatedLead = leadRepo.findById(req.params.id)!;
  const insights = insightsService.generateInsights(updatedLead, activities, factors);

  res.json({ success: true, data: { score, factors, insights } });
});

export default router;
