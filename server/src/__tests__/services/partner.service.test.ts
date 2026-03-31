const mockFindMany = jest.fn();
const mockCount = jest.fn();
const mockFindUnique = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();

jest.mock('../../index', () => ({
  prisma: {
    partner: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      count: (...args: unknown[]) => mockCount(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

import { listPartners, getPartnerById, createPartner, updatePartner } from '../../services/partner.service';

describe('PartnerService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('listPartners', () => {
    it('should list partners with pagination', async () => {
      const partners = [{ id: '1', name: 'Partner A' }];
      mockFindMany.mockResolvedValue(partners);
      mockCount.mockResolvedValue(1);

      const result = await listPartners({ page: '1', limit: '10' });

      expect(result.data).toEqual(partners);
      expect(result.total).toBe(1);
      expect(mockFindMany).toHaveBeenCalled();
    });

    it('should filter by search term', async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await listPartners({ search: 'ABC' });

      const call = mockFindMany.mock.calls[0][0];
      expect(call.where.OR).toBeDefined();
      expect(call.where.OR).toHaveLength(2);
    });

    it('should return empty when no search', async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      const result = await listPartners({});

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getPartnerById', () => {
    it('should return partner', async () => {
      const partner = { id: '1', name: 'Partner A' };
      mockFindUnique.mockResolvedValue(partner);

      const result = await getPartnerById('1');

      expect(result).toEqual(partner);
      expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should return null if not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await getPartnerById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('createPartner', () => {
    it('should create a partner', async () => {
      const input = { name: 'New Partner' };
      const created = { id: '1', ...input };
      mockCreate.mockResolvedValue(created);

      const result = await createPartner(input);

      expect(result).toEqual(created);
      expect(mockCreate).toHaveBeenCalledWith({ data: input });
    });
  });

  describe('updatePartner', () => {
    it('should update a partner', async () => {
      const updated = { id: '1', name: 'Updated' };
      mockUpdate.mockResolvedValue(updated);

      const result = await updatePartner('1', { name: 'Updated' });

      expect(result).toEqual(updated);
      expect(mockUpdate).toHaveBeenCalledWith({ where: { id: '1' }, data: { name: 'Updated' } });
    });
  });
});
