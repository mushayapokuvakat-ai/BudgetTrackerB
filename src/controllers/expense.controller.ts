import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const createExpense = async (req: Request, res: Response) => {
  try {
    const { category, amount, description, expense_date } = req.body;
    const userId = (req as any).user.id;

    if (!category || !amount || !expense_date) {
      return res.status(400).json({ status: 'error', message: 'Missing fields' });
    }

    const expense = await prisma.expense.create({
      data: {
        user_id: userId,
        category,
        amount,
        description,
        expense_date: new Date(expense_date),
      },
    });

    res.status(201).json({ status: 'success', data: expense });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const expenses = await prisma.expense.findMany({
      where: { user_id: userId },
      orderBy: { expense_date: 'desc' },
    });
    res.status(200).json({ status: 'success', data: expenses });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.id;

    const expense = await prisma.expense.findFirst({ where: { id, user_id: userId } });
    if (!expense) return res.status(404).json({ status: 'error', message: 'Not found' });

    await prisma.expense.delete({ where: { id } });
    res.status(200).json({ status: 'success', message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};
