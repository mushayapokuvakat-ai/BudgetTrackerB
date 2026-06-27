import { Router } from 'express';
import { getInsights } from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/insights', getInsights);

export default router;
