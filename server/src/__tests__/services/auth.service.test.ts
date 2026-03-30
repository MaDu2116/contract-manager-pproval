import bcrypt from 'bcrypt';

// Mock prisma
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

  describe('authenticateUser', () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@company.com',
      passwordHash: '',
      fullName: 'Test User',
      role: 'LEGAL_ADMIN',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return user without password on valid credentials', async () => {
      const hash = await bcrypt.hash('password123', 10);
      mockFindUnique.mockResolvedValue({ ...mockUser, passwordHash: hash });

      const result = await authenticateUser('test@company.com', 'password123');

      expect(result).not.toBeNull();
      expect(result!.email).toBe('test@company.com');
      expect(result!.fullName).toBe('Test User');
      expect((result as Record<string, unknown>).passwordHash).toBeUndefined();
    });

    it('should return null for wrong password', async () => {
      const hash = await bcrypt.hash('password123', 10);
      mockFindUnique.mockResolvedValue({ ...mockUser, passwordHash: hash });

      const result = await authenticateUser('test@company.com', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await authenticateUser('notfound@company.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null for inactive user', async () => {
      const hash = await bcrypt.hash('password123', 10);
      mockFindUnique.mockResolvedValue({ ...mockUser, passwordHash: hash, isActive: false });

      const result = await authenticateUser('test@company.com', 'password123');

      expect(result).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should return user without password', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@company.com',
        passwordHash: 'hash',
        fullName: 'Test User',
        role: 'MANAGER',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

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
