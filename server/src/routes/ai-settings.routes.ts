import { Router, Request, Response } from 'express';
import { AISettingsRepository } from '../repositories/ai-settings.repository';

const router = Router();
const repo = new AISettingsRepository();

router.get('/', (_req: Request, res: Response) => {
  const settings = repo.get();
  res.json({ success: true, data: settings });
});

router.put('/', (req: Request, res: Response) => {
  const settings = repo.update(req.body);
  res.json({ success: true, data: settings });
});

export default router;
