import { Router } from 'express';
import { getAllUsers, getUserDetails, suspendUser, deleteUser } from '../controllers/admin.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorizeAdmin);

router.get('/users', getAllUsers);
router.get('/user/:id', getUserDetails);
router.put('/suspend/:id', suspendUser);
router.delete('/delete/:id', deleteUser);

export default router;
