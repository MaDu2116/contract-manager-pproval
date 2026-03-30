import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import * as userService from '../services/user.service';

export const userRoutes = Router();

userRoutes.get('/', requireAuth, requireRole('MANAGER'), async (req: Request, res: Response) => {
  try {
    const result = await userService.listUsers(req.query as Record<string, string>);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

userRoutes.post('/', requireAuth, requireRole('MANAGER'), async (req: Request, res: Response) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

userRoutes.put('/:id', requireAuth, requireRole('MANAGER'), async (req: Request, res: Response) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});
