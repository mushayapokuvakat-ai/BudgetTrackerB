import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getGoals = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const goals = await prisma.goal.findMany({ where: { user_id: userId } });
    res.status(200).json({ status: 'success', data: goals });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch goals' });
  }
};

export const addGoal = async (req: Request, res: Response) => {
  try {
    const { name, target_amount, current_amount, deadline } = req.body;
    const userId = (req as any).user.id;

    if (!name || !target_amount) {
      return res.status(400).json({ status: 'error', message: 'Name and Target Amount are required' });
    }

    const goal = await prisma.goal.create({
      data: {
        name,
        target_amount,
        current_amount: current_amount || 0,
        deadline: deadline ? new Date(deadline) : null,
        user_id: userId
      }
    });
    res.status(201).json({ status: 'success', data: goal });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to create goal' });
  }
};

export const updateGoal = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { current_amount } = req.body;
    const userId = (req as any).user.id;

    const existingGoal = await prisma.goal.findFirst({ where: { id, user_id: userId } });
    if (!existingGoal) return res.status(404).json({ status: 'error', message: 'Goal not found' });

    const goal = await prisma.goal.update({
      where: { id },
      data: { current_amount }
    });
    res.status(200).json({ status: 'success', data: goal });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to update goal' });
  }
};

export const deleteGoal = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.id;

    const existingGoal = await prisma.goal.findFirst({ where: { id, user_id: userId } });
    if (!existingGoal) return res.status(404).json({ status: 'error', message: 'Goal not found' });

    await prisma.goal.delete({ where: { id } });
    res.status(200).json({ status: 'success', message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to delete goal' });
  }
};
