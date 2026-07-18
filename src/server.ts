import 'dotenv/config';
import app from './app';
import { startWhatsAppCron } from './jobs/whatsapp.job';

const PORT = process.env.PORT || 5000;

// Initialize Scheduled Jobs
startWhatsAppCron();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
