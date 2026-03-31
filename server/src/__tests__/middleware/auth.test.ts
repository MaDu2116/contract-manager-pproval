import { Request, Response, NextFunction } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockReq = { session: {} as Request['session'] };
    mockRes = { status: statusMock };
    mockNext = jest.fn();
  });

  describe('requireAuth', () => {
    it('should call next when user is authenticated', () => {
      mockReq.session = { userId: 'user-1' } as Request['session'];

      requireAuth(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should return 401 when not authenticated', () => {
      requireAuth(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Chưa đăng nhập' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('should call next when user has required role', () => {
      mockReq.session = { userId: 'user-1', userRole: 'MANAGER' } as Request['session'];

      const middleware = requireRole('MANAGER' as never, 'LEGAL_ADMIN' as never);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 403 when user lacks required role', () => {
      mockReq.session = { userId: 'user-1', userRole: 'VIEWER' } as Request['session'];

      const middleware = requireRole('MANAGER' as never);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Không có quyền thực hiện thao tác này' });
    });

    it('should return 403 when no role in session', () => {
      const middleware = requireRole('MANAGER' as never);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(403);
    });
  });
});
