import { Router, Request, Response } from 'express';
import { AISettingsRepository } from '../repositories/ai-settings.repository';

const router = Router();
const repo = new AISettingsRepository();

router.get('/', (_req: Request, res: Response) => {
  const settings = repo.get();
  res.json({ success: true, data: settings });
});

router.put('/', (req: Request, res: Response) => {
  const { businessName, services, businessHours, location, faqs, bookingInstructions, aiGreeting } = req.body;

  if (typeof businessName !== 'string' || !Array.isArray(services) || !Array.isArray(faqs)) {
    res.status(400).json({ success: false, error: 'Invalid settings data' });
    return;
  }

  const settings = repo.update({
    businessName: businessName || '',
    services: services || [],
    businessHours: businessHours || '',
    location: location || '',
    faqs: faqs || [],
    bookingInstructions: bookingInstructions || '',
    aiGreeting: aiGreeting || '',
  });
  res.json({ success: true, data: settings });
});

export default router;
