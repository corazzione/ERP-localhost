import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Prisma Models:', Object.keys(prisma));
    if (prisma.notification) {
        console.log('✅ prisma.notification exists');
    } else {
        console.error('❌ prisma.notification is UNDEFINED');
    }
    await prisma.$disconnect();
}

main();
