import cron from 'node-cron';
import { ContractStatus, Role } from '@prisma/client';
import { prisma } from '../index';
import { createNotification } from '../services/notification.service';
import { sendEmail, expiryAlertEmail } from '../services/email.service';

export function startExpiryCheckJob() {
  // Run daily at 8:00 AM Vietnam time (UTC+7 = 1:00 AM UTC)
  cron.schedule('0 1 * * *', async () => {
    console.log('[ExpiryCheck] Running daily expiry check...');
    try {
      await checkExpiringContracts();
      await markExpiredContracts();
    } catch (error) {
      console.error('[ExpiryCheck] Error:', error);
    }
  });

  console.log('[ExpiryCheck] Job scheduled: daily at 8:00 AM (UTC+7)');
}

async function checkExpiringContracts() {
  const now = new Date();
  const thresholds = [30, 60, 90];

  for (const days of thresholds) {
    const targetDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const contracts = await prisma.contract.findMany({
      where: {
        status: ContractStatus.SIGNED,
        expiryDate: { gte: dayStart, lt: dayEnd },
      },
    });

    if (contracts.length === 0) continue;

    const notifyUsers = await prisma.user.findMany({
      where: { role: { in: [Role.LEGAL_ADMIN, Role.MANAGER] }, isActive: true },
    });

    for (const contract of contracts) {
      for (const user of notifyUsers) {
        // Check for duplicate notifications
        const existing = await prisma.notification.findFirst({
          where: {
            userId: user.id,
            contractId: contract.id,
            type: `EXPIRY_${days}`,
          },
        });
        if (existing) continue;

        await createNotification({
          userId: user.id,
          contractId: contract.id,
          type: `EXPIRY_${days}`,
          title: `Hợp đồng sắp hết hạn trong ${days} ngày`,
          message: `Hợp đồng ${contract.contractNumber} sẽ hết hạn vào ${(contract.expiryDate as Date).toLocaleDateString('vi-VN')}.`,
        });

        const emailContent = expiryAlertEmail(
          contract.contractNumber,
          contract.title,
          days,
          (contract.expiryDate as Date).toLocaleDateString('vi-VN'),
        );
        await sendEmail({ to: user.email, ...emailContent });
      }
    }

    if (contracts.length > 0) {
      console.log(`[ExpiryCheck] Found ${contracts.length} contracts expiring in ${days} days`);
    }
  }
}

async function markExpiredContracts() {
  const now = new Date();
  const result = await prisma.contract.updateMany({
    where: {
      status: ContractStatus.SIGNED,
      expiryDate: { lt: now },
    },
    data: { status: ContractStatus.EXPIRED },
  });

  if (result.count > 0) {
    console.log(`[ExpiryCheck] Marked ${result.count} contracts as EXPIRED`);
  }
}
