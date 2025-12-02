import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Debugging Aggregation Logic ---');

    // 1. List all stores and their status
    const stores = await prisma.loja.findMany();
    console.log('Stores:', stores.map(s => ({ id: s.id, nome: s.nome, ativo: s.ativo })));

    // 2. Run the query used in dashboardController
    const whereClause = {
        status: 'concluida',
        loja: {
            ativo: true
        }
    };

    console.log('Querying Vendas with where:', JSON.stringify(whereClause, null, 2));

    const vendas = await prisma.venda.findMany({
        where: whereClause,
        include: {
            loja: {
                select: { nome: true, ativo: true }
            }
        }
    });

    console.log(`Found ${vendas.length} sales.`);
    vendas.forEach(v => {
        console.log(`- Venda ${v.id}: Total ${v.total}, Loja: ${v.loja?.nome} (Ativo: ${v.loja?.ativo})`);
    });

    const total = vendas.reduce((sum, v) => sum + parseFloat(v.total), 0);
    console.log('Total Calculated:', total);

    // 3. Check if there are sales for inactive stores specifically
    const inactiveStores = stores.filter(s => !s.ativo).map(s => s.id);
    if (inactiveStores.length > 0) {
        const vendasInactive = await prisma.venda.findMany({
            where: {
                lojaId: { in: inactiveStores }
            }
        });
        console.log(`Sales for inactive stores (${inactiveStores.join(', ')}):`, vendasInactive.length);
    } else {
        console.log('No inactive stores found.');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
