import { prisma } from '../index';

export async function generateContractNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `HD-${year}-`;

  const lastContract = await prisma.contract.findFirst({
    where: { contractNumber: { startsWith: prefix } },
    orderBy: { contractNumber: 'desc' },
  });

  let nextNumber = 1;
  if (lastContract) {
    const lastNumber = parseInt(lastContract.contractNumber.replace(prefix, ''), 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}
