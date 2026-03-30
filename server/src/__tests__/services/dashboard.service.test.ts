const mockCount = jest.fn();
const mockAggregate = jest.fn();
const mockGroupBy = jest.fn();
const mockFindMany = jest.fn();

jest.mock('../../index', () => ({
  prisma: {
    contract: {
      count: (...args: unknown[]) => mockCount(...args),
      aggregate: (...args: unknown[]) => mockAggregate(...args),
      groupBy: (...args: unknown[]) => mockGroupBy(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}));

import { getSummary, getByType, getByStatus, getExpiring } from '../../services/dashboard.service';

describe('DashboardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSummary', () => {
    it('should return summary with totals', async () => {
      mockCount
        .mockResolvedValueOnce(10) // totalContracts
        .mockResolvedValueOnce(3); // pendingApprovals
      mockAggregate.mockResolvedValue({ _sum: { value: 1000000 } });
      mockGroupBy.mockResolvedValue([
        { status: 'DRAFT', _count: 3, _sum: { value: 300000 } },
        { status: 'SIGNED', _count: 7, _sum: { value: 700000 } },
      ]);

      const result = await getSummary();

      expect(result.totalContracts).toBe(10);
      expect(result.totalValue).toBe(1000000);
      expect(result.pendingApprovals).toBe(3);
      expect(result.byStatus).toHaveLength(2);
    });

    it('should handle empty database', async () => {
      mockCount.mockResolvedValue(0);
      mockAggregate.mockResolvedValue({ _sum: { value: null } });
      mockGroupBy.mockResolvedValue([]);

      const result = await getSummary();

      expect(result.totalContracts).toBe(0);
      expect(result.totalValue).toBe(0);
      expect(result.byStatus).toHaveLength(0);
    });
  });

  describe('getByType', () => {
    it('should return aggregation by type', async () => {
      mockGroupBy.mockResolvedValue([
        { type: 'SERVICE', _count: 5, _sum: { value: 500000 } },
        { type: 'SALES', _count: 3, _sum: { value: 300000 } },
      ]);

      const result = await getByType();

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('SERVICE');
      expect(result[0].count).toBe(5);
    });
  });

  describe('getByStatus', () => {
    it('should return aggregation by status', async () => {
      mockGroupBy.mockResolvedValue([
        { status: 'SIGNED', _count: 7, _sum: { value: 700000 } },
      ]);

      const result = await getByStatus();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('SIGNED');
    });
  });

  describe('getExpiring', () => {
    it('should return contracts expiring within 90 days', async () => {
      const futureDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
      mockFindMany.mockResolvedValue([
        {
          id: '1',
          contractNumber: 'HD-2026-0001',
          expiryDate: futureDate,
          partner: { name: 'ABC' },
        },
      ]);

      const result = await getExpiring();

      expect(result).toHaveLength(1);
      expect(result[0].daysLeft).toBeLessThanOrEqual(30);
      expect(result[0].urgency).toBe('critical');
    });

    it('should return empty array when no expiring contracts', async () => {
      mockFindMany.mockResolvedValue([]);

      const result = await getExpiring();

      expect(result).toHaveLength(0);
    });
  });
});
