import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';

// Charger les variables d'environnement depuis .env
dotenv.config();

// Créer l'application Express
const app: Express = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARES (Préprocesseurs de requêtes)
// ============================================

// Utiliser helmet pour la sécurité
app.use(helmet());

// Utiliser CORS pour permettre les requêtes du frontend
app.use(cors());

// Parser JSON
app.use(express.json());

// Parser les données de formulaires
app.use(express.urlencoded({ extended: true }));

// ============================================
// ROUTES
// ============================================

// Route de test
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: '🚀 Bienvenue sur REVANDA.CD API',
    version: '1.0.0',
    status: 'En ligne',
  });
});

// Route de health check (vérifier que le serveur fonctionne)
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

app.listen(PORT, () => {
  console.log(`✅ Serveur REVANDA.CD lancé sur http://localhost:${PORT}`);
  console.log(`📝 API disponible sur http://localhost:${PORT}/api`);
});