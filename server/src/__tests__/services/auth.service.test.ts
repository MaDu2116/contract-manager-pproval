const mockCompare = jest.fn();
jest.mock('bcrypt', () => ({
  compare: (...args: unknown[]) => mockCompare(...args),
}));

const mockFindUnique = jest.fn();
jest.mock('../../index', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

import { authenticateUser, getUserById } from '../../services/auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: 'user-1',
    email: 'test@company.com',
    passwordHash: 'hashed_password',
    fullName: 'Test User',
    role: 'LEGAL_ADMIN',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('authenticateUser', () => {
    it('should return user without password on valid credentials', async () => {
      mockFindUnique.mockResolvedValue(mockUser);
      mockCompare.mockResolvedValue(true);

      const result = await authenticateUser('test@company.com', 'password123');

      expect(result).not.toBeNull();
      expect(result!.email).toBe('test@company.com');
      expect(result!.fullName).toBe('Test User');
      expect((result as Record<string, unknown>).passwordHash).toBeUndefined();
    });

    it('should return null for wrong password', async () => {
      mockFindUnique.mockResolvedValue(mockUser);
      mockCompare.mockResolvedValue(false);

      const result = await authenticateUser('test@company.com', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await authenticateUser('notfound@company.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null for inactive user', async () => {
      mockFindUnique.mockResolvedValue({ ...mockUser, isActive: false });

      const result = await authenticateUser('test@company.com', 'password123');

      expect(result).toBeNull();
      expect(mockCompare).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return user without password', async () => {
      mockFindUnique.mockResolvedValue(mockUser);

      const result = await getUserById('user-1');

      expect(result).not.toBeNull();
      expect(result!.email).toBe('test@company.com');
      expect((result as Record<string, unknown>).passwordHash).toBeUndefined();
    });

    it('should return null for non-existent id', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await getUserById('nonexistent');

      expect(result).toBeNull();
    });
  });
});
