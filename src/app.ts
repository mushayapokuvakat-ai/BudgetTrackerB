import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'SmartBudget AI API is running' });
});

import authRoutes from './routes/auth.routes';
import incomeRoutes from './routes/income.routes';
import expenseRoutes from './routes/expense.routes';
import savingsRoutes from './routes/savings.routes';
import adminRoutes from './routes/admin.routes';
import aiRoutes from './routes/ai.routes';
import goalsRoutes from './routes/goals.routes';
import analyticsRoutes from './routes/analytics.routes';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

export default app;
