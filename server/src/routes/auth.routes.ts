import { Router, Request, Response } from 'express';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { loginSchema } from '../validators/auth.schema';
import { authenticateUser, getUserById } from '../services/auth.service';

export const authRoutes = Router();

authRoutes.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const user = await authenticateUser(req.body.email, req.body.password);
    if (!user) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    req.session.userId = user.id;
    req.session.userRole = user.role;
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

authRoutes.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Lỗi đăng xuất' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Đăng xuất thành công' });
  });
});

authRoutes.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await getUserById(req.session.userId!);
    if (!user) return res.status(404).json({ error: 'Người dùng không tồn tại' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});
