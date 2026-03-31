import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import * as dashboardService from '../services/dashboard.service';

export const dashboardRoutes = Router();

dashboardRoutes.get('/summary', requireAuth, async (_req: Request, res: Response) => {
  try {
    const summary = await dashboardService.getSummary();
    res.json(summary);
  } catch (_error) {
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

dashboardRoutes.get('/by-type', requireAuth, async (_req: Request, res: Response) => {
  try {
    const data = await dashboardService.getByType();
    res.json(data);
  } catch (_error) {
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

dashboardRoutes.get('/by-status', requireAuth, async (_req: Request, res: Response) => {
  try {
    const data = await dashboardService.getByStatus();
    res.json(data);
  } catch (_error) {
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

dashboardRoutes.get('/expiring', requireAuth, async (_req: Request, res: Response) => {
  try {
    const data = await dashboardService.getExpiring();
    res.json(data);
  } catch (_error) {
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});
