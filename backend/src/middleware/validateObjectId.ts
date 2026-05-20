import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export function validateObjectId(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: 'Invalid song ID format' });
    return;
  }
  next();
}
