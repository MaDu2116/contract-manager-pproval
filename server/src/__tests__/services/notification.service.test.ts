const mockFindMany = jest.fn();
const mockNotifCount = jest.fn();
const mockUpdateMany = jest.fn();
const mockNotifCreate = jest.fn();

jest.mock('../../index', () => ({
  prisma: {
    notification: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      count: (...args: unknown[]) => mockNotifCount(...args),
      updateMany: (...args: unknown[]) => mockUpdateMany(...args),
      create: (...args: unknown[]) => mockNotifCreate(...args),
    },
  },
}));

import { listNotifications, getUnreadCount, markAsRead, markAllAsRead, createNotification } from '../../services/notification.service';

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listNotifications', () => {
    it('should return paginated notifications', async () => {
      mockFindMany.mockResolvedValue([{ id: '1', title: 'Test' }]);
      mockNotifCount.mockResolvedValue(1);

      const result = await listNotifications('user-1', { page: '1', limit: '10' });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter by is_read', async () => {
      mockFindMany.mockResolvedValue([]);
      mockNotifCount.mockResolvedValue(0);

      await listNotifications('user-1', { is_read: 'false' });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'user-1', isRead: false }),
        }),
      );
    });
  });

  describe('getUnreadCount', () => {
    it('should return count of unread notifications', async () => {
      mockNotifCount.mockResolvedValue(5);

      const result = await getUnreadCount('user-1');

      expect(result).toBe(5);
      expect(mockNotifCount).toHaveBeenCalledWith({
        where: { userId: 'user-1', isRead: false },
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark specific notification as read', async () => {
      mockUpdateMany.mockResolvedValue({ count: 1 });

      await markAsRead('notif-1', 'user-1');

      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: { id: 'notif-1', userId: 'user-1' },
        data: { isRead: true },
      });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      mockUpdateMany.mockResolvedValue({ count: 3 });

      await markAllAsRead('user-1');

      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', isRead: false },
        data: { isRead: true },
      });
    });
  });

  describe('createNotification', () => {
    it('should create a new notification', async () => {
      const params = {
        userId: 'user-1',
        contractId: 'contract-1',
        type: 'APPROVAL_NEEDED',
        title: 'Test',
        message: 'Test message',
      };
      mockNotifCreate.mockResolvedValue({ id: 'notif-1', ...params });

      const result = await createNotification(params);

      expect(result.id).toBe('notif-1');
      expect(mockNotifCreate).toHaveBeenCalledWith({ data: params });
    });
  });
});
