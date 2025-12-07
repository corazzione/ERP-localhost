import { prisma } from '../lib/prisma.js';
import { loadTemplate, replacePlaceholders, generateItemsTable } from '../services/reciboTemplateService.js';
import { generatePdfFromHtml } from '../services/pdfService.js';

export const getRecibo = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Buscar venda com dados completos
        const venda = await prisma.venda.findUnique({
            where: { id },
            include: {
                cliente: true,
                loja: true,
                itens: {
                    include: { produto: true }
                }
            }
        });

        if (!venda) {
            return res.status(404).json({ error: 'Venda não encontrada' });
        }

        const cliente = venda.cliente;
        const loja = venda.loja;

        // 2. Validar dados obrigatórios do cliente (se houver cliente vinculado)
        // Se for venda balcão (sem cliente), talvez não precise validar?
        // O prompt diz: "Caso falte algum dado obrigatório no cadastro do cliente..."
        // "Validar cadastro do cliente... Por exemplo: nome, endereco_linha_1, telefone"
        // Vamos assumir que se o cliente existe, validamos. Se não existe, usamos "Consumidor Final" ou similar?
        // O prompt diz: "dadosRecibo... nome_cliente: nome do cliente da venda."

        // Se cliente for null, ignoramos validação? 
        // "Caso falte algum dado obrigatório no cadastro do cliente, o backend deve informar... para o frontend pedir o preenchimento."
        // Isso implica que é um cliente cadastrado que está incompleto.

        const camposFaltando = [];
        if (cliente) {
            if (!cliente.nome) camposFaltando.push('nome');
            if (!cliente.endereco) camposFaltando.push('endereco_linha_1'); // Mapeando endereco para endereco_linha_1
            if (!cliente.telefone) camposFaltando.push('telefone');
            // Adicione outros se necessário
        }

        if (camposFaltando.length > 0) {
            return res.status(400).json({
                erro: 'Informações faltando no cadastro do cliente',
                faltando: camposFaltando,
                clienteId: cliente.id
            });
        }

        // 3. Montar dados para o template
        const itensTabela = generateItemsTable(venda.itens);

        const dadosRecibo = {
            nome_cliente: cliente ? cliente.nome : 'Consumidor Final',
            endereco_linha_1: cliente ? cliente.endereco : '',
            endereco_linha_2: cliente ? `${cliente.bairro || ''} ${cliente.cidade || ''}`.trim() : '',
            // Campos de endereço extras (placeholders do template)
            endereco_linha_3: cliente ? `${cliente.estado || ''} ${cliente.cep || ''}`.trim() : '',
            endereco_linha_4: '', // Placeholder extra não usado
            telefone_cliente: cliente ? cliente.telefone : '',

            // Dados da Loja
            nome_empresa: loja ? loja.nome : 'Minha Empresa',
            endereco_empresa: loja ? loja.endereco : '',
            telefone_empresa: loja ? loja.telefone : '',

            // Dados da Venda
            numero_recibo: venda.numero,
            data: new Date(venda.dataVenda).toLocaleDateString('pt-BR'), // Placeholder {{data}}
            data_emissao: new Date().toLocaleDateString('pt-BR'), // Placeholder {{data_emissao}}

            subtotal: formatMoeda(venda.subtotal),
            desconto: formatMoeda(venda.desconto || 0),
            valor_total: formatMoeda(venda.total),

            // Dados de Pagamento (Layout espera esses campos)
            metodo_pagamento: venda.formaPagamento ? venda.formaPagamento.charAt(0).toUpperCase() + venda.formaPagamento.slice(1) : '-',
            entrada: formatMoeda(venda.formaPagamento === 'crediario' ? 0 : venda.total), // Simplificação: se não for crediário, entrada é total
            parcelamento: venda.formaPagamento === 'crediario' ? 'Ver carnê' : 'À vista',

            itens_tabela: itensTabela
        };

        // 4. Carregar template e substituir
        const templateHtml = loadTemplate();
        const htmlPreenchido = replacePlaceholders(templateHtml, dadosRecibo);

        // 5. Gerar PDF
        const pdfBuffer = await generatePdfFromHtml(htmlPreenchido);

        // 6. Retornar PDF (Correção para evitar arquivo corrompido)
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="recibo-${venda.numero}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        return res.status(200).end(pdfBuffer);

    } catch (error) {
        console.error('Erro ao gerar recibo:', error);
        res.status(500).json({ error: 'Erro interno ao gerar recibo' });
    }
};

const formatMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
};
