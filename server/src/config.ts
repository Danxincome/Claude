import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  databasePath: process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'leadflow.db'),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientDistPath: path.join(__dirname, '..', '..', 'client', 'dist'),
};
