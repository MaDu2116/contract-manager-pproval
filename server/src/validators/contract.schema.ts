import { z } from 'zod';
import { ContractType } from '@prisma/client';

export const createContractSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống').max(255),
  type: z.nativeEnum(ContractType, { errorMap: () => ({ message: 'Loại hợp đồng không hợp lệ' }) }),
  partnerId: z.string().uuid('ID đối tác không hợp lệ'),
  value: z.number().positive('Giá trị phải lớn hơn 0'),
  signingDate: z.string().datetime().optional().nullable(),
  effectiveDate: z.string().datetime().optional().nullable(),
  expiryDate: z.string().datetime().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const updateContractSchema = createContractSchema.partial();

export const approvalCommentSchema = z.object({
  comment: z.string().optional(),
});

export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractInput = z.infer<typeof updateContractSchema>;
