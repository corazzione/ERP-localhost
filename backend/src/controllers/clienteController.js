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
                carnes: { where: { status: 'ativo' } }
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
