import { Router, Request, Response } from 'express';
import { ConversationRepository } from '../repositories/conversation.repository';

const router = Router();
const repo = new ConversationRepository();

router.get('/', (_req: Request, res: Response) => {
  const conversations = repo.findAll();
  res.json({ success: true, data: conversations });
});

router.get('/:id', (req: Request, res: Response) => {
  const conversation = repo.findById(req.params.id);
  if (!conversation) {
    res.status(404).json({ success: false, error: 'Conversation not found' });
    return;
  }
  res.json({ success: true, data: conversation });
});

router.patch('/:id/close', (req: Request, res: Response) => {
  repo.close(req.params.id);
  const conversation = repo.findById(req.params.id);
  res.json({ success: true, data: conversation });
});

export default router;
