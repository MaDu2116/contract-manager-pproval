import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createPartnerSchema, updatePartnerSchema } from '../validators/partner.schema';
import * as partnerService from '../services/partner.service';

export const partnerRoutes = Router();

partnerRoutes.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await partnerService.listPartners(req.query as Record<string, string>);
    res.json(result);
  } catch (_error) {
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

partnerRoutes.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const partner = await partnerService.getPartnerById(req.params.id);
    if (!partner) return res.status(404).json({ error: 'Đối tác không tồn tại' });
    res.json(partner);
  } catch (_error) {
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

partnerRoutes.post('/', requireAuth, requireRole('LEGAL_ADMIN', 'MANAGER'), validate(createPartnerSchema), async (req: Request, res: Response) => {
  try {
    const partner = await partnerService.createPartner(req.body);
    res.status(201).json(partner);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

partnerRoutes.put('/:id', requireAuth, requireRole('LEGAL_ADMIN', 'MANAGER'), validate(updatePartnerSchema), async (req: Request, res: Response) => {
  try {
    const partner = await partnerService.updatePartner(req.params.id, req.body);
    res.json(partner);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});
