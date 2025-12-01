import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🧪 Criando venda a crediário com pagamentos simulados...\n');

    // 1. Buscar usuário
    const usuario = await prisma.usuario.findFirst();
    if (!usuario) {
        console.log('❌ Nenhum usuário encontrado');
        return;
    }
    console.log(`✅ Usuário: ${usuario.nome}`);

    // 2. Buscar ou criar cliente
    let cliente = await prisma.cliente.findFirst({
        where: { cpfCnpj: '11111111111' }
    });

    if (!cliente) {
        cliente = await prisma.cliente.create({
            data: {
                nome: 'Cliente Crediário Teste',
                cpfCnpj: '11111111111',
                telefone: '(11) 99999-9999',
                limiteCredito: '10000.00',
                saldoCredito: '0.00',
                saldoDevedor: '0.00'
            }
        });
        console.log(`✅ Cliente criado: ${cliente.nome}`);
    } else {
        console.log(`✅ Cliente encontrado: ${cliente.nome}`);
    }

    // 3. Buscar produto
    const produto = await prisma.produto.findFirst();
    if (!produto) {
        console.log('❌ Nenhum produto encontrado');
        return;
    }
    console.log(`✅ Produto: ${produto.nome}`);

    // 4. Criar venda
    const valorProduto = 1000.00; // R$ 1.000
    const numParcelas = 3;
    const taxaJuros = 9.0; // 9% a.m.

    // Calcular juros compostos (Price)
    const i = taxaJuros / 100;
    const fator = Math.pow(1 + i, numParcelas);
    const valorParcela = (valorProduto * fator * i) / (fator - 1);
    const valorTotal = valorParcela * numParcelas;
    const valorJurosTotal = valorTotal - valorProduto;

    console.log(`\n📊 Cálculos:`);
    console.log(`   Valor original: R$ ${valorProduto.toFixed(2)}`);
    console.log(`   Taxa: ${taxaJuros}% a.m. (compostos)`);
    console.log(`   Parcelas: ${numParcelas}x de R$ ${valorParcela.toFixed(2)}`);
    console.log(`   Valor total: R$ ${valorTotal.toFixed(2)}`);
    console.log(`   Juros total: R$ ${valorJurosTotal.toFixed(2)}\n`);

    // Gerar número da venda único
    const timestamp = Date.now();
    const numeroVenda = String(timestamp).slice(-8);

    // 5. Criar venda com carnê e parcelas
    const venda = await prisma.$transaction(async (tx) => {
        const novaVenda = await tx.venda.create({
            data: {
                numero: numeroVenda,
                clienteId: cliente.id,
                usuarioId: usuario.id,
                subtotal: valorProduto.toFixed(2),
                desconto: '0.00',
                total: valorProduto.toFixed(2),
                formaPagamento: 'crediario',
                statusPagamento: 'pendente',
                status: 'concluida',
                modoCrediario: 'PERSONALIZADO',
                usaTaxaPadrao: false,
                taxaPersonalizadaMensal: taxaJuros.toFixed(2),
                tipoJurosPersonalizado: 'COMPOSTO',
                itens: {
                    create: [{
                        produtoId: produto.id,
                        quantidade: 1,
                        precoUnit: valorProduto.toFixed(2),
                        subtotal: valorProduto.toFixed(2)
                    }]
                }
            }
        });

        // Criar carnê
        const ultimoCarne = await tx.carne.findFirst({
            orderBy: { numeroCarne: 'desc' }
        });
        const numeroCarne = ultimoCarne
            ? String(parseInt(ultimoCarne.numeroCarne) + 1).padStart(8, '0')
            : '00000001';

        const carne = await tx.carne.create({
            data: {
                vendaId: novaVenda.id,
                clienteId: cliente.id,
                numeroCarne,
                valorTotal: valorTotal.toFixed(2),
                valorOriginal: valorProduto.toFixed(2),
                numParcelas,
                taxaJuros: taxaJuros.toFixed(2),
                valorJuros: valorJurosTotal.toFixed(2),
                status: 'ativo'
            }
        });

        console.log(`✅ Venda criada: #${numeroVenda}`);
        console.log(`✅ Carnê criado: #${numeroCarne}\n`);

        // Criar parcelas
        const valorPrincipalPorParcela = valorProduto / numParcelas;
        const valorJurosPorParcela = valorJurosTotal / numParcelas;
        const hoje = new Date();

        for (let i = 0; i < numParcelas; i++) {
            const dataVencimento = new Date(hoje);
            dataVencimento.setMonth(hoje.getMonth() + i + 1);

            await tx.parcela.create({
                data: {
                    carneId: carne.id,
                    numeroParcela: i + 1,
                    dataVencimento,
                    valorParcela: valorParcela.toFixed(2),
                    valorPrincipal: valorPrincipalPorParcela.toFixed(2),
                    valorJurosPrevisto: valorJurosPorParcela.toFixed(2),
                    valorTotalPrevisto: valorParcela.toFixed(2),
                    status: 'pendente'
                }
            });
            console.log(`✅ Parcela ${i + 1}/${numParcelas} criada - Venc: ${dataVencimento.toLocaleDateString('pt-BR')}`);
        }

        return { venda: novaVenda, carne };
    });

    // 6. Simular 3 cenários de pagamento
    console.log(`\n💳 Simulando pagamentos...\n`);

    const parcelas = await prisma.parcela.findMany({
        where: { carneId: venda.carne.id },
        orderBy: { numeroParcela: 'asc' }
    });

    if (parcelas.length >= 3) {
        // Parcela 1: Paga ANTECIPADA (15 dias antes)
        const parcela1 = parcelas[0];
        const pagamentoAntecipado = new Date(parcela1.dataVencimento);
        pagamentoAntecipado.setDate(pagamentoAntecipado.getDate() - 15);

        const diasAntecipados = 15;
        const jurosDiarios = parseFloat(parcela1.valorJurosPrevisto) / 30;
        const descontoAntecipacao = jurosDiarios * diasAntecipados;
        const valorPagoAntecipado = parseFloat(parcela1.valorParcela) - descontoAntecipacao;

        await prisma.parcela.update({
            where: { id: parcela1.id },
            data: {
                status: 'pago',
                dataPagamento: pagamentoAntecipado,
                valorPago: valorPagoAntecipado.toFixed(2),
                valorDescontoAntecipacao: descontoAntecipacao.toFixed(2)
            }
        });

        console.log(`✅ Parcela 1: PAGA ANTECIPADA`);
        console.log(`   Vencimento: ${parcela1.dataVencimento.toLocaleDateString('pt-BR')}`);
        console.log(`   Pagamento: ${pagamentoAntecipado.toLocaleDateString('pt-BR')} (15 dias antes)`);
        console.log(`   Valor previsto: R$ ${parcela1.valorParcela}`);
        console.log(`   Desconto: R$ ${descontoAntecipacao.toFixed(2)}`);
        console.log(`   Valor pago: R$ ${valorPagoAntecipado.toFixed(2)}\n`);

        // Parcela 2: Paga NO PRAZO
        const parcela2 = parcelas[1];
        await prisma.parcela.update({
            where: { id: parcela2.id },
            data: {
                status: 'pago',
                dataPagamento: parcela2.dataVencimento,
                valorPago: parcela2.valorParcela,
                diasAtraso: 0,
                jurosMora: '0.00',
                multaAtraso: '0.00'
            }
        });

        console.log(`✅ Parcela 2: PAGA NO PRAZO`);
        console.log(`   Vencimento: ${parcela2.dataVencimento.toLocaleDateString('pt-BR')}`);
        console.log(`   Valor pago: R$ ${parcela2.valorParcela}\n`);

        // Parcela 3: Paga ATRASADA (10 dias)
        const parcela3 = parcelas[2];
        const pagamentoAtrasado = new Date(parcela3.dataVencimento);
        pagamentoAtrasado.setDate(pagamentoAtrasado.getDate() + 10);

        const diasAtraso = 10;
        const multaAtraso = parseFloat(parcela3.valorParcela) * 0.02; // 2%
        const jurosMora = parseFloat(parcela3.valorParcela) * 0.00033 * diasAtraso; // 0.033% ao dia
        const valorPagoAtrasado = parseFloat(parcela3.valorParcela) + multaAtraso + jurosMora;

        await prisma.parcela.update({
            where: { id: parcela3.id },
            data: {
                status: 'pago',
                dataPagamento: pagamentoAtrasado,
                valorPago: valorPagoAtrasado.toFixed(2),
                diasAtraso,
                jurosMora: jurosMora.toFixed(2),
                multaAtraso: multaAtraso.toFixed(2)
            }
        });

        console.log(`✅ Parcela 3: PAGA ATRASADA`);
        console.log(`   Vencimento: ${parcela3.dataVencimento.toLocaleDateString('pt-BR')}`);
        console.log(`   Pagamento: ${pagamentoAtrasado.toLocaleDateString('pt-BR')} (10 dias depois)`);
        console.log(`   Valor previsto: R$ ${parcela3.valorParcela}`);
        console.log(`   Multa (2%): R$ ${multaAtraso.toFixed(2)}`);
        console.log(`   Juros mora: R$ ${jurosMora.toFixed(2)}`);
        console.log(`   Valor pago: R$ ${valorPagoAtrasado.toFixed(2)}\n`);
    }

    // 7. Calcular juros reais recebidos
    const todasParcelas = await prisma.parcela.findMany({
        where: { carneId: venda.carne.id, status: 'pago' }
    });

    let jurosReaisTotal = 0;
    todasParcelas.forEach(p => {
        const juros = parseFloat(p.valorPago) - parseFloat(p.valorPrincipal);
        jurosReaisTotal += juros;
    });

    console.log(`📊 RESULTADO FINAL:`);
    console.log(`   Juros previstos: R$ ${valorJurosTotal.toFixed(2)}`);
    console.log(`   Juros reais recebidos: R$ ${jurosReaisTotal.toFixed(2)}`);
    console.log(`   Diferença: R$ ${(jurosReaisTotal - valorJurosTotal).toFixed(2)}\n`);

    console.log(`✅ Teste completo! Agora verifique o Dashboard.`);
}

main()
    .catch((e) => {
        console.error('❌ Erro:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
