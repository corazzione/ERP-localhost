import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log('🔐 Auth Header:', authHeader ? 'Presente' : 'Ausente');

        const token = authHeader?.split(' ')[1];
        console.log('🎫 Token extraído:', token ? `${token.substring(0, 20)}...` : 'Nenhum');

        if (!token) {
            console.log('❌ Token não fornecido');
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token válido para userId:', decoded.userId);

        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        console.log('❌ Erro ao verificar token:', error.message);
        return res.status(401).json({ error: 'Token inválido' });
    }
};

export const adminOnly = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }
    next();
};
