import express from 'express';
import cors from 'cors';
import router from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security and CORS configuration
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Payload size limit
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Mount API routes for both /api and root (handles Vercel rewrite paths seamlessly)
app.use('/api', router);
app.use('/', router);

// Centralized error handling
app.use(errorHandler);

export default app;
