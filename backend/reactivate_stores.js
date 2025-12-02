import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Reactivating Test Stores ---');

    // Reactivate Loja Teste A (or Loja A Editada)
    await prisma.loja.updateMany({
        where: {
            OR: [
                { codigo: 'loja-teste-a' },
                { nome: 'Loja A Editada' }
            ]
        },
        data: {
            ativo: true,
            nome: 'Loja Teste A' // Reset name
        }
    });

    // Reactivate Loja Teste B
    await prisma.loja.updateMany({
        where: {
            codigo: 'loja-teste-b'
        },
        data: {
            ativo: true,
            nome: 'Loja Teste B'
        }
    });

    console.log('Stores reactivated and names reset.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
