import { loginSchema } from '../../validators/auth.schema';
import { createContractSchema, updateContractSchema, approvalCommentSchema } from '../../validators/contract.schema';
import { createPartnerSchema, updatePartnerSchema } from '../../validators/partner.schema';

describe('Validators', () => {
  describe('loginSchema', () => {
    it('should accept valid login', () => {
      const result = loginSchema.safeParse({ email: 'a@b.com', password: '123' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = loginSchema.safeParse({ email: 'not-email', password: '123' });
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({ email: 'a@b.com', password: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('createContractSchema', () => {
    const validContract = {
      title: 'Test Contract',
      type: 'SALES',
      partnerId: '550e8400-e29b-41d4-a716-446655440000',
      value: 1000000,
    };

    it('should accept valid contract', () => {
      const result = createContractSchema.safeParse(validContract);
      expect(result.success).toBe(true);
    });

    it('should reject missing title', () => {
      const result = createContractSchema.safeParse({ ...validContract, title: '' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid type', () => {
      const result = createContractSchema.safeParse({ ...validContract, type: 'INVALID' });
      expect(result.success).toBe(false);
    });

    it('should reject negative value', () => {
      const result = createContractSchema.safeParse({ ...validContract, value: -100 });
      expect(result.success).toBe(false);
    });

    it('should reject invalid partnerId', () => {
      const result = createContractSchema.safeParse({ ...validContract, partnerId: 'not-uuid' });
      expect(result.success).toBe(false);
    });

    it('should accept optional dates', () => {
      const result = createContractSchema.safeParse({
        ...validContract,
        signingDate: '2024-01-01T00:00:00.000Z',
        effectiveDate: null,
        description: 'some desc',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('updateContractSchema', () => {
    it('should accept partial data', () => {
      const result = updateContractSchema.safeParse({ title: 'Updated' });
      expect(result.success).toBe(true);
    });

    it('should accept empty object', () => {
      const result = updateContractSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('approvalCommentSchema', () => {
    it('should accept with comment', () => {
      const result = approvalCommentSchema.safeParse({ comment: 'looks good' });
      expect(result.success).toBe(true);
    });

    it('should accept without comment', () => {
      const result = approvalCommentSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('createPartnerSchema', () => {
    it('should accept valid partner', () => {
      const result = createPartnerSchema.safeParse({ name: 'Partner A' });
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const result = createPartnerSchema.safeParse({ name: '' });
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const result = createPartnerSchema.safeParse({
        name: 'Partner A',
        taxCode: '123456',
        contactEmail: 'a@b.com',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = createPartnerSchema.safeParse({ name: 'A', contactEmail: 'bad' });
      expect(result.success).toBe(false);
    });
  });

  describe('updatePartnerSchema', () => {
    it('should accept partial data', () => {
      const result = updatePartnerSchema.safeParse({ name: 'Updated' });
      expect(result.success).toBe(true);
    });
  });
});
