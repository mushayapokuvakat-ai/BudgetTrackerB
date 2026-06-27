import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const setSavingsPercentage = async (req: Request, res: Response) => {
  try {
    const { percentage, month } = req.body;
    const userId = (req as any).user.id;

    if (percentage === undefined || !month) {
      return res.status(400).json({ status: 'error', message: 'Missing fields' });
    }

    // Auto-calculate savings based on income for that month
    const incomes = await prisma.income.findMany({
      where: {
        user_id: userId,
        date_received: {
          gte: new Date(`${month}-01`),
          lt: new Date(new Date(`${month}-01`).setMonth(new Date(`${month}-01`).getMonth() + 1))
        }
      }
    });

    const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount), 0);
    const amount_saved = (totalIncome * percentage) / 100;

    const savings = await prisma.savings.upsert({
      where: {
        user_id_month: {
          user_id: userId,
          month
        }
      },
      update: {
        percentage,
        amount_saved
      },
      create: {
        user_id: userId,
        percentage,
        amount_saved,
        month
      }
    });

    res.status(200).json({ status: 'success', data: savings });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

export const getSavings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const savings = await prisma.savings.findMany({
      where: { user_id: userId },
      orderBy: { month: 'desc' }
    });
    res.status(200).json({ status: 'success', data: savings });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};
