import { Router } from 'express';
import { getGoals, addGoal, updateGoal, deleteGoal } from '../controllers/goals.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/', getGoals);
router.post('/', addGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

export default router;
