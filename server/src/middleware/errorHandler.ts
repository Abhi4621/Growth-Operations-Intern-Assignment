import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  console.error('Unhandled Server Error:', err);

  const status = err.status || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  // Never expose sensitive environment keys or internal secrets in error responses
  const sanitizedMessage = message
    .replace(/sk-[a-zA-Z0-9_-]{20,}/g, '[REDACTED_API_KEY]')
    .replace(/AQ\.[a-zA-Z0-9_-]{20,}/g, '[REDACTED_GEMINI_KEY]');

  res.status(status).json({
    error: err.code || 'INTERNAL_ERROR',
    message: sanitizedMessage,
    timestamp: new Date().toISOString(),
  });
}
