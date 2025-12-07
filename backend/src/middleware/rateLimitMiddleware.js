import rateLimit from 'express-rate-limit';
import { CONFIG } from '../constants.js';

// Rate limiter global
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs (Increased for dev)
    message: 'Muitas requisições. Tente novamente em alguns minutos.',
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiter específico para login
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    skipSuccessfulRequests: true
});
