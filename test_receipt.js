import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runTest = async () => {
    try {
        console.log('Iniciando teste de geração de PDF com Puppeteer...');

        const htmlPath = path.resolve(__dirname, 'backend/recibo.html');
        const outputPath = path.resolve(__dirname, 'recibo-teste-node.pdf');

        if (!fs.existsSync(htmlPath)) {
            throw new Error(`Arquivo não encontrado: ${htmlPath}`);
        }

        let htmlContent = fs.readFileSync(htmlPath, 'utf8');

        // Dados fake para preenchimento
        const fakeData = {
            "{{nome_cliente}}": "João da Silva",
            "{{endereco_linha_1}}": "Rua das Flores, 123",
            "{{endereco_linha_2}}": "Bairro Feliz, Cidade - UF",
            "{{endereco_linha_3}}": "CEP 12345-678",
            "{{endereco_linha_4}}": "",
            "{{telefone_cliente}}": "(11) 99999-9999",
            "{{data}}": "06/12/2025",
            "{{data_emissao}}": "06/12/2025",
            "{{numero_recibo}}": "000001",
            "{{subtotal}}": "R$ 100,00",
            "{{desconto}}": "R$ 0,00",
            "{{valor_total}}": "R$ 100,00",
            "{{metodo_pagamento}}": "Dinheiro",
            "{{entrada}}": "R$ 100,00",
            "{{parcelamento}}": "À vista",
            "{{itens_tabela}}": `
                <div class="t m0 x9 h4 y3 ff3 fs1 fc1 sc0 ls0" style="bottom: 530.58px">1</div>
                <div class="t m0 x3 h4 y3 ff3 fs1 fc1 sc0 ls0 ws1" style="bottom: 530.58px">Produto Teste Node 1</div>
                <div class="t m0 x4 h4 y3 ff3 fs1 fc1 sc0 ls0 ws1" style="bottom: 530.58px">R$ 50,00</div>
                <div class="t m0 x5 h4 y3 ff3 fs1 fc1 sc0 ls0" style="bottom: 530.58px">1</div>
                <div class="t m0 x6 h4 y3 ff3 fs1 fc1 sc0 ls0 ws1" style="bottom: 530.58px">R$ 50,00</div>
            `
        };

        // Replace placeholders
        Object.keys(fakeData).forEach(key => {
            htmlContent = htmlContent.replace(key, fakeData[key]);
        });

        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Carregar HTML
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // Gerar PDF
        await page.pdf({
            width: '80mm',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
            path: outputPath
        });

        await browser.close();
        console.log(`Sucesso! PDF gerado em: ${outputPath}`);

    } catch (error) {
        console.error('Erro no teste:', error);
    }
};

runTest();
