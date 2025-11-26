import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const carnes = await prisma.carne.findMany({ include: { parcelas: true } });
    console.log('Carnes in DB:', JSON.stringify(carnes, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
