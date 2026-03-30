import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'crypto';
import { Request } from 'express';

const storage = multer.diskStorage({
  destination: (_req: Request, _file, cb) => {
    cb(null, path.join(__dirname, '../../../uploads'));
  },
  filename: (_req: Request, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (file.mimetype !== 'application/pdf') {
    cb(new Error('Chỉ chấp nhận file PDF'));
    return;
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
});
