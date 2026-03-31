const mockFindFirst = jest.fn();

jest.mock('../../index', () => ({
  prisma: {
    contract: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
    },
  },
}));

import { generateContractNumber } from '../../utils/contract-number';

describe('generateContractNumber', () => {
  beforeEach(() => jest.clearAllMocks());

  const year = new Date().getFullYear();

  it('should generate first contract number', async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await generateContractNumber();

    expect(result).toBe(`HD-${year}-0001`);
  });

  it('should increment from last contract', async () => {
    mockFindFirst.mockResolvedValue({ contractNumber: `HD-${year}-0042` });

    const result = await generateContractNumber();

    expect(result).toBe(`HD-${year}-0043`);
  });

  it('should pad number to 4 digits', async () => {
    mockFindFirst.mockResolvedValue({ contractNumber: `HD-${year}-0005` });

    const result = await generateContractNumber();

    expect(result).toBe(`HD-${year}-0006`);
  });
});
