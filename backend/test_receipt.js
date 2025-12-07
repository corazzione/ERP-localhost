import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runTest = async () => {
    try {
        console.log('--- INICIANDO TESTE DE DEBUG (PUPPETEER) ---');

        const htmlPath = path.resolve(__dirname, 'recibo.html');

        if (!fs.existsSync(htmlPath)) {
            throw new Error(`Arquivo não encontrado: ${htmlPath}`);
        }

        let htmlContent = fs.readFileSync(htmlPath, 'utf8');

        // Dados fake para preenchimento
        const fakeData = {
            "{{nome_cliente}}": "João da Silva - DEBUG",
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
            htmlContent = htmlContent.split(key).join(fakeData[key]);
        });

        console.log('Lançando navegador...');
        const browser = await puppeteer.launch({
            headless: 'new', // Use 'new' for modern headless or false to see it if possible
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security', // Allow local file access quirks
                '--font-render-hinting=none'
            ],
            dumpio: true // Pipe browser logs to stdout
        });
        const page = await browser.newPage();

        // --- DEBUG HANDLERS ---
        page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
        page.on('pageerror', error => console.error('BROWSER ERROR:', error));
        page.on('requestfailed', request => console.error('REQUEST FAILED:', request.url(), request.failure().errorText));

        // Log viewport info
        await page.setViewport({ width: 794, height: 1123 }); // A4 roughly in px at 96dpi

        console.log('Carregando conteúdo HTML...');
        // Using setContent with waitUntil networkidle0 to ensure everything is loaded
        await page.setContent(htmlContent, { waitUntil: ['load', 'networkidle0'] });

        // Screenshot for visual debug
        console.log('Tirando screenshot de debug (recibo-debug.png)...');
        await page.screenshot({ path: path.join(__dirname, 'recibo-debug.png'), fullPage: true });

        // FORCE SCREEN MEDIA TYPE
        // The user reported that PNG works (uses screen styles) but PDF is blank (uses print styles).
        // forcing 'screen' ensures PDF uses the same styles as the visible screenshot.
        await page.emulateMediaType('screen');

        // Gerar PDF A4 padrão
        console.log('Gerando PDF A4 (recibo-teste-a4.pdf)...');
        await page.pdf({
            path: path.join(__dirname, 'recibo-teste-a4.pdf'),
            format: 'A4',
            printBackground: true
        });

        // Gerar PDF 80mm
        console.log('Gerando PDF 80mm (recibo-teste-80mm.pdf)...');
        await page.pdf({
            path: path.join(__dirname, 'recibo-teste-80mm.pdf'),
            width: '80mm',
            printBackground: true,
            // scaling requires careful handling, puppeteer scale is 1.0 by default
            // If the content is A4 width (210mm) and we want 80mm, scale ~0.38
            scale: 0.38
        });

        await browser.close();
        console.log('--- TESTE CONCLUÍDO ---');
        console.log('Verifique os arquivos gerados no diretório backend/:');
        console.log('1. recibo-debug.png (Imagem do que o navegador vê)');
        console.log('2. recibo-teste-a4.pdf (PDF formato A4)');
        console.log('3. recibo-teste-80mm.pdf (PDF formato 80mm)');

    } catch (error) {
        console.error('ERRO FATAL NO TESTE:', error);
    }
};

runTest();
