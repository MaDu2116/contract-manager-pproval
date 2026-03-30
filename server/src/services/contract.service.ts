import { ContractStatus, ContractType, ApprovalActionType, Role } from '@prisma/client';
import { prisma } from '../index';
import { parsePagination, paginatedResult } from '../utils/pagination';
import { generateContractNumber } from '../utils/contract-number';
import { createAuditLog } from './audit.service';
import { createNotification } from './notification.service';
import { sendEmail, approvalNeededEmail } from './email.service';
import { CreateContractInput, UpdateContractInput } from '../validators/contract.schema';

// Allowed workflow transitions
const TRANSITIONS: Record<ContractStatus, ContractStatus[]> = {
  DRAFT: [ContractStatus.LEGAL_REVIEW, ContractStatus.CANCELLED],
  LEGAL_REVIEW: [ContractStatus.MANAGER_APPROVAL, ContractStatus.DRAFT],
  MANAGER_APPROVAL: [ContractStatus.SIGNED, ContractStatus.DRAFT],
  SIGNED: [ContractStatus.EXPIRED],
  EXPIRED: [],
  CANCELLED: [],
};

interface ContractQuery {
  partner?: string;
  type?: string;
  status?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: string;
  limit?: string;
}

export async function listContracts(query: ContractQuery) {
  const { page, limit, skip } = parsePagination(query);

  const where: Record<string, unknown> = {};
  if (query.partner) where.partnerId = query.partner;
  if (query.type) where.type = query.type as ContractType;
  if (query.status) where.status = query.status as ContractStatus;
  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) (where.createdAt as Record<string, unknown>).gte = new Date(query.from);
    if (query.to) (where.createdAt as Record<string, unknown>).lte = new Date(query.to);
  }
  if (query.search) {
    where.OR = [
      { contractNumber: { contains: query.search, mode: 'insensitive' } },
      { title: { contains: query.search, mode: 'insensitive' } },
      { partner: { name: { contains: query.search, mode: 'insensitive' } } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.contract.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        partner: { select: { id: true, name: true } },
        createdBy: { select: { id: true, fullName: true } },
      },
    }),
    prisma.contract.count({ where }),
  ]);

  return paginatedResult(data, total, page, limit);
}

export async function getContractById(id: string) {
  return prisma.contract.findUnique({
    where: { id },
    include: {
      partner: true,
      createdBy: { select: { id: true, fullName: true, email: true } },
      updatedBy: { select: { id: true, fullName: true } },
      attachments: {
        include: { uploadedBy: { select: { id: true, fullName: true } } },
        orderBy: { createdAt: 'desc' },
      },
      approvals: {
        include: { actedBy: { select: { id: true, fullName: true } } },
        orderBy: { createdAt: 'desc' },
      },
      parent: { select: { id: true, contractNumber: true, version: true } },
      renewals: { select: { id: true, contractNumber: true, version: true, status: true }, orderBy: { version: 'asc' } },
    },
  });
}

export async function createContract(data: CreateContractInput, userId: string) {
  const contractNumber = await generateContractNumber();

  const contract = await prisma.contract.create({
    data: {
      contractNumber,
      title: data.title,
      type: data.type,
      partnerId: data.partnerId,
      value: data.value,
      signingDate: data.signingDate ? new Date(data.signingDate) : null,
      effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : null,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      description: data.description,
      createdById: userId,
      updatedById: userId,
    },
    include: { partner: { select: { name: true } } },
  });

  await createAuditLog({
    entityType: 'CONTRACT',
    entityId: contract.id,
    action: 'CREATE',
    performedById: userId,
  });

  return contract;
}

export async function updateContract(id: string, data: UpdateContractInput, userId: string) {
  const existing = await prisma.contract.findUnique({ where: { id } });
  if (!existing) throw new Error('Hợp đồng không tồn tại');
  if (existing.status !== ContractStatus.DRAFT) {
    throw new Error('Chỉ có thể sửa hợp đồng ở trạng thái Nháp');
  }

  const contract = await prisma.contract.update({
    where: { id },
    data: {
      ...data,
      signingDate: data.signingDate ? new Date(data.signingDate) : undefined,
      effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : undefined,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      updatedById: userId,
    },
  });

  await createAuditLog({
    entityType: 'CONTRACT',
    entityId: id,
    action: 'UPDATE',
    performedById: userId,
  });

  return contract;
}

export async function transitionContract(
  id: string,
  toStatus: ContractStatus,
  actionType: ApprovalActionType,
  userId: string,
  comment?: string,
) {
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: { createdBy: { select: { id: true, email: true } } },
  });
  if (!contract) throw new Error('Hợp đồng không tồn tại');

  const allowed = TRANSITIONS[contract.status];
  if (!allowed.includes(toStatus)) {
    throw new Error(`Không thể chuyển từ ${contract.status} sang ${toStatus}`);
  }

  const [updated] = await Promise.all([
    prisma.contract.update({
      where: { id },
      data: { status: toStatus, updatedById: userId },
    }),
    prisma.approvalAction.create({
      data: {
        contractId: id,
        fromStatus: contract.status,
        toStatus,
        action: actionType,
        comment,
        actedById: userId,
      },
    }),
    createAuditLog({
      entityType: 'CONTRACT',
      entityId: id,
      action: 'STATUS_CHANGE',
      changes: { status: { old: contract.status, new: toStatus } },
      performedById: userId,
    }),
  ]);

  // Notify relevant users
  await notifyStatusChange(contract, toStatus);

  return updated;
}

async function notifyStatusChange(
  contract: { id: string; contractNumber: string; title: string; createdBy: { id: string; email: string } },
  toStatus: ContractStatus,
) {
  if (toStatus === ContractStatus.LEGAL_REVIEW) {
    const legalAdmins = await prisma.user.findMany({ where: { role: Role.LEGAL_ADMIN, isActive: true } });
    for (const user of legalAdmins) {
      await createNotification({
        userId: user.id,
        contractId: contract.id,
        type: 'APPROVAL_NEEDED',
        title: 'Hợp đồng cần review pháp lý',
        message: `Hợp đồng ${contract.contractNumber} cần được review.`,
      });
      const email = approvalNeededEmail(contract.contractNumber, contract.title, 'Legal Review');
      await sendEmail({ to: user.email, ...email });
    }
  } else if (toStatus === ContractStatus.MANAGER_APPROVAL) {
    const managers = await prisma.user.findMany({ where: { role: Role.MANAGER, isActive: true } });
    for (const user of managers) {
      await createNotification({
        userId: user.id,
        contractId: contract.id,
        type: 'APPROVAL_NEEDED',
        title: 'Hợp đồng cần phê duyệt',
        message: `Hợp đồng ${contract.contractNumber} cần được phê duyệt.`,
      });
      const email = approvalNeededEmail(contract.contractNumber, contract.title, 'Manager Approval');
      await sendEmail({ to: user.email, ...email });
    }
  } else if (toStatus === ContractStatus.SIGNED || toStatus === ContractStatus.DRAFT) {
    const statusLabel = toStatus === ContractStatus.SIGNED ? 'đã ký' : 'bị từ chối';
    await createNotification({
      userId: contract.createdBy.id,
      contractId: contract.id,
      type: 'STATUS_CHANGED',
      title: `Hợp đồng ${statusLabel}`,
      message: `Hợp đồng ${contract.contractNumber} đã được chuyển sang trạng thái ${statusLabel}.`,
    });
  }
}

export async function renewContract(id: string, userId: string) {
  const original = await prisma.contract.findUnique({ where: { id } });
  if (!original) throw new Error('Hợp đồng không tồn tại');
  if (original.status !== ContractStatus.SIGNED && original.status !== ContractStatus.EXPIRED) {
    throw new Error('Chỉ có thể gia hạn hợp đồng đã ký hoặc hết hạn');
  }

  // Find the root contract for the version chain
  const rootId = original.parentId || original.id;
  const maxVersion = await prisma.contract.aggregate({
    where: { OR: [{ id: rootId }, { parentId: rootId }] },
    _max: { version: true },
  });

  const contractNumber = await generateContractNumber();

  const renewed = await prisma.contract.create({
    data: {
      contractNumber,
      title: original.title,
      type: original.type,
      partnerId: original.partnerId,
      value: original.value,
      description: original.description,
      parentId: rootId,
      version: (maxVersion._max.version || 1) + 1,
      createdById: userId,
      updatedById: userId,
    },
  });

  await createAuditLog({
    entityType: 'CONTRACT',
    entityId: renewed.id,
    action: 'CREATE',
    changes: { renewedFrom: { old: null, new: original.contractNumber } },
    performedById: userId,
  });

  return renewed;
}

export async function getContractVersions(id: string) {
  const contract = await prisma.contract.findUnique({ where: { id } });
  if (!contract) throw new Error('Hợp đồng không tồn tại');

  const rootId = contract.parentId || contract.id;

  return prisma.contract.findMany({
    where: { OR: [{ id: rootId }, { parentId: rootId }] },
    select: { id: true, contractNumber: true, version: true, status: true, createdAt: true },
    orderBy: { version: 'asc' },
  });
}

export async function getContractHistory(id: string) {
  return prisma.approvalAction.findMany({
    where: { contractId: id },
    include: { actedBy: { select: { id: true, fullName: true } } },
    orderBy: { createdAt: 'asc' },
  });
}
