import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import statsRoutes from './routes/statsRoutes';
import songRoutes from './routes/songRoutes';

const app = express();

// Security headers
app.use(helmet());

// CORS — allow the deployed frontend and local dev
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://test-app-smoky-ten.vercel.app',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);

// Parse JSON bodies
app.use(express.json());

// JSON parse error handler — catches SyntaxError thrown by express.json()
app.use((err: Error, _req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: 'Invalid JSON' });
    return;
  }
  next(err);
});

// Song routes
app.use('/api/songs', songRoutes);

// Routes
app.use('/api/stats', statsRoutes);

// Global error handler (registered last, after routes are wired in)
app.use(errorHandler);

export default app;
