import path from 'path';
import fs from 'fs';
import { prisma } from '../index';

export async function addAttachment(
  contractId: string,
  file: Express.Multer.File,
  userId: string,
) {
  // Move file to contract-specific directory
  const contractDir = path.join(__dirname, '../../../uploads/contracts', contractId);
  if (!fs.existsSync(contractDir)) {
    fs.mkdirSync(contractDir, { recursive: true });
  }

  const newPath = path.join(contractDir, file.filename);
  fs.renameSync(file.path, newPath);

  return prisma.contractAttachment.create({
    data: {
      contractId,
      fileName: file.originalname,
      filePath: `contracts/${contractId}/${file.filename}`,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedById: userId,
    },
  });
}

export async function getAttachmentById(id: string) {
  return prisma.contractAttachment.findUnique({ where: { id } });
}

export async function deleteAttachment(id: string) {
  const attachment = await prisma.contractAttachment.findUnique({ where: { id } });
  if (!attachment) throw new Error('File không tồn tại');

  const filePath = path.join(__dirname, '../../../uploads', attachment.filePath);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return prisma.contractAttachment.delete({ where: { id } });
}

export async function getAttachments(contractId: string) {
  return prisma.contractAttachment.findMany({
    where: { contractId },
    include: { uploadedBy: { select: { fullName: true } } },
    orderBy: { createdAt: 'desc' },
  });
}
