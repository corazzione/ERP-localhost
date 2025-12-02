import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed de teste...');

    // 1. Criar Lojas (Upsert para evitar erro de duplicidade)
    const lojaA = await prisma.loja.upsert({
        where: { codigo: 'loja-teste-a' },
        update: {},
        create: {
            nome: 'Loja Teste A',
            codigo: 'loja-teste-a',
            endereco: 'Rua A, 123',
            telefone: '11999999999'
        }
    });
    console.log(`✅ Loja garantida: ${lojaA.nome}`);

    const lojaB = await prisma.loja.upsert({
        where: { codigo: 'loja-teste-b' },
        update: {},
        create: {
            nome: 'Loja Teste B',
            codigo: 'loja-teste-b',
            endereco: 'Rua B, 456',
            telefone: '11888888888'
        }
    });
    console.log(`✅ Loja garantida: ${lojaB.nome}`);

    // 2. Criar Usuário e Produto (se não existirem)
    let usuario = await prisma.usuario.findFirst();
    if (!usuario) {
        usuario = await prisma.usuario.create({
            data: {
                nome: 'Admin Teste',
                email: 'admin@teste.com',
                senha: '123',
                cargo: 'admin'
            }
        });
    }

    let produto = await prisma.produto.findFirst();
    if (!produto) {
        produto = await prisma.produto.create({
            data: {
                nome: 'Produto Teste',
                descricao: 'Produto para testes',
                precoCusto: 50,
                precoVenda: 100,
                estoque: 100,
                categoria: 'Geral'
            }
        });
    }

    // 3. Criar Vendas para Loja A
    for (let i = 0; i < 5; i++) {
        await prisma.venda.create({
            data: {
                numero: `VENDA-A-${Date.now()}-${i}`,
                usuarioId: usuario.id,
                lojaId: lojaA.id,
                subtotal: 100,
                total: 100,
                formaPagamento: 'dinheiro',
                status: 'concluida',
                itens: {
                    create: {
                        produtoId: produto.id,
                        quantidade: 1,
                        precoUnit: 100,
                        subtotal: 100
                    }
                }
            }
        });
    }
    console.log('✅ 5 Vendas criadas para Loja A (Total: R$ 500)');

    // 4. Criar Vendas para Loja B
    for (let i = 0; i < 3; i++) {
        await prisma.venda.create({
            data: {
                numero: `VENDA-B-${Date.now()}-${i}`,
                usuarioId: usuario.id,
                lojaId: lojaB.id,
                subtotal: 200,
                total: 200,
                formaPagamento: 'pix',
                status: 'concluida',
                itens: {
                    create: {
                        produtoId: produto.id,
                        quantidade: 1,
                        precoUnit: 200,
                        subtotal: 200
                    }
                }
            }
        });
    }
    console.log('✅ 3 Vendas criadas para Loja B (Total: R$ 600)');

    console.log('🏁 Seed concluído! Agora teste os filtros no dashboard.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
