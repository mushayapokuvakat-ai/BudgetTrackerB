import { Router } from 'express';
import { createExpense, getExpenses, deleteExpense } from '../controllers/expense.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.post('/', createExpense);
router.get('/', getExpenses);
router.delete('/:id', deleteExpense);

export default router;
