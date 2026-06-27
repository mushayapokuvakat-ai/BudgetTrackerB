import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import prisma from '../config/prisma';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const chatWithAdvisor = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const userId = (req as any).user.id;

    if (!message) {
      return res.status(400).json({ status: 'error', message: 'Message is required' });
    }

    // Fetch user context
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    
    // Get incomes and expenses for basic context
    const incomes = await prisma.income.findMany({ where: { user_id: userId } });
    const expenses = await prisma.expense.findMany({ where: { user_id: userId } });
    const savings = await prisma.savings.findMany({ where: { user_id: userId, month: currentMonth } });

    const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalSavings = savings.reduce((sum, item) => sum + Number(item.amount_saved), 0);

    const systemPrompt = `You are an AI Financial Advisor for the SmartBudget AI app.
The user is ${user?.fullname}.
Their current financial status:
- Total Income: $${totalIncome}
- Total Expenses: $${totalExpenses}
- Total Savings for this month: $${totalSavings}
- Remaining Balance: $${totalIncome - totalExpenses}

Based on this data, provide helpful, concise, and professional financial advice.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            { role: 'user', parts: [{ text: systemPrompt + '\n\nUser query: ' + message }] }
        ],
    });

    res.status(200).json({ status: 'success', data: { reply: response.text } });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to communicate with AI Advisor' });
  }
};
