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

export const uploadStatement = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    const base64Data = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const systemPrompt = `You are an AI Financial Advisor for the SmartBudget AI app.
The user has uploaded an e-statement PDF. Extract all income and expense transactions.
Be generalized and handle any e-statement from any country (e.g. Zimbabwe). Ensure the dates are mapped to YYYY-MM-DD.
Return a STRICT JSON object with two fields: 'summary' (a natural language summary of what you found) and 'transactions' (an array of objects with fields: 'id' (a random unique string), 'date' (YYYY-MM-DD), 'description' (string), 'amount' (number), 'type' (either 'INCOME' or 'EXPENSE')). 
Do not include any markdown formatting like \`\`\`json. Just output the raw JSON object.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            { 
              role: 'user', 
              parts: [
                { text: systemPrompt },
                { inlineData: { data: base64Data, mimeType } }
              ] 
            }
        ],
    });

    let jsonStr = response.text || "{}";
    jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      const parsed = JSON.parse(jsonStr);
      res.status(200).json({ status: 'success', data: parsed });
    } catch (parseError) {
      console.error("Failed to parse JSON from AI:", jsonStr);
      res.status(500).json({ status: 'error', message: 'Failed to parse AI response' });
    }

  } catch (error) {
    console.error('AI Upload Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to process statement' });
  }
};

export const confirmTransactions = async (req: Request, res: Response) => {
  try {
    const { transactions } = req.body;
    const userId = (req as any).user.id;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No transactions to confirm' });
    }

    let addedCount = 0;
    for (const txn of transactions) {
      if (txn.type === 'INCOME') {
        await prisma.income.create({
          data: {
            user_id: userId,
            source: txn.description,
            amount: txn.amount,
            date_received: new Date(txn.date),
            frequency: 'One-time'
          }
        });
        addedCount++;
      } else if (txn.type === 'EXPENSE') {
        await prisma.expense.create({
          data: {
            user_id: userId,
            description: txn.description,
            amount: txn.amount,
            expense_date: new Date(txn.date),
            category: 'General'
          }
        });
        addedCount++;
      }
    }

    res.status(200).json({ status: 'success', message: `Successfully added ${addedCount} transactions.` });
  } catch (error) {
    console.error('Confirm Transactions Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to save transactions' });
  }
};
