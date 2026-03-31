const mockHash = jest.fn().mockImplementation((pass: string) => Promise.resolve(`hashed_${pass}`));
jest.mock('bcrypt', () => ({
  hash: (...args: unknown[]) => mockHash(...args),
  compare: jest.fn(),
}));

const mockFindMany = jest.fn();
const mockCount = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();

jest.mock('../../index', () => ({
  prisma: {
    user: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      count: (...args: unknown[]) => mockCount(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

import { listUsers, createUser, updateUser } from '../../services/user.service';

describe('UserService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('listUsers', () => {
    it('should list users with pagination', async () => {
      const users = [{ id: '1', email: 'a@b.com', fullName: 'User', role: 'MANAGER' }];
      mockFindMany.mockResolvedValue(users);
      mockCount.mockResolvedValue(1);

      const result = await listUsers({ page: '1', limit: '10' });

      expect(result.data).toEqual(users);
      expect(result.total).toBe(1);
    });
  });

  describe('createUser', () => {
    it('should hash password and create user', async () => {
      const created = { id: '1', email: 'a@b.com', fullName: 'User', role: 'MANAGER', isActive: true };
      mockCreate.mockResolvedValue(created);

      const result = await createUser({ email: 'a@b.com', fullName: 'User', role: 'MANAGER' as const, password: 'pass123' });

      expect(result).toEqual(created);
      expect(mockHash).toHaveBeenCalledWith('pass123', 10);
      const callData = mockCreate.mock.calls[0][0].data;
      expect(callData.email).toBe('a@b.com');
      expect(callData.passwordHash).toBe('hashed_pass123');
    });
  });

  describe('updateUser', () => {
    it('should update user fields', async () => {
      const updated = { id: '1', fullName: 'New Name', role: 'MANAGER', isActive: true };
      mockUpdate.mockResolvedValue(updated);

      const result = await updateUser('1', { fullName: 'New Name', isActive: false });

      expect(result).toEqual(updated);
      const callData = mockUpdate.mock.calls[0][0].data;
      expect(callData.fullName).toBe('New Name');
      expect(callData.isActive).toBe(false);
    });

    it('should hash password when updating password', async () => {
      mockUpdate.mockResolvedValue({ id: '1' });

      await updateUser('1', { password: 'newpass' });

      expect(mockHash).toHaveBeenCalledWith('newpass', 10);
      const callData = mockUpdate.mock.calls[0][0].data;
      expect(callData.passwordHash).toBe('hashed_newpass');
    });

    it('should not include undefined fields', async () => {
      mockUpdate.mockResolvedValue({ id: '1' });

      await updateUser('1', { fullName: 'Only Name' });

      const callData = mockUpdate.mock.calls[0][0].data;
      expect(callData.fullName).toBe('Only Name');
      expect(callData.role).toBeUndefined();
      expect(callData.passwordHash).toBeUndefined();
    });

    it('should update role when provided', async () => {
      mockUpdate.mockResolvedValue({ id: '1' });

      await updateUser('1', { role: 'LEGAL_ADMIN' as const });

      const callData = mockUpdate.mock.calls[0][0].data;
      expect(callData.role).toBe('LEGAL_ADMIN');
    });
  });
});
