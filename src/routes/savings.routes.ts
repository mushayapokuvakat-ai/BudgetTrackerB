import { Router } from 'express';
import { setSavingsPercentage, getSavings } from '../controllers/savings.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.post('/', setSavingsPercentage);
router.get('/', getSavings);

export default router;
