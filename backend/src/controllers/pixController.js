import { PrismaClient } from '@prisma/client';
import { generatePixEMV, validatePixKey } from '../utils/pixGenerator.js';
import { generateQRCode } from '../utils/qrCodeGenerator.js';

const prisma = new PrismaClient();

/**
 * 🪷 PIX Controller
 * Gerencia configurações PIX e geração de códigos de pagamento
 */

/**
 * Salvar/Atualizar configuração PIX
 * POST /api/config/pix
 */
export const salvarConfigPix = async (req, res) => {
    try {
        const { nomeRecebedor, chavePix, cidade, descricaoPadrao, nomeLoja } = req.body;

        // Validações
        if (!nomeRecebedor || !chavePix || !cidade || !nomeLoja) {
            return res.status(400).json({
                error: 'Campos obrigatórios: nomeRecebedor, chavePix, cidade, nomeLoja'
            });
        }

        // Validar formato da chave PIX
        if (!validatePixKey(chavePix)) {
            return res.status(400).json({
                error: 'Chave PIX inválida. Use email, telefone (+55), CPF, CNPJ ou chave aleatória'
            });
        }

        // Desativar configurações anteriores
        await prisma.pixConfig.updateMany({
            where: { ativo: true },
            data: { ativo: false }
        });

        // Criar nova configuração
        const config = await prisma.pixConfig.create({
            data: {
                nomeRecebedor,
                chavePix,
                cidade,
                descricaoPadrao: descricaoPadrao || 'Venda Lótus Core',
                nomeLoja,
                ativo: true
            }
        });

        res.status(201).json({
            message: 'Configuração PIX salva com sucesso',
            config
        });

    } catch (error) {
        console.error('Erro ao salvar configuração PIX:', error);
        res.status(500).json({ error: 'Erro ao salvar configuração PIX' });
    }
};

/**
 * Buscar configuração PIX ativa
 * GET /api/config/pix
 */
export const buscarConfigPix = async (req, res) => {
    try {
        const config = await prisma.pixConfig.findFirst({
            where: { ativo: true },
            orderBy: { criadoEm: 'desc' }
        });

        if (!config) {
            return res.status(404).json({
                error: 'Nenhuma configuração PIX encontrada. Configure primeiro em Configurações.'
            });
        }

        res.json(config);

    } catch (error) {
        console.error('Erro ao buscar configuração PIX:', error);
        res.status(500).json({ error: 'Erro ao buscar configuração PIX' });
    }
};

/**
 * Gerar código PIX para pagamento
 * POST /api/pagamentos/pix/gerar
 */
export const gerarPixPagamento = async (req, res) => {
    try {
        const { valor, descricao } = req.body;

        // Validações
        if (!valor || valor <= 0) {
            return res.status(400).json({ error: 'Valor inválido' });
        }

        // Buscar configuração ativa
        const config = await prisma.pixConfig.findFirst({
            where: { ativo: true }
        });

        if (!config) {
            return res.status(404).json({
                error: 'Configuração PIX não encontrada. Configure em Configurações > PIX'
            });
        }

        // Validar e limpar todos os campos ANTES de gerar
        const cleanChave = config.chavePix.trim();
        const cleanNome = config.nomeRecebedor
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .toUpperCase()
            .trim()
            .substring(0, 25);

        const cleanCidade = config.cidade
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .toUpperCase()
            .trim()
            .substring(0, 15);

        const cleanDesc = descricao
            ? descricao
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-zA-Z0-9]/g, '')
                .toUpperCase()
                .substring(0, 25)
            : config.descricaoPadrao
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-zA-Z0-9]/g, '')
                .toUpperCase()
                .substring(0, 25);

        // Validações adicionais
        if (!cleanNome || cleanNome.length < 3) {
            return res.status(400).json({
                error: 'Nome do recebedor inválido ou muito curto'
            });
        }

        if (!cleanCidade || cleanCidade.length < 3) {
            return res.status(400).json({
                error: 'Cidade inválida ou muito curta'
            });
        }

        console.log('🔍 Validação PIX:');
        console.log('  Chave:', cleanChave);
        console.log('  Nome:', cleanNome, `(${cleanNome.length} chars)`);
        console.log('  Cidade:', cleanCidade, `(${cleanCidade.length} chars)`);
        console.log('  Descrição:', cleanDesc, `(${cleanDesc.length} chars)`);
        console.log('  Valor:', parseFloat(valor));

        // Gerar código EMV
        const pixCode = generatePixEMV({
            chavePix: cleanChave,
            nomeRecebedor: cleanNome,
            cidade: cleanCidade,
            valor: parseFloat(valor),
            descricao: cleanDesc
        });

        // Gerar QR Code
        const qrCode = await generateQRCode(pixCode);

        console.log('✅ PIX gerado com sucesso:', {
            valor: parseFloat(valor),
            tamanho_codigo: pixCode.length,
            tem_qrcode: !!qrCode
        });

        res.json({
            qrCode,          // Base64 image data URL
            pixCode,         // Código EMV Copia e Cola
            valor: parseFloat(valor),
            descricao: descricao || config.descricaoPadrao,
            nomeRecebedor: config.nomeRecebedor,
            cidade: config.cidade
        });

    } catch (error) {
        console.error('Erro ao gerar PIX:', error);
        res.status(500).json({
            error: 'Erro ao gerar código PIX',
            details: error.message
        });
    }
};

/**
 * Listar histórico de configurações PIX
 * GET /api/config/pix/historico
 */
export const listarHistoricoPix = async (req, res) => {
    try {
        const historico = await prisma.pixConfig.findMany({
            orderBy: { criadoEm: 'desc' },
            take: 10
        });

        res.json(historico);

    } catch (error) {
        console.error('Erro ao listar histórico PIX:', error);
        res.status(500).json({ error: 'Erro ao listar histórico PIX' });
    }
};
