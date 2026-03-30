import { PrismaClient, Role, ContractType, ContractStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create default users
  const passwordHash = await bcrypt.hash('admin123', 10);
  const legalHash = await bcrypt.hash('legal123', 10);
  const viewerHash = await bcrypt.hash('viewer123', 10);

  const manager = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      email: 'admin@company.com',
      passwordHash,
      fullName: 'Nguyễn Văn Admin',
      role: Role.MANAGER,
    },
  });

  const legalAdmin = await prisma.user.upsert({
    where: { email: 'legal@company.com' },
    update: {},
    create: {
      email: 'legal@company.com',
      passwordHash: legalHash,
      fullName: 'Trần Thị Legal',
      role: Role.LEGAL_ADMIN,
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@company.com' },
    update: {},
    create: {
      email: 'viewer@company.com',
      passwordHash: viewerHash,
      fullName: 'Lê Văn Viewer',
      role: Role.VIEWER,
    },
  });

  // Create sample partners
  const partner1 = await prisma.partner.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Công ty TNHH ABC',
      taxCode: '0123456789',
      address: '123 Nguyễn Huệ, Q.1, TP.HCM',
      contactName: 'Phạm Văn A',
      contactEmail: 'contact@abc.com.vn',
      contactPhone: '028-1234-5678',
    },
  });

  const partner2 = await prisma.partner.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Công ty CP XYZ',
      taxCode: '9876543210',
      address: '456 Lê Lợi, Q.3, TP.HCM',
      contactName: 'Nguyễn Thị B',
      contactEmail: 'contact@xyz.com.vn',
      contactPhone: '028-8765-4321',
    },
  });

  // Create sample contracts
  await prisma.contract.upsert({
    where: { contractNumber: 'HD-2026-0001' },
    update: {},
    create: {
      contractNumber: 'HD-2026-0001',
      title: 'Hợp đồng cung cấp dịch vụ CNTT',
      type: ContractType.SERVICE,
      status: ContractStatus.SIGNED,
      partnerId: partner1.id,
      value: 500000000,
      signingDate: new Date('2026-01-15'),
      effectiveDate: new Date('2026-02-01'),
      expiryDate: new Date('2026-04-30'),
      description: 'Hợp đồng cung cấp dịch vụ quản trị hệ thống CNTT năm 2026',
      createdById: legalAdmin.id,
      updatedById: legalAdmin.id,
    },
  });

  await prisma.contract.upsert({
    where: { contractNumber: 'HD-2026-0002' },
    update: {},
    create: {
      contractNumber: 'HD-2026-0002',
      title: 'Hợp đồng mua bán thiết bị văn phòng',
      type: ContractType.SALES,
      status: ContractStatus.DRAFT,
      partnerId: partner2.id,
      value: 150000000,
      description: 'Mua bán bàn ghế, máy tính cho văn phòng mới',
      createdById: legalAdmin.id,
      updatedById: legalAdmin.id,
    },
  });

  console.log('Seed completed successfully');
  console.log('Users:', { manager: manager.email, legalAdmin: legalAdmin.email, viewer: viewer.email });
  console.log('Partners:', { partner1: partner1.name, partner2: partner2.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
