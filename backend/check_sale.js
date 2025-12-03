import { prisma } from './src/lib/prisma.js';

async function checkLastSale() {
    try {
        const lastSale = await prisma.venda.findFirst({
            orderBy: { dataVenda: 'desc' },
            include: { loja: true, itens: true }
        });

        console.log('Last Sale:', JSON.stringify(lastSale, null, 2));

        if (lastSale) {
            console.log('Loja ID:', lastSale.lojaId);
            console.log('Loja Active:', lastSale.loja?.ativo);
        }

        const allStores = await prisma.loja.findMany();
        console.log('All Stores:', JSON.stringify(allStores, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkLastSale();
