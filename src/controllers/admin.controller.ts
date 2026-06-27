import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, fullname: true, email: true, role: true, status: true, created_at: true },
    });
    res.status(200).json({ status: 'success', data: users });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, fullname: true, email: true, role: true, status: true, created_at: true,
        incomes: true, expenses: true, savings: true,
      }
    });

    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

export const suspendUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.user.update({
      where: { id },
      data: { status: 'SUSPENDED' }
    });
    res.status(200).json({ status: 'success', message: 'User suspended' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.user.delete({ where: { id } });
    res.status(200).json({ status: 'success', message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};
