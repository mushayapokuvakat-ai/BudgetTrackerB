import { Router } from 'express';
import { chatWithAdvisor } from '../controllers/ai.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.post('/chat', chatWithAdvisor);

export default router;
