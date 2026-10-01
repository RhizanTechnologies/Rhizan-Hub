import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import projectRoutes from './routes/projectRoutes';
import clientRoutes from './routes/clientRoutes';
import timeRoutes from './routes/timeRoutes';
import teamRoutes from './routes/teamRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import approachRoutes from './routes/approachRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3001',
  'http://localhost:3000',
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or in allowed list
      if (!origin || allowedOrigins.includes(origin)) {
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Rhizan Hub API',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Rhizan Hub Server running on port ${PORT}`);
  console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
});
