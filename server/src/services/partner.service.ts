import { prisma } from '../index';
import { parsePagination, paginatedResult } from '../utils/pagination';
import { CreatePartnerInput } from '../validators/partner.schema';

export async function listPartners(query: { search?: string; page?: string; limit?: string }) {
  const { page, limit, skip } = parsePagination(query);

  const where = query.search
    ? {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' as const } },
          { taxCode: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.partner.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.partner.count({ where }),
  ]);

  return paginatedResult(data, total, page, limit);
}

export async function getPartnerById(id: string) {
  return prisma.partner.findUnique({ where: { id } });
}

export async function createPartner(data: CreatePartnerInput) {
  return prisma.partner.create({ data });
}

export async function updatePartner(id: string, data: Partial<CreatePartnerInput>) {
  return prisma.partner.update({ where: { id }, data });
}
