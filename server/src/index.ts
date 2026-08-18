import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { config } from './config';
import { runMigrations } from './db/migrate';
import { closeDb } from './db/connection';
import leadsRoutes from './routes/leads.routes';
import activitiesRoutes from './routes/activities.routes';
import insightsRoutes from './routes/insights.routes';
import dashboardRoutes from './routes/dashboard.routes';
import searchRoutes from './routes/search.routes';
import aiSettingsRoutes from './routes/ai-settings.routes';
import conversationsRoutes from './routes/conversations.routes';
import chatRoutes from './routes/chat.routes';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

app.use('/api/leads/:id/activities', activitiesRoutes);
app.use('/api/leads/:id/insights', insightsRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/ai-settings', aiSettingsRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/chat', chatRoutes);

if (config.nodeEnv === 'production') {
  app.use(express.static(config.clientDistPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(config.clientDistPath, 'index.html'));
  });
}

runMigrations();

const server = app.listen(config.port, () => {
  console.log(`LeadFlow AI server running on port ${config.port}`);
});

function shutdown() {
  console.log('Shutting down...');
  server.close(() => {
    closeDb();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
