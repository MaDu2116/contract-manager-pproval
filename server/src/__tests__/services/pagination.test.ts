import { parsePagination, paginatedResult } from '../../utils/pagination';

describe('Pagination Utils', () => {
  describe('parsePagination', () => {
    it('should parse valid page and limit', () => {
      const result = parsePagination({ page: '2', limit: '10' });
      expect(result).toEqual({ page: 2, limit: 10, skip: 10 });
    });

    it('should use defaults when not provided', () => {
      const result = parsePagination({});
      expect(result).toEqual({ page: 1, limit: 20, skip: 0 });
    });

    it('should enforce minimum page of 1', () => {
      const result = parsePagination({ page: '0' });
      expect(result.page).toBe(1);
    });

    it('should enforce maximum limit of 100', () => {
      const result = parsePagination({ limit: '200' });
      expect(result.limit).toBe(100);
    });

    it('should enforce minimum limit of 1', () => {
      const result = parsePagination({ limit: '0' });
      expect(result.limit).toBe(1);
    });

    it('should calculate correct skip', () => {
      const result = parsePagination({ page: '3', limit: '15' });
      expect(result.skip).toBe(30);
    });
  });

  describe('paginatedResult', () => {
    it('should return correct pagination metadata', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = paginatedResult(data, 50, 1, 20);

      expect(result).toEqual({
        data,
        total: 50,
        page: 1,
        limit: 20,
        totalPages: 3,
      });
    });

    it('should handle empty data', () => {
      const result = paginatedResult([], 0, 1, 20);
      expect(result.totalPages).toBe(0);
      expect(result.data).toEqual([]);
    });

    it('should calculate totalPages correctly', () => {
      const result = paginatedResult([], 21, 1, 10);
      expect(result.totalPages).toBe(3);
    });
  });
});
