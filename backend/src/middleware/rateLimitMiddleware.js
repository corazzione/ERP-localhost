import rateLimit from 'express-rate-limit';
import { CONFIG } from '../constants.js';

// Rate limiter global
export const globalLimiter = rateLimit({
    windowMs: CONFIG.RATE_LIMIT.WINDOW_MS,
    max: CONFIG.RATE_LIMIT.MAX_REQUESTS,
    message: 'Muitas requisições. Tente novamente em alguns minutos.',
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiter específico para login
export const loginLimiter = rateLimit({
    windowMs: CONFIG.RATE_LIMIT.WINDOW_MS,
    max: CONFIG.RATE_LIMIT.LOGIN_MAX,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    skipSuccessfulRequests: true
});
