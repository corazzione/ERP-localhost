import { prisma } from '../server.js';

export const listarClientes = async (req, res) => {
    try {
        const clientes = await prisma.cliente.findMany({
            orderBy: { nome: 'asc' }
        });
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar clientes' });
    }
};

export const buscarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const cliente = await prisma.cliente.findUnique({
            where: { id },
            include: {
                vendas: { take: 10, orderBy: { dataVenda: 'desc' } },
                carnes: {
                    where: { status: 'ativo' },
                    include: { parcelas: { orderBy: { numeroParcela: 'asc' } } }
                }
            }
        });

        if (!cliente) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }

        res.json(cliente);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar cliente' });
    }
};

export const criarCliente = async (req, res) => {
    try {
        const { nome, cpfCnpj, email, telefone, endereco, cidade, estado, cep, limiteCredito } = req.body;

        const clienteExiste = await prisma.cliente.findUnique({
            where: { cpfCnpj }
        });

        if (clienteExiste) {
            return res.status(400).json({ error: 'CPF/CNPJ já cadastrado' });
        }

        const cliente = await prisma.cliente.create({
            data: {
                nome,
                cpfCnpj,
                email,
                telefone,
                endereco,
                cidade,
                estado,
                cep,
                limiteCredito: limiteCredito || 0
            }
        });

        res.status(201).json(cliente);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar cliente' });
    }
};

export const atualizarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const dados = req.body;

        const cliente = await prisma.cliente.update({
            where: { id },
            data: dados
        });

        res.json(cliente);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar cliente' });
    }
};

export const deletarCliente = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.cliente.update({
            where: { id },
            data: { ativo: false }
        });

        res.json({ message: 'Cliente desativado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar cliente' });
    }
};

export const adicionarCredito = async (req, res) => {
    try {
        const { id } = req.params;
        const { valor, observacoes } = req.body;
        const usuarioId = req.userId;

        const valorDecimal = parseFloat(valor);

        if (isNaN(valorDecimal) || valorDecimal <= 0) {
            return res.status(400).json({ error: 'Valor inválido' });
        }

        const resultado = await prisma.$transaction(async (tx) => {
            // 1. Atualizar saldo do cliente
            const cliente = await tx.cliente.update({
                where: { id },
                data: {
                    saldoCredito: { increment: valorDecimal }
                }
            });

            // 2. Registrar entrada no caixa
            await tx.caixa.create({
                data: {
                    tipo: 'entrada',
                    valor: valorDecimal,
                    saldoAnterior: 0, // Simplificação: ideal seria buscar último saldo
                    saldoAtual: valorDecimal, // Simplificação
                    observacoes: `Crédito Cliente: ${cliente.nome}. ${observacoes || ''}`,
                    usuarioId
                }
            });

            return cliente;
        });

        res.json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao adicionar crédito' });
    }
};

export const pagarParcela = async (req, res) => {
    try {
        const { id } = req.params; // ID da parcela
        const { formaPagamento } = req.body;
        const usuarioId = req.userId;

        const resultado = await prisma.$transaction(async (tx) => {
            // 1. Buscar parcela
            const parcela = await tx.parcela.findUnique({
                where: { id },
                include: { carne: true }
            });

            if (!parcela || parcela.status === 'pago') {
                throw new Error('Parcela não encontrada ou já paga');
            }

            // 2. Atualizar status da parcela
            const parcelaAtualizada = await tx.parcela.update({
                where: { id },
                data: {
                    status: 'pago',
                    dataPagamento: new Date(),
                    formaPagamento: formaPagamento || 'dinheiro'
                }
            });

            // 3. Atualizar saldo devedor do cliente
            await tx.cliente.update({
                where: { id: parcela.carne.clienteId },
                data: {
                    saldoDevedor: { decrement: parcela.valorParcela }
                }
            });

            // 4. Registrar entrada no caixa
            await tx.caixa.create({
                data: {
                    tipo: 'entrada',
                    valor: parcela.valorParcela,
                    saldoAnterior: 0,
                    saldoAtual: parcela.valorParcela,
                    observacoes: `Pagamento Parcela ${parcela.numeroParcela}/${parcela.carne.numParcelas} - Carnê ${parcela.carne.numeroCarne}`,
                    usuarioId
                }
            });

            // 5. Verificar se o carnê foi quitado
            const parcelasPendentes = await tx.parcela.count({
                where: {
                    carneId: parcela.carneId,
                    status: 'pendente'
                }
            });

            if (parcelasPendentes === 0) {
                await tx.carne.update({
                    where: { id: parcela.carneId },
                    data: { status: 'concluido' }
                });
            }

            return parcelaAtualizada;
        });

        res.json(resultado);
    } catch (error) {
        console.error('Erro ao pagar parcela:', error);
        res.status(500).json({ error: error.message || 'Erro ao processar pagamento' });
    }
};
