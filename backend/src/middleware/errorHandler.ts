import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof mongoose.Error.ValidationError) {
    const firstMessage = Object.values(err.errors)[0]?.message ?? 'Validation error';
    res.status(400).json({ error: firstMessage });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
}
