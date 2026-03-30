import ExcelJS from 'exceljs';
import { ContractStatus, ContractType } from '@prisma/client';
import { prisma } from '../index';

const TYPE_LABELS: Record<string, string> = {
  SALES: 'Mua bán',
  SERVICE: 'Dịch vụ',
  LABOR: 'Lao động',
  LEASE: 'Thuê',
  OTHER: 'Khác',
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Nháp',
  LEGAL_REVIEW: 'Review pháp lý',
  MANAGER_APPROVAL: 'Chờ phê duyệt',
  SIGNED: 'Đã ký',
  EXPIRED: 'Hết hạn',
  CANCELLED: 'Đã hủy',
};

interface ExportFilters {
  partner?: string;
  type?: string;
  status?: string;
  from?: string;
  to?: string;
}

export async function exportContractsToExcel(filters: ExportFilters): Promise<Buffer> {
  const where: Record<string, unknown> = {};
  if (filters.partner) where.partnerId = filters.partner;
  if (filters.type) where.type = filters.type as ContractType;
  if (filters.status) where.status = filters.status as ContractStatus;
  if (filters.from || filters.to) {
    where.createdAt = {};
    if (filters.from) (where.createdAt as Record<string, unknown>).gte = new Date(filters.from);
    if (filters.to) (where.createdAt as Record<string, unknown>).lte = new Date(filters.to);
  }

  const contracts = await prisma.contract.findMany({
    where,
    include: {
      partner: { select: { name: true } },
      createdBy: { select: { fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Hợp đồng');

  sheet.columns = [
    { header: 'Số HĐ', key: 'contractNumber', width: 18 },
    { header: 'Tiêu đề', key: 'title', width: 35 },
    { header: 'Loại', key: 'type', width: 15 },
    { header: 'Đối tác', key: 'partner', width: 25 },
    { header: 'Giá trị (VND)', key: 'value', width: 20 },
    { header: 'Trạng thái', key: 'status', width: 18 },
    { header: 'Ngày ký', key: 'signingDate', width: 14 },
    { header: 'Ngày hết hạn', key: 'expiryDate', width: 14 },
    { header: 'Người tạo', key: 'createdBy', width: 20 },
  ];

  // Style header
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

  for (const contract of contracts) {
    sheet.addRow({
      contractNumber: contract.contractNumber,
      title: contract.title,
      type: TYPE_LABELS[contract.type] || contract.type,
      partner: contract.partner.name,
      value: Number(contract.value),
      status: STATUS_LABELS[contract.status] || contract.status,
      signingDate: contract.signingDate ? new Date(contract.signingDate).toLocaleDateString('vi-VN') : '',
      expiryDate: contract.expiryDate ? new Date(contract.expiryDate).toLocaleDateString('vi-VN') : '',
      createdBy: contract.createdBy.fullName,
    });
  }

  // Format value column as number
  sheet.getColumn('value').numFmt = '#,##0';

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
