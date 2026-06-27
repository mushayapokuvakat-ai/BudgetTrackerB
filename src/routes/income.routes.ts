import { Router } from 'express';
import { createIncome, getIncomes, deleteIncome } from '../controllers/income.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.post('/', createIncome);
router.get('/', getIncomes);
router.delete('/:id', deleteIncome);

export default router;
