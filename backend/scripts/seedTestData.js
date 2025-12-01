import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Criando dados de teste...');

    // Buscar primeiro usuário
    const usuario = await prisma.usuario.findFirst();
    if (!usuario) {
        console.log('❌ Nenhum usuário encontrado. Por favor, faça login primeiro.');
        return;
    }
    console.log(`✅ Usuário encontrado: ${usuario.nome}`);

    // Buscar ou criar cliente
    let cliente = await prisma.cliente.findFirst();
    if (!cliente) {
        cliente = await prisma.cliente.create({
            data: {
                nome: 'Cliente Teste',
                cpfCnpj: '12345678900',
                telefone: '(11) 98888-8888',
                email: 'cliente@teste.com',
                limiteCredito: '5000.00',
                saldoCredito: '0.00',
                saldoDevedor: '0.00'
            }
        });
        console.log('✅ Cliente criado');
    } else {
        console.log(`✅ Cliente encontrado: ${cliente.nome}`);
    }

    // Buscar ou criar produto
    let produto = await prisma.produto.findFirst();
    if (!produto) {
        produto = await prisma.produto.create({
            data: {
                codigo: 'PROD001',
                nome: 'Produto Teste',
                precoVenda: '150.00',
                precoCusto: '100.00',
                estoqueAtual: 1000,
                estoqueMinimo: 10
            }
        });
        console.log('✅ Produto criado');
    } else {
        console.log(`✅ Produto encontrado: ${produto.nome}`);
    }

    // Criar vendas de teste dos últimos 7 dias
    const hoje = new Date();
    const vendas = [];
    let vendaNumero = Date.now();

    for (let i = 0; i < 5; i++) {
        const dataVenda = new Date(hoje);
        dataVenda.setDate(hoje.getDate() - i);

        const quantidade = 1 + i;
        const precoUnit = parseFloat(produto.precoVenda);
        const subtotal = quantidade * precoUnit;
        const total = subtotal.toFixed(2);

        const venda = await prisma.venda.create({
            data: {
                numero: `VND${vendaNumero++}`,
                dataVenda,
                total,
                subtotal: total,
                desconto: '0.00',
                formaPagamento: i % 3 === 0 ? 'crediario' : i % 2 === 0 ? 'dinheiro' : 'pix',
                statusPagamento: 'pago',
                status: 'concluida',
                clienteId: cliente.id,
                usuarioId: usuario.id,
                itens: {
                    create: [{
                        produtoId: produto.id,
                        quantidade,
                        precoUnit: precoUnit.toFixed(2),
                        subtotal: total
                    }]
                }
            },
            include: {
                itens: true
            }
        });

        vendas.push(venda);
        console.log(`✅ Venda ${i + 1} criada - ${venda.formaPagamento} - R$ ${venda.total}`);
    }

    // Criar carnê e parcelas para vendas a crediário
    const vendasCrediario = vendas.filter(v => v.formaPagamento === 'crediario');

    for (const venda of vendasCrediario) {
        const valorParcela = (parseFloat(venda.total) / 3).toFixed(2);

        const carne = await prisma.carne.create({
            data: {
                numeroCarne: `CARNE${Date.now()}${vendas.indexOf(venda)}`,
                clienteId: cliente.id,
                vendaId: venda.id,
                valorTotal: venda.total,
                numeroParcelas: 3,
                dataEmissao: venda.dataVenda,
                status: 'ativo',
                parcelas: {
                    create: [
                        {
                            numeroParcela: 1,
                            valorParcela,
                            dataVencimento: new Date(venda.dataVenda.getTime() + 30 * 24 * 60 * 60 * 1000),
                            status: 'pendente'
                        },
                        {
                            numeroParcela: 2,
                            valorParcela,
                            dataVencimento: new Date(venda.dataVenda.getTime() + 60 * 24 * 60 * 60 * 1000),
                            status: 'pendente'
                        },
                        {
                            numeroParcela: 3,
                            valorParcela,
                            dataVencimento: new Date(venda.dataVenda.getTime() + 90 * 24 * 60 * 60 * 1000),
                            status: 'pendente'
                        }
                    ]
                }
            }
        });
        console.log(`✅ Carnê criado para venda a crediário - 3 parcelas de R$ ${valorParcela}`);
    }

    console.log('\n🎉 Dados de teste criados com sucesso!');
    console.log(`📊 Total de vendas: ${vendas.length}`);
    console.log(`💳 Vendas a crediário: ${vendasCrediario.length}`);
}

main()
    .catch((e) => {
        console.error('❌ Erro:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
