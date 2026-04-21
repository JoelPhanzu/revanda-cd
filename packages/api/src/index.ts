import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { paymentController } from './controllers/paymentController';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimit';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());

app.post('/api/payments/webhook', apiRateLimiter, express.raw({ type: 'application/json' }), paymentController.handleWebhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: '🚀 Bienvenue sur REVANDA.CD API',
    version: '1.0.0',
    status: 'En ligne',
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Serveur REVANDA.CD lancé sur http://localhost:${PORT}`);
});
