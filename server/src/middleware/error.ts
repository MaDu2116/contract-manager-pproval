import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('Error:', err.message);

  if (err.message === 'Chỉ chấp nhận file PDF') {
    return res.status(400).json({ error: err.message });
  }

  if (err.message.includes('File too large')) {
    return res.status(400).json({ error: 'File vượt quá 20MB' });
  }

  res.status(500).json({ error: 'Lỗi hệ thống' });
}
