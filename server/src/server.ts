import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import projectRoutes from './routes/projectRoutes';
import clientRoutes from './routes/clientRoutes';
import timeRoutes from './routes/timeRoutes';
import teamRoutes from './routes/teamRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import approachRoutes from './routes/approachRoutes';
import nicheRoutes from './routes/nicheRoutes';
import reportRoutes from './routes/reportRoutes';
import standupRoutes from './routes/standupRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB on startup
connectDB();

// Middleware: ensure database connection is ready for serverless requests
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Error ensuring DB connection:', err);
  }
  next();
});

// Middleware: CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3001',
  'http://localhost:3000',
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, server-to-server) or in whitelist, or vercel preview/prod domains
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/time', timeRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/approaches', approachRoutes);
app.use('/api/niches', nicheRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/standups', standupRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Rhizan Hub API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Root fallback
app.get('/', (_req, res) => {
  res.json({
    name: 'Rhizan Hub API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Start listener only in non-serverless environments (local dev or VPS container)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Rhizan Hub Server running on port ${PORT}`);
    console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
  });
}

export default app;
