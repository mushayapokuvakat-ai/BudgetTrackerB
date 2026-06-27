import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const createIncome = async (req: Request, res: Response) => {
  try {
    const { amount, frequency, source, date_received } = req.body;
    const userId = (req as any).user.id;

    if (!amount || !source || !date_received || !frequency) {
      return res.status(400).json({ status: 'error', message: 'Missing fields' });
    }

    const income = await prisma.income.create({
      data: {
        user_id: userId,
        amount,
        frequency,
        source,
        date_received: new Date(date_received),
      },
    });

    res.status(201).json({ status: 'success', data: income });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

export const getIncomes = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const incomes = await prisma.income.findMany({
      where: { user_id: userId },
      orderBy: { date_received: 'desc' },
    });
    res.status(200).json({ status: 'success', data: incomes });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

export const deleteIncome = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.id;

    const income = await prisma.income.findFirst({ where: { id, user_id: userId } });
    if (!income) return res.status(404).json({ status: 'error', message: 'Not found' });

    await prisma.income.delete({ where: { id } });
    res.status(200).json({ status: 'success', message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};
