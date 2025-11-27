import { prisma } from '../server.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CONFIG, ERRORS } from '../constants.js';

export const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        const usuario = await prisma.usuario.findUnique({
            where: { email }
        });

        if (!usuario || !usuario.ativo) {
            return res.status(401).json({ error: ERRORS.INVALID_CREDENTIALS });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({ error: ERRORS.INVALID_CREDENTIALS });
        }

        // Token principal com expiração de 8 horas
        const token = jwt.sign(
            { userId: usuario.id, role: usuario.role },
            process.env.JWT_SECRET,
            { expiresIn: CONFIG.JWT.EXPIRATION }
        );

        // Refresh token com expiração de 7 dias
        const refreshToken = jwt.sign(
            { userId: usuario.id },
            process.env.JWT_SECRET,
            { expiresIn: CONFIG.JWT.REFRESH_EXPIRATION }
        );

        res.json({
            token,
            refreshToken,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                role: usuario.role
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: ERRORS.SERVER_ERROR });
    }
};

// Refresh token endpoint
export const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token não fornecido' });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

        // Buscar usuário para verificar se ainda está ativo
        const usuario = await prisma.usuario.findUnique({
            where: { id: decoded.userId }
        });

        if (!usuario || !usuario.ativo) {
            return res.status(401).json({ error: ERRORS.UNAUTHORIZED });
        }

        // Gerar novo token
        const newToken = jwt.sign(
            { userId: usuario.id, role: usuario.role },
            process.env.JWT_SECRET,
            { expiresIn: CONFIG.JWT.EXPIRATION }
        );

        res.json({ token: newToken });
    } catch (error) {
        return res.status(401).json({ error: 'Refresh token inválido' });
    }
};

export const criarUsuario = async (req, res) => {
    try {
        const { nome, email, senha, role } = req.body;

        const usuarioExiste = await prisma.usuario.findUnique({
            where: { email }
        });

        if (usuarioExiste) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const usuario = await prisma.usuario.create({
            data: {
                nome,
                email,
                senha: senhaHash,
                role: role || 'vendedor'
            }
        });

        res.status(201).json({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            role: usuario.role
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
};

export const listarUsuarios = async (req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany({
            select: {
                id: true,
                nome: true,
                email: true,
                role: true,
                ativo: true,
                criadoEm: true
            }
        });

        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
};
