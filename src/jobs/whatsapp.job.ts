import cron from 'node-cron';
import axios from 'axios';
import prisma from '../config/prisma';

const sendWhatsAppMessage = async (to: string, text: string) => {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.error('WhatsApp API credentials not configured.');
    return;
  }

  // Ensure phone number starts with country code without +
  const formattedPhone = to.replace(/\+/g, '');

  try {
    await axios.post(
      `https://graph.facebook.com/v17.0/${phoneId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: { body: text }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`WhatsApp message sent to ${to}`);
  } catch (error: any) {
    console.error(`Failed to send WhatsApp to ${to}:`, error.response?.data || error.message);
  }
};

export const startWhatsAppCron = () => {
  // Run every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily WhatsApp budget reminders...');
    
    try {
      const users = await prisma.user.findMany({
        where: { phone: { not: null }, status: 'ACTIVE' }
      });

      for (const user of users) {
        if (!user.phone) continue;

        const incomes = await prisma.income.findMany({ where: { user_id: user.id } });
        const expenses = await prisma.expense.findMany({ where: { user_id: user.id } });

        const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount), 0);
        const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
        const balance = totalIncome - totalExpenses;

        let message = `Hello ${user.fullname}! Here is your daily SmartBudget AI summary:\n\n`;
        message += `📈 Total Income: $${totalIncome}\n`;
        message += `📉 Total Expenses: $${totalExpenses}\n`;
        message += `💰 Remaining Balance: $${balance}\n\n`;

        if (totalExpenses > totalIncome * 0.8) {
          message += `⚠️ ALERT: You have spent over 80% of your income. Please monitor your spending!`;
        } else {
          message += `✅ You are doing great. Keep up the good savings habits!`;
        }

        await sendWhatsAppMessage(user.phone, message);
      }
    } catch (error) {
      console.error('Error in WhatsApp Cron Job:', error);
    }
  });

  console.log('WhatsApp CRON Job initialized.');
};
