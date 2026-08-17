import { Router, Request, Response } from 'express';
import { LeadRepository } from '../repositories/lead.repository';
import { ActivityRepository } from '../repositories/activity.repository';
import { ScoringService } from '../services/scoring.service';
import { InsightsService } from '../services/insights.service';
import type { LeadFilters } from '../../../shared/src/index';

const router = Router();
const leadRepo = new LeadRepository();
const activityRepo = new ActivityRepository();
const scoringService = new ScoringService();
const insightsService = new InsightsService();

router.get('/', (req: Request, res: Response) => {
  const filters: LeadFilters = {
    status: req.query.status as string,
    source: req.query.source as string,
    search: req.query.search as string,
    scoreMin: req.query.scoreMin ? parseInt(req.query.scoreMin as string, 10) : undefined,
    scoreMax: req.query.scoreMax ? parseInt(req.query.scoreMax as string, 10) : undefined,
    sortBy: (req.query.sortBy as string) || 'created_at',
    sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
    page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
    pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 20,
  };

  const { leads, total } = leadRepo.findAll(filters);
  res.json({
    success: true,
    data: leads,
    pagination: {
      page: filters.page || 1,
      pageSize: filters.pageSize || 20,
      total,
      totalPages: Math.ceil(total / (filters.pageSize || 20)),
    },
  });
});

router.get('/:id', (req: Request, res: Response) => {
  const lead = leadRepo.findById(req.params.id);
  if (!lead) {
    res.status(404).json({ success: false, error: 'Lead not found' });
    return;
  }
  res.json({ success: true, data: lead });
});

router.post('/', (req: Request, res: Response) => {
  const { firstName, lastName, email, company } = req.body;
  if (!firstName || !lastName || !email || !company) {
    res.status(400).json({ success: false, error: 'firstName, lastName, email, and company are required' });
    return;
  }

  const lead = leadRepo.create(req.body);
  const activities = activityRepo.findByLeadId(lead.id);
  const { score, factors } = scoringService.calculateScore(lead, activities);
  leadRepo.updateScore(lead.id, score);
  insightsService.generateInsights({ ...lead, score }, activities, factors);

  const updated = leadRepo.findById(lead.id)!;
  res.status(201).json({ success: true, data: updated });
});

router.put('/:id', (req: Request, res: Response) => {
  const lead = leadRepo.update(req.params.id, req.body);
  if (!lead) {
    res.status(404).json({ success: false, error: 'Lead not found' });
    return;
  }
  res.json({ success: true, data: lead });
});

router.patch('/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  if (!status) {
    res.status(400).json({ success: false, error: 'status is required' });
    return;
  }

  const lead = leadRepo.updateStatus(req.params.id, status);
  if (!lead) {
    res.status(404).json({ success: false, error: 'Lead not found' });
    return;
  }

  activityRepo.create(lead.id, {
    type: 'Note' as any,
    description: `Status changed to ${status}`,
    outcome: '',
  });

  res.json({ success: true, data: lead });
});

router.delete('/:id', (req: Request, res: Response) => {
  const deleted = leadRepo.delete(req.params.id);
  if (!deleted) {
    res.status(404).json({ success: false, error: 'Lead not found' });
    return;
  }
  res.json({ success: true, data: { deleted: true } });
});

export default router;
