import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const listarFormasPagamento = async (req, res) => {
    try {
        const methods = await prisma.paymentMethod.findMany({
            where: { active: true },
            orderBy: { label: 'asc' }
        });
        res.json(methods);
    } catch (error) {
        console.error('Erro ao listar formas de pagamento:', error);
        res.status(500).json({ error: 'Erro ao listar formas de pagamento' });
    }
};
