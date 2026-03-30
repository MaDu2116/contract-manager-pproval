// Mock prisma
const mockFindMany = jest.fn();
const mockFindFirst = jest.fn();
const mockFindUnique = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockCount = jest.fn();
const mockAggregate = jest.fn();
const mockApprovalCreate = jest.fn();
const mockUserFindMany = jest.fn();

jest.mock('../../index', () => ({
  prisma: {
    contract: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      count: (...args: unknown[]) => mockCount(...args),
      aggregate: (...args: unknown[]) => mockAggregate(...args),
    },
    approvalAction: {
      create: (...args: unknown[]) => mockApprovalCreate(...args),
      findMany: jest.fn().mockResolvedValue([]),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({}),
    },
    user: {
      findMany: (...args: unknown[]) => mockUserFindMany(...args),
    },
    notification: {
      create: jest.fn().mockResolvedValue({}),
      findFirst: jest.fn().mockResolvedValue(null),
    },
  },
}));

jest.mock('../../services/email.service', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  approvalNeededEmail: jest.fn().mockReturnValue({ subject: 'test', html: '<p>test</p>' }),
}));

import { listContracts, getContractById, transitionContract, renewContract } from '../../services/contract.service';

describe('ContractService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listContracts', () => {
    it('should return paginated contracts', async () => {
      const mockContracts = [
        { id: '1', contractNumber: 'HD-2026-0001', title: 'Test Contract' },
      ];
      mockFindMany.mockResolvedValue(mockContracts);
      mockCount.mockResolvedValue(1);

      const result = await listContracts({ page: '1', limit: '10' });

      expect(result.data).toEqual(mockContracts);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should apply search filter', async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await listContracts({ search: 'ABC', page: '1', limit: '10' });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ contractNumber: expect.any(Object) }),
            ]),
          }),
        }),
      );
    });

    it('should apply type filter', async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await listContracts({ type: 'SERVICE', page: '1', limit: '10' });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'SERVICE' }),
        }),
      );
    });

    it('should apply status filter', async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await listContracts({ status: 'DRAFT', page: '1', limit: '20' });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'DRAFT' }),
        }),
      );
    });
  });

  describe('getContractById', () => {
    it('should return contract with relations', async () => {
      const mockContract = {
        id: '1',
        contractNumber: 'HD-2026-0001',
        partner: { name: 'ABC' },
        attachments: [],
        approvals: [],
      };
      mockFindUnique.mockResolvedValue(mockContract);

      const result = await getContractById('1');

      expect(result).toEqual(mockContract);
      expect(mockFindUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1' } }),
      );
    });

    it('should return null for non-existent contract', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await getContractById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('transitionContract', () => {
    it('should transition from DRAFT to LEGAL_REVIEW', async () => {
      mockFindUnique.mockResolvedValue({
        id: '1',
        contractNumber: 'HD-2026-0001',
        title: 'Test',
        status: 'DRAFT',
        createdBy: { id: 'user-1', email: 'test@test.com' },
      });
      mockUpdate.mockResolvedValue({ id: '1', status: 'LEGAL_REVIEW' });
      mockApprovalCreate.mockResolvedValue({});
      mockUserFindMany.mockResolvedValue([]);

      const result = await transitionContract('1', 'LEGAL_REVIEW' as never, 'SUBMIT' as never, 'user-1');

      expect(result.status).toBe('LEGAL_REVIEW');
      expect(mockApprovalCreate).toHaveBeenCalled();
    });

    it('should reject invalid transition', async () => {
      mockFindUnique.mockResolvedValue({
        id: '1',
        status: 'DRAFT',
        createdBy: { id: 'user-1', email: 'test@test.com' },
      });

      await expect(
        transitionContract('1', 'SIGNED' as never, 'APPROVE' as never, 'user-1'),
      ).rejects.toThrow('Không thể chuyển từ DRAFT sang SIGNED');
    });

    it('should throw for non-existent contract', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(
        transitionContract('nonexistent', 'LEGAL_REVIEW' as never, 'SUBMIT' as never, 'user-1'),
      ).rejects.toThrow('Hợp đồng không tồn tại');
    });
  });

  describe('renewContract', () => {
    it('should reject renewal of DRAFT contract', async () => {
      mockFindUnique.mockResolvedValue({ id: '1', status: 'DRAFT' });

      await expect(renewContract('1', 'user-1')).rejects.toThrow(
        'Chỉ có thể gia hạn hợp đồng đã ký hoặc hết hạn',
      );
    });

    it('should throw for non-existent contract', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(renewContract('nonexistent', 'user-1')).rejects.toThrow(
        'Hợp đồng không tồn tại',
      );
    });

    it('should create renewal from SIGNED contract', async () => {
      mockFindUnique.mockResolvedValue({
        id: '1',
        contractNumber: 'HD-2026-0001',
        title: 'Test',
        type: 'SERVICE',
        status: 'SIGNED',
        partnerId: 'partner-1',
        value: 100000,
        description: 'test',
        parentId: null,
      });
      mockAggregate.mockResolvedValue({ _max: { version: 1 } });
      mockFindFirst.mockResolvedValue(null);
      mockCreate.mockResolvedValue({
        id: '2',
        contractNumber: 'HD-2026-0002',
        version: 2,
        parentId: '1',
      });

      const result = await renewContract('1', 'user-1');

      expect(result.version).toBe(2);
      expect(result.parentId).toBe('1');
    });
  });
});
