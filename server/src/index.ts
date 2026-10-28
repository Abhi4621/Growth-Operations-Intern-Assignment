import path from 'path';
import fs from 'fs';
import app from './app.js';
import { config } from './config/index.js';

// Serve production frontend assets if built
const clientDistPath = path.resolve(process.cwd(), '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

const server = app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`🚀 GrowthOps Assessment Backend Server running on port ${config.port}`);
  console.log(`📡 Environment: ${config.nodeEnv}`);
  console.log(`🤖 OpenAI Model: ${config.openai.model}`);
  console.log(`🔑 OpenAI Key Configured: ${Boolean(process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_api_key'))}`);
  console.log(`=======================================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

export default app;
