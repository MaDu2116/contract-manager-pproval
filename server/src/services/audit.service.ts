import { prisma } from '../index';

interface AuditLogParams {
  entityType: string;
  entityId: string;
  action: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  performedById: string;
  ipAddress?: string;
}

export async function createAuditLog(params: AuditLogParams) {
  return prisma.auditLog.create({
    data: {
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      changes: params.changes || undefined,
      performedById: params.performedById,
      ipAddress: params.ipAddress,
    },
  });
}
