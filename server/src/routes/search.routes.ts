import { Router, Request, Response } from 'express';
import { LeadRepository } from '../repositories/lead.repository';

const router = Router();
const leadRepo = new LeadRepository();

router.get('/', (req: Request, res: Response) => {
  const q = (req.query.q as string) || '';
  if (q.length < 2) {
    res.json({ success: true, data: [] });
    return;
  }
  const results = leadRepo.search(q);
  res.json({ success: true, data: results });
});

export default router;
