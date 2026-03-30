import { z } from 'zod';

export const createPartnerSchema = z.object({
  name: z.string().min(1, 'Tên đối tác không được để trống').max(255),
  taxCode: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  contactName: z.string().optional().nullable(),
  contactEmail: z.string().email('Email không hợp lệ').optional().nullable(),
  contactPhone: z.string().optional().nullable(),
});

export const updatePartnerSchema = createPartnerSchema.partial();

export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
