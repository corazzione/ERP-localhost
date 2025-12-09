import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import handlebars from 'handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateReceiptPDF = async (venda) => {
    let browser;
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
                cpfCnpj: venda.cliente?.cpfCnpj || '',
                telefone: venda.cliente?.telefone || '',
                email: venda.cliente?.email || '',
                cep: venda.cliente?.cep || '',
                endereco: venda.cliente?.endereco || '',
                numero: venda.cliente?.numero || '',
                complemento: venda.cliente?.complemento || '',
                bairro: venda.cliente?.bairro || '',
                cidade: venda.cliente?.cidade || '',
                estado: venda.cliente?.estado || ''
            },
            itens: venda.itens.map(item => ({
                produto: { nome: item.produto?.nome || 'Item' },
                descricao: item.descricao,
                quantidade: item.quantidade,
                precoUnit: parseFloat(item.precoUnit || 0).toFixed(2),
                subtotal: parseFloat(item.subtotal || (item.quantidade * item.precoUnit)).toFixed(2)
            })),
            subtotal: parseFloat(venda.subtotal).toFixed(2),
            desconto: (parseFloat(venda.desconto || 0) > 0) ? parseFloat(venda.desconto).toFixed(2) : null,
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

        // 3. Launch Puppeteer and generate PDF
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: ['load', 'networkidle0'] });

        // Generate PDF with thermal printer format (80mm width)
        const pdf = await page.pdf({
            width: '80mm',
            height: 'auto',
            printBackground: true,
            margin: { top: '0', right: '0', bottom: '0', left: '0' }
        });

        await browser.close();
        return pdf;

    } catch (error) {
        console.error('Erro ao gerar PDF com Handlebars:', error);
        if (browser) await browser.close();
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

        // Force screen media type to ensure visibility of elements
        await page.emulateMediaType('screen');

        const pdf = await page.pdf({
            format: 'A4', // Formato A4 para preencher a página toda
            printBackground: true,
            scale: 1.25, // Escala ajustada para caber sem cortar
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
