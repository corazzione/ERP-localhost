import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const vendas = await prisma.venda.findMany({
            orderBy: { dataVenda: 'desc' },
            take: 5
        });

        console.log('Últimas 5 vendas:');
        vendas.forEach(v => {
            console.log(`ID: ${v.id}`);
            console.log(`Número: ${v.numero}`);
            console.log(`Data: ${v.dataVenda} (Tipo: ${typeof v.dataVenda})`);
            console.log(`Status: ${v.status}`);
            console.log(`Total: ${v.total}`);
            console.log('---');
        });

        const hoje = new Date();
        const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

        console.log('Filtro de Data Dashboard:');
        console.log(`Início: ${primeiroDiaMes}`);
        console.log(`Fim: ${ultimoDiaMes}`);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
