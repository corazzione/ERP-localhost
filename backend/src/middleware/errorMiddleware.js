import { ERRORS } from '../constants.js';

export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Prisma errors
    if (err.code === 'P2002') {
        return res.status(400).json({
            error: ERRORS.DUPLICATE_ENTRY,
            field: err.meta?.target?.[0]
        });
    }

    if (err.code === 'P2025') {
        return res.status(404).json({ error: ERRORS.NOT_FOUND });
    }

    if (err.name === 'PrismaClientValidationError') {
        return res.status(400).json({ error: ERRORS.VALIDATION_ERROR });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Token inválido' });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado' });
    }

    // Default error
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production'
            ? ERRORS.SERVER_ERROR
            : err.message
    });
};

// 404 handler
export const notFoundHandler = (req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
};
