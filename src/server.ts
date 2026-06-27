import app from './app';
import dotenv from 'dotenv';
import { startWhatsAppCron } from './jobs/whatsapp.job';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Initialize Scheduled Jobs
startWhatsAppCron();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
