import fs from 'fs';
import path from 'path';

const mockCreate = jest.fn();
const mockFindUnique = jest.fn();
const mockDelete = jest.fn();
const mockFindMany = jest.fn();

jest.mock('../../index', () => ({
  prisma: {
    contractAttachment: {
      create: (...args: unknown[]) => mockCreate(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      delete: (...args: unknown[]) => mockDelete(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}));

jest.mock('fs');

import { addAttachment, getAttachmentById, deleteAttachment, getAttachments } from '../../services/attachment.service';

describe('AttachmentService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('addAttachment', () => {
    it('should create directory and move file', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
      (fs.renameSync as jest.Mock).mockReturnValue(undefined);
      mockCreate.mockResolvedValue({ id: 'att-1', contractId: 'c-1' });

      const file = {
        originalname: 'doc.pdf',
        filename: 'abc-doc.pdf',
        path: '/tmp/abc-doc.pdf',
        size: 1024,
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      const result = await addAttachment('c-1', file, 'user-1');

      expect(fs.mkdirSync).toHaveBeenCalled();
      expect(fs.renameSync).toHaveBeenCalled();
      expect(mockCreate).toHaveBeenCalled();
      expect(result.id).toBe('att-1');
    });

    it('should skip mkdir if directory exists', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.renameSync as jest.Mock).mockReturnValue(undefined);
      mockCreate.mockResolvedValue({ id: 'att-1' });

      const file = {
        originalname: 'doc.pdf',
        filename: 'abc-doc.pdf',
        path: '/tmp/abc-doc.pdf',
        size: 1024,
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      await addAttachment('c-1', file, 'user-1');

      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('getAttachmentById', () => {
    it('should return attachment', async () => {
      mockFindUnique.mockResolvedValue({ id: 'att-1' });

      const result = await getAttachmentById('att-1');

      expect(result).toEqual({ id: 'att-1' });
    });
  });

  describe('deleteAttachment', () => {
    it('should delete file and db record', async () => {
      mockFindUnique.mockResolvedValue({ id: 'att-1', filePath: 'contracts/c-1/doc.pdf' });
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);
      mockDelete.mockResolvedValue({ id: 'att-1' });

      const result = await deleteAttachment('att-1');

      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'att-1' } });
      expect(result.id).toBe('att-1');
    });

    it('should throw if attachment not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(deleteAttachment('nonexistent')).rejects.toThrow('File không tồn tại');
    });

    it('should skip unlink if file does not exist on disk', async () => {
      mockFindUnique.mockResolvedValue({ id: 'att-1', filePath: 'contracts/c-1/doc.pdf' });
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      mockDelete.mockResolvedValue({ id: 'att-1' });

      await deleteAttachment('att-1');

      expect(fs.unlinkSync).not.toHaveBeenCalled();
      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe('getAttachments', () => {
    it('should list attachments for contract', async () => {
      const attachments = [{ id: 'att-1' }, { id: 'att-2' }];
      mockFindMany.mockResolvedValue(attachments);

      const result = await getAttachments('c-1');

      expect(result).toEqual(attachments);
      expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { contractId: 'c-1' },
      }));
    });
  });
});
