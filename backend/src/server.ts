import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import authRouter from './routes/auth';
import postsRouter from './routes/posts';
import leaderboardRouter from './routes/leaderboard';
import claimsRouter from './routes/claims';
import notificationsRouter from './routes/notifications';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/claims', claimsRouter);
app.use('/api/notifications', notificationsRouter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root check
app.get('/', (req, res) => {
  res.send('FoodShare API Server is running.');
});

// Start Server only if not running in Vercel serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
}

export default app;
