import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { prisma } from '../index';
import { parsePagination, paginatedResult } from '../utils/pagination';

export async function listUsers(query: { page?: string; limit?: string }) {
  const { page, limit, skip } = parsePagination(query);

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, fullName: true, role: true, isActive: true, createdAt: true },
    }),
    prisma.user.count(),
  ]);

  return paginatedResult(data, total, page, limit);
}

export async function createUser(data: { email: string; fullName: string; role: Role; password: string }) {
  const passwordHash = await bcrypt.hash(data.password, 10);
  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      role: data.role,
    },
    select: { id: true, email: true, fullName: true, role: true, isActive: true, createdAt: true },
  });
}

export async function updateUser(id: string, data: { fullName?: string; role?: Role; isActive?: boolean; password?: string }) {
  const updateData: Record<string, unknown> = {};
  if (data.fullName) updateData.fullName = data.fullName;
  if (data.role) updateData.role = data.role;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.password) updateData.passwordHash = await bcrypt.hash(data.password, 10);

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, email: true, fullName: true, role: true, isActive: true, createdAt: true },
  });
}
