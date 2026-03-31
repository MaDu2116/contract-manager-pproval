import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import * as notificationService from '../services/notification.service';

export const notificationRoutes = Router();

notificationRoutes.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await notificationService.listNotifications(
      req.session.userId!,
      req.query as Record<string, string>,
    );
    res.json(result);
  } catch (_error) {
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

notificationRoutes.get('/unread-count', requireAuth, async (req: Request, res: Response) => {
  try {
    const count = await notificationService.getUnreadCount(req.session.userId!);
    res.json({ count });
  } catch (_error) {
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

notificationRoutes.patch('/:id/read', requireAuth, async (req: Request, res: Response) => {
  try {
    await notificationService.markAsRead(req.params.id, req.session.userId!);
    res.json({ message: 'Đã đánh dấu đã đọc' });
  } catch (_error) {
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

notificationRoutes.patch('/read-all', requireAuth, async (req: Request, res: Response) => {
  try {
    await notificationService.markAllAsRead(req.session.userId!);
    res.json({ message: 'Đã đánh dấu tất cả đã đọc' });
  } catch (_error) {
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});
