import { prisma } from '../server.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        const usuario = await prisma.usuario.findUnique({
            where: { email }
        });

        if (!usuario || !usuario.ativo) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const token = jwt.sign(
            { userId: usuario.id, role: usuario.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                role: usuario.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro no login' });
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
