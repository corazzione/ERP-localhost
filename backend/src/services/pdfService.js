import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import handlebars from 'handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateReceiptPDF = async (venda) => {
    try {
        // 1. Prepare data for template
        const templateData = {
            loja: {
                nome: venda.loja?.nome || 'Minha Loja',
                endereco: venda.loja?.endereco || '',
                telefone: venda.loja?.telefone || '',
                cnpj: venda.loja?.cnpj || '00.000.000/0001-00'
            },
            numero: venda.numero,
            dataVenda: new Date(venda.dataVenda).toLocaleString('pt-BR'),
            cliente: {
                nome: venda.cliente?.nome || 'Cliente Balcão',
                cpfCnpj: venda.cliente?.cpfCnpj || ''
            },
            itens: venda.itens.map(item => ({
                produto: { nome: item.produto?.nome || 'Item' },
                descricao: item.descricao, // Optional extra description
                quantidade: item.quantidade,
                subtotal: parseFloat(item.subtotal || (item.quantidade * item.precoUnit)).toFixed(2)
            })),
            subtotal: parseFloat(venda.subtotal).toFixed(2),
            desconto: parseFloat(venda.desconto || 0).toFixed(2),
            total: parseFloat(venda.total).toFixed(2),
            formaPagamento: formatFormaPagamento(venda.formaPagamento),
            observacoes: venda.observacoes,
            troco: venda.troco ? parseFloat(venda.troco).toFixed(2) : null
        };

        // 2. Read and compile template
        const templatePath = path.resolve(__dirname, '../templates/recibo.hbs');

        // Ensure template directory exists
        if (!fs.existsSync(path.dirname(templatePath))) {
            fs.mkdirSync(path.dirname(templatePath), { recursive: true });
        }

        const templateHtml = fs.readFileSync(templatePath, 'utf8');
        const template = handlebars.compile(templateHtml);
        const html = template(templateData);

        // 3. Launch Puppeteer
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        await browser.close();
        return pdf;

    } catch (error) {
        console.error('Erro ao gerar PDF com Handlebars:', error);
        throw new Error('Falha na geração do PDF');
    }
};

const formatFormaPagamento = (forma) => {
    const formas = {
        dinheiro: 'Dinheiro',
        credito: 'Cartão de Crédito',
        debito: 'Cartão de Débito',
        pix: 'PIX',
        crediario: 'Crediário'
    };
    return formas[forma] || forma;
};

export const generatePdfFromHtml = async (htmlContent) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        await page.setContent(htmlContent, { waitUntil: ['load', 'networkidle0'] });

        // Force screen media type to ensure visibility of elements hidden in print mode by default
        await page.emulateMediaType('screen');

        // DEBUG: Take a screenshot to see what the browser actually renders
        try {
            const path = await import('path');
            const screenshotPath = path.resolve(process.cwd(), 'debug_app_render.png');
            await page.screenshot({ path: screenshotPath, fullPage: true });
            console.log('DEBUG: Screenshot salvo em:', screenshotPath);
        } catch (err) {
            console.error('DEBUG: Erro ao tirar screenshot:', err);
        }

        const pdf = await page.pdf({
            width: '80mm', // Set to 80mm as per requirements
            printBackground: true,
            scale: 0.38, // Scale down A4 content to fit 80mm
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        });

        await browser.close();
        return pdf;

    } catch (error) {
        console.error('Erro ao gerar PDF via HTML:', error);
        if (browser) await browser.close();
        throw new Error('Falha na geração do PDF a partir do HTML');
    }
};
