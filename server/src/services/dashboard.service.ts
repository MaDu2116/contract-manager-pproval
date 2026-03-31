import { ContractStatus } from '@prisma/client';
import { prisma } from '../index';

export async function getSummary() {
  const [totalContracts, totalValue, byStatus, pendingApprovals] = await Promise.all([
    prisma.contract.count(),
    prisma.contract.aggregate({ _sum: { value: true } }),
    prisma.contract.groupBy({ by: ['status'], _count: true, _sum: { value: true } }),
    prisma.contract.count({
      where: { status: { in: [ContractStatus.LEGAL_REVIEW, ContractStatus.MANAGER_APPROVAL] } },
    }),
  ]);

  return {
    totalContracts,
    totalValue: totalValue._sum.value || 0,
    pendingApprovals,
    byStatus: byStatus.map((s) => ({
      status: s.status,
      count: s._count,
      value: s._sum.value || 0,
    })),
  };
}

export async function getByType() {
  const result = await prisma.contract.groupBy({
    by: ['type'],
    _count: true,
    _sum: { value: true },
  });

  return result.map((r) => ({
    type: r.type,
    count: r._count,
    value: r._sum.value || 0,
  }));
}

export async function getByStatus() {
  const result = await prisma.contract.groupBy({
    by: ['status'],
    _count: true,
    _sum: { value: true },
  });

  return result.map((r) => ({
    status: r.status,
    count: r._count,
    value: r._sum.value || 0,
  }));
}

export async function getExpiring() {
  const now = new Date();
  const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const contracts = await prisma.contract.findMany({
    where: {
      status: ContractStatus.SIGNED,
      expiryDate: { lte: in90, gte: now },
    },
    include: { partner: { select: { name: true } } },
    orderBy: { expiryDate: 'asc' },
  });

  return contracts.map((c) => {
    const daysLeft = Math.ceil(
      ((c.expiryDate as Date).getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
    );
    return {
      ...c,
      daysLeft,
      urgency: daysLeft <= 30 ? 'critical' : daysLeft <= 60 ? 'warning' : 'info',
    };
  });
}
