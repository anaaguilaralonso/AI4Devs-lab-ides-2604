import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ message: 'File size must not exceed 5 MB' });
      return;
    }
    res.status(400).json({ message: err.message });
    return;
  }

  if (err instanceof Error && err.message === 'INVALID_FILE_TYPE') {
    res.status(400).json({ message: 'Only PDF or DOCX files are allowed' });
    return;
  }

  console.error(err);
  res.status(500).json({
    message: 'Internal server error. Please try again later.',
  });
}
