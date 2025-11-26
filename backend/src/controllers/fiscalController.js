// Controlador de serviços fiscais simulados (NF-e, NFC-e, NFS-e)

/**
 * Simula emissão de Nota Fiscal Eletrônica (NF-e)
 */
export const emitirNFe = async (req, res) => {
    try {
        const { vendaId, naturezaOperacao, informacoesAdicionais } = req.body;

        // SIMULAÇÃO: Em produção, aqui faria integração com API da Sefaz ou provedor
        const nfe = {
            numero: Math.floor(Math.random() * 1000000).toString().padStart(9, '0'),
            serie: '1',
            chaveAcesso: gerarChaveAcesso(),
            dataEmissao: new Date(),
            protocolo: Math.floor(Math.random() * 1000000000).toString(),
            status: 'autorizada',
            vendaId,
            naturezaOperacao: naturezaOperacao || 'Venda de mercadoria',
            informacoesAdicionais: informacoesAdicionais || '',
            xml: '<xml>Simulação de XML da NF-e</xml>',
            urlDanfe: `http://localhost:5000/api/fiscal/danfe/${Math.random().toString(36).substr(2, 9)}`
        };

        res.status(201).json({
            success: true,
            message: 'NF-e emitida com sucesso (SIMULADO)',
            nfe
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao emitir NF-e' });
    }
};

/**
 * Simula emissão de Nota Fiscal de Consumidor Eletrônica (NFC-e)
 */
export const emitirNFCe = async (req, res) => {
    try {
        const { vendaId, cpfCnpjConsumidor } = req.body;

        // SIMULAÇÃO
        const nfce = {
            numero: Math.floor(Math.random() * 1000000).toString().padStart(9, '0'),
            serie: '1',
            chaveAcesso: gerarChaveAcesso(),
            dataEmissao: new Date(),
            protocolo: Math.floor(Math.random() * 1000000000).toString(),
            status: 'autorizada',
            vendaId,
            cpfCnpjConsumidor,
            qrCode: `http://localhost:5000/api/fiscal/qrcode/${Math.random().toString(36).substr(2, 9)}`,
            urlConsulta: `http://nfce.sefaz.rs.gov.br/consulta?chNFe=${gerarChaveAcesso()}`
        };

        res.status(201).json({
            success: true,
            message: 'NFC-e emitida com sucesso (SIMULADO)',
            nfce
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao emitir NFC-e' });
    }
};

/**
 * Simula emissão de Nota Fiscal de Serviço Eletrônica (NFS-e)
 */
export const emitirNFSe = async (req, res) => {
    try {
        const { clienteId, descricaoServico, valorServico, aliquotaISS } = req.body;

        // SIMULAÇÃO
        const nfse = {
            numero: Math.floor(Math.random() * 1000000).toString().padStart(9, '0'),
            codigoVerificacao: Math.random().toString(36).substr(2, 9).toUpperCase(),
            dataEmissao: new Date(),
            status: 'emitida',
            clienteId,
            descricaoServico,
            valorServico,
            aliquotaISS: aliquotaISS || 2.5,
            valorISS: (valorServico * (aliquotaISS || 2.5)) / 100,
            urlConsulta: `http://localhost:5000/api/fiscal/nfse/${Math.random().toString(36).substr(2, 9)}`
        };

        res.status(201).json({
            success: true,
            message: 'NFS-e emitida com sucesso (SIMULADO)',
            nfse
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao emitir NFS-e' });
    }
};

/**
 * Simula cancelamento de nota fiscal
 */
export const cancelarNota = async (req, res) => {
    try {
        const { chaveAcesso, motivo } = req.body;

        // SIMULAÇÃO
        const cancelamento = {
            chaveAcesso,
            motivo,
            dataCancelamento: new Date(),
            protocolo: Math.floor(Math.random() * 1000000000).toString(),
            status: 'cancelada'
        };

        res.json({
            success: true,
            message: 'Nota fiscal cancelada com sucesso (SIMULADO)',
            cancelamento
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao cancelar nota' });
    }
};

/**
 * Lista notas fiscais emitidas (simulação)
 */
export const listarNotasFiscais = async (req, res) => {
    try {
        // SIMULAÇÃO: retorna dados fictícios
        const notas = [
            {
                id: '1',
                numero: '000000001',
                tipo: 'NF-e',
                chaveAcesso: gerarChaveAcesso(),
                dataEmissao: new Date(),
                valor: 1500.00,
                status: 'autorizada'
            },
            {
                id: '2',
                numero: '000000002',
                tipo: 'NFC-e',
                chaveAcesso: gerarChaveAcesso(),
                dataEmissao: new Date(Date.now() - 86400000),
                valor: 250.00,
                status: 'autorizada'
            }
        ];

        res.json(notas);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar notas fiscais' });
    }
};

// Função auxiliar para gerar chave de acesso simulada
function gerarChaveAcesso() {
    return Array.from({ length: 44 }, () => Math.floor(Math.random() * 10)).join('');
}
