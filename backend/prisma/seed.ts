import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const predefinedCategories = [
    { name: 'Bills' },
    { name: 'Debts' },
    { name: 'Loans' },
    { name: 'Subscriptions' },
    { name: 'Rent' },
    { name: 'Insurance' },
    { name: 'Government' },
    { name: 'Credit Card' },
    { name: 'Utilities' },
    { name: 'Personal' },
  ];

  for (const category of predefinedCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: category.name, userId: null },
    });

    if (!existing) {
      await prisma.category.create({
        data: { name: category.name, userId: null },
      });
    }
  }

  console.log('Predefined categories seeded.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
