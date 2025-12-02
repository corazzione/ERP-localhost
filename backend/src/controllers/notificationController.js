import { prisma } from '../lib/prisma.js';

export const listarNotificacoes = async (req, res) => {
    try {
        const userId = req.user?.id;

        const notifications = await prisma.notification.findMany({
            where: {
                OR: [
                    { isGlobal: true },
                    { userId: userId }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        res.json(notifications);
    } catch (error) {
        console.error('Erro ao listar notificações:', error);
        res.status(500).json({ error: 'Erro ao listar notificações' });
    }
};

export const marcarComoLida = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.notification.update({
            where: { id: parseInt(id) },
            data: { isRead: true }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao marcar notificação:', error);
        res.status(500).json({ error: 'Erro ao marcar notificação' });
    }
};
