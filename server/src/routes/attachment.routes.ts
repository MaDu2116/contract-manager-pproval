import { Router, Request, Response } from 'express';
import path from 'path';
import { requireAuth, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';
import * as attachmentService from '../services/attachment.service';

export const attachmentRoutes = Router();

// Download attachment (this is on /api/attachments/:id/download)
attachmentRoutes.get('/:id/download', requireAuth, async (req: Request, res: Response) => {
  try {
    const attachment = await attachmentService.getAttachmentById(req.params.id);
    if (!attachment) return res.status(404).json({ error: 'File không tồn tại' });

    const filePath = path.join(__dirname, '../../../uploads', attachment.filePath);
    res.download(filePath, attachment.fileName);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

// View attachment in browser (inline)
attachmentRoutes.get('/:id/view', requireAuth, async (req: Request, res: Response) => {
  try {
    const attachment = await attachmentService.getAttachmentById(req.params.id);
    if (!attachment) return res.status(404).json({ error: 'File không tồn tại' });

    const filePath = path.join(__dirname, '../../../uploads', attachment.filePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${attachment.fileName}"`);
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

// Delete attachment
attachmentRoutes.delete('/:id', requireAuth, requireRole('LEGAL_ADMIN'), async (req: Request, res: Response) => {
  try {
    await attachmentService.deleteAttachment(req.params.id);
    res.json({ message: 'Đã xóa file' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});
