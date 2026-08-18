import { Router, Request, Response } from 'express';
import { ReceptionistService } from '../services/receptionist.service';

const router = Router();
const receptionist = new ReceptionistService();

router.post('/', async (req: Request, res: Response) => {
  const { conversationId, message } = req.body;
  if (conversationId !== undefined && conversationId !== null && typeof conversationId !== 'string') {
    res.status(400).json({ success: false, error: 'conversationId must be a string' });
    return;
  }
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    res.status(400).json({ success: false, error: 'message is required' });
    return;
  }

  if (message.length > 5000) {
    res.status(400).json({ success: false, error: 'Message is too long (max 5000 characters)' });
    return;
  }

  try {
    const result = await receptionist.chat(conversationId, message.trim());
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ success: false, error: 'Failed to process chat message' });
  }
});

export default router;
