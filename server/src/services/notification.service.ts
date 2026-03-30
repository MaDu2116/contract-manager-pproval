import { prisma } from '../index';
import { parsePagination, paginatedResult } from '../utils/pagination';

export async function listNotifications(userId: string, query: { is_read?: string; page?: string; limit?: string }) {
  const { page, limit, skip } = parsePagination(query);

  const where: Record<string, unknown> = { userId };
  if (query.is_read !== undefined) {
    where.isRead = query.is_read === 'true';
  }

  const [data, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { contract: { select: { contractNumber: true, title: true } } },
    }),
    prisma.notification.count({ where }),
  ]);

  return paginatedResult(data, total, page, limit);
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function markAsRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function createNotification(params: {
  userId: string;
  contractId?: string;
  type: string;
  title: string;
  message: string;
}) {
  return prisma.notification.create({ data: params });
}
