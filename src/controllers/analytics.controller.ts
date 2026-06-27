import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import prisma from '../config/prisma';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getInsights = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    const incomes = await prisma.income.findMany({ where: { user_id: userId } });
    const expenses = await prisma.expense.findMany({ where: { user_id: userId } });

    const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const riskLevel = totalExpenses > (totalIncome * 0.8) ? 'HIGH' : totalExpenses > (totalIncome * 0.5) ? 'MEDIUM' : 'LOW';

    let aiInsight = 'No insight available yet. Add more data!';
    
    if (totalIncome > 0 || totalExpenses > 0) {
      const prompt = `User ${user?.fullname} has total income of $${totalIncome} and total expenses of $${totalExpenses}. Their risk level is ${riskLevel}. Provide a brief 2-sentence financial insight.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      aiInsight = response.text || aiInsight;
    }

    res.status(200).json({
      status: 'success',
      data: {
        totalIncome,
        totalExpenses,
        riskLevel,
        aiInsight
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to generate analytics' });
  }
};
