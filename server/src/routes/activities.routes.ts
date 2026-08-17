import { Router, Request, Response } from 'express';
import { ActivityRepository } from '../repositories/activity.repository';
import { LeadRepository } from '../repositories/lead.repository';
import { ScoringService } from '../services/scoring.service';

const router = Router({ mergeParams: true });
const activityRepo = new ActivityRepository();
const leadRepo = new LeadRepository();
const scoringService = new ScoringService();

router.get('/', (req: Request, res: Response) => {
  const activities = activityRepo.findByLeadId(req.params.id);
  res.json({ success: true, data: activities });
});

router.post('/', (req: Request, res: Response) => {
  const { type, description } = req.body;
  if (!type || !description) {
    res.status(400).json({ success: false, error: 'type and description are required' });
    return;
  }

  const lead = leadRepo.findById(req.params.id);
  if (!lead) {
    res.status(404).json({ success: false, error: 'Lead not found' });
    return;
  }

  const activity = activityRepo.create(req.params.id, req.body);

  const activities = activityRepo.findByLeadId(req.params.id);
  const { score } = scoringService.calculateScore(lead, activities);
  leadRepo.updateScore(req.params.id, score);

  res.status(201).json({ success: true, data: activity });
});

export default router;
