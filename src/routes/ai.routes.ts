import { Router } from 'express';
import { chatWithAdvisor, uploadStatement, confirmTransactions } from '../controllers/ai.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload';

const router = Router();

router.use(authenticate);
router.post('/chat', chatWithAdvisor);
router.post('/upload-statement', upload.single('statement'), uploadStatement);
router.post('/confirm-transactions', confirmTransactions);

export default router;
