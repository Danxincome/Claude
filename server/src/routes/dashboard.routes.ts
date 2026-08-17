import { Router, Request, Response } from 'express';
import { LeadRepository } from '../repositories/lead.repository';
import { ActivityRepository } from '../repositories/activity.repository';

const router = Router();
const leadRepo = new LeadRepository();
const activityRepo = new ActivityRepository();

router.get('/', (_req: Request, res: Response) => {
  const metrics = leadRepo.getMetrics();
  const recentActivities = activityRepo.getRecentAcrossLeads(10);

  res.json({
    success: true,
    data: {
      ...metrics,
      recentActivities,
    },
  });
});

export default router;
