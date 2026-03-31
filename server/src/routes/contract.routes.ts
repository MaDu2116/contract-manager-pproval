import { Router, Request, Response } from 'express';
import { ContractStatus, ApprovalActionType } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { upload } from '../middleware/upload';
import { createContractSchema, updateContractSchema, approvalCommentSchema } from '../validators/contract.schema';
import * as contractService from '../services/contract.service';
import * as attachmentService from '../services/attachment.service';

export const contractRoutes = Router();

// List contracts with filters
contractRoutes.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await contractService.listContracts(req.query as Record<string, string>);
    res.json(result);
  } catch (_error) {
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

// Get contract detail
contractRoutes.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const contract = await contractService.getContractById(req.params.id);
    if (!contract) return res.status(404).json({ error: 'Hợp đồng không tồn tại' });
    res.json(contract);
  } catch (_error) {
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

// Create contract
contractRoutes.post('/', requireAuth, requireRole('LEGAL_ADMIN'), validate(createContractSchema), async (req: Request, res: Response) => {
  try {
    const contract = await contractService.createContract(req.body, req.session.userId!);
    res.status(201).json(contract);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Update contract
contractRoutes.put('/:id', requireAuth, requireRole('LEGAL_ADMIN'), validate(updateContractSchema), async (req: Request, res: Response) => {
  try {
    const contract = await contractService.updateContract(req.params.id, req.body, req.session.userId!);
    res.json(contract);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Workflow transitions
contractRoutes.post('/:id/submit', requireAuth, requireRole('LEGAL_ADMIN'), validate(approvalCommentSchema), async (req: Request, res: Response) => {
  try {
    const contract = await contractService.transitionContract(
      req.params.id, ContractStatus.LEGAL_REVIEW, ApprovalActionType.SUBMIT, req.session.userId!, req.body.comment,
    );
    res.json(contract);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

contractRoutes.post('/:id/legal-approve', requireAuth, requireRole('LEGAL_ADMIN'), validate(approvalCommentSchema), async (req: Request, res: Response) => {
  try {
    const contract = await contractService.transitionContract(
      req.params.id, ContractStatus.MANAGER_APPROVAL, ApprovalActionType.APPROVE, req.session.userId!, req.body.comment,
    );
    res.json(contract);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

contractRoutes.post('/:id/legal-reject', requireAuth, requireRole('LEGAL_ADMIN'), validate(approvalCommentSchema), async (req: Request, res: Response) => {
  try {
    const contract = await contractService.transitionContract(
      req.params.id, ContractStatus.DRAFT, ApprovalActionType.REJECT, req.session.userId!, req.body.comment,
    );
    res.json(contract);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

contractRoutes.post('/:id/manager-approve', requireAuth, requireRole('MANAGER'), validate(approvalCommentSchema), async (req: Request, res: Response) => {
  try {
    const contract = await contractService.transitionContract(
      req.params.id, ContractStatus.SIGNED, ApprovalActionType.APPROVE, req.session.userId!, req.body.comment,
    );
    res.json(contract);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

contractRoutes.post('/:id/manager-reject', requireAuth, requireRole('MANAGER'), validate(approvalCommentSchema), async (req: Request, res: Response) => {
  try {
    const contract = await contractService.transitionContract(
      req.params.id, ContractStatus.DRAFT, ApprovalActionType.REJECT, req.session.userId!, req.body.comment,
    );
    res.json(contract);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Upload attachment
contractRoutes.post('/:id/attachments', requireAuth, requireRole('LEGAL_ADMIN'), upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Vui lòng chọn file' });
    const attachment = await attachmentService.addAttachment(req.params.id, req.file, req.session.userId!);
    res.status(201).json(attachment);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Get attachments
contractRoutes.get('/:id/attachments', requireAuth, async (req: Request, res: Response) => {
  try {
    const attachments = await attachmentService.getAttachments(req.params.id);
    res.json(attachments);
  } catch (_error) {
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

// Renew contract
contractRoutes.post('/:id/renew', requireAuth, requireRole('LEGAL_ADMIN'), async (req: Request, res: Response) => {
  try {
    const contract = await contractService.renewContract(req.params.id, req.session.userId!);
    res.status(201).json(contract);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Get version chain
contractRoutes.get('/:id/versions', requireAuth, async (req: Request, res: Response) => {
  try {
    const versions = await contractService.getContractVersions(req.params.id);
    res.json(versions);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Get approval history
contractRoutes.get('/:id/history', requireAuth, async (req: Request, res: Response) => {
  try {
    const history = await contractService.getContractHistory(req.params.id);
    res.json(history);
  } catch (_error) {
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});
