import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { exportContractsToExcel } from '../services/export.service';

export const exportRoutes = Router();

exportRoutes.get('/contracts', requireAuth, async (req: Request, res: Response) => {
  try {
    const buffer = await exportContractsToExcel(req.query as Record<string, string>);
    const filename = `hop-dong-${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (_error) {
    res.status(500).json({ error: 'Lỗi xuất file Excel' });
  }
});
