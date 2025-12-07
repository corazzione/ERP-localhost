import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ajustar o caminho se necessário. O arquivo está em backend/recibo.html
// __dirname é backend/src/services. Subindo 2 níveis => backend/
const TEMPLATE_PATH = path.resolve(__dirname, '../../recibo.html');

export const loadTemplate = () => {
    try {
        if (!fs.existsSync(TEMPLATE_PATH)) {
            console.error(`Template não encontrado em: ${TEMPLATE_PATH}`);
            throw new Error(`Template de recibo não encontrado: ${TEMPLATE_PATH}`);
        }
        return fs.readFileSync(TEMPLATE_PATH, 'utf8');
    } catch (error) {
        console.error('Erro ao ler template de recibo:', error);
        throw error;
    }
};

export const replacePlaceholders = (html, data) => {
    let result = html;

    // Lista de chaves esperadas. Se vier undefined, substitui por vazio.
    const keys = Object.keys(data);

    keys.forEach(key => {
        const value = data[key] === undefined || data[key] === null ? '' : data[key];
        // Replace global para substituir todas as ocorrências de {{key}}
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, value);
    });

    return result;
};

export const generateItemsTable = (itens) => {
    // pdf2htmlEX uses absolute positioning with bottom coordinates.
    // Base Y position for the first item (y3 class) is approx 530.58px.
    // Row height (h4 class) is approx 27.6px.
    // We will stack items by subtracting from the bottom value.
    const startBottom = 530.58;
    const rowHeight = 28; // Slightly more than height to give breathing room

    return itens.map((item, index) => {
        const currentBottom = startBottom - (index * rowHeight);
        const totalItem = item.quantidade * item.precoUnit;

        // Classes extracted from recibo.html:
        // Index: x9, Desc: x3, Unit: x4, Qty: x5, Total: x6
        // Common: t m0 h4 y3 ff3 fs1 fc1 sc0 ls0 ws1 (some variable)

        // We use inline style for bottom to override the class 'y3'.
        // We keep 'y3' class for other potential properties, though 'bottom' is the main one.

        return `
            <div class="t m0 x9 h4 y3 ff3 fs1 fc1 sc0 ls0" style="bottom: ${currentBottom}px">${index + 1}</div>
            <div class="t m0 x3 h4 y3 ff3 fs1 fc1 sc0 ls0 ws1" style="bottom: ${currentBottom}px">${item.produto?.nome || item.descricao || 'Item'}</div>
            <div class="t m0 x4 h4 y3 ff3 fs1 fc1 sc0 ls0 ws1" style="bottom: ${currentBottom}px">${formatMoeda(item.precoUnit)}</div>
            <div class="t m0 x5 h4 y3 ff3 fs1 fc1 sc0 ls0" style="bottom: ${currentBottom}px">${item.quantidade}</div>
            <div class="t m0 x6 h4 y3 ff3 fs1 fc1 sc0 ls0 ws1" style="bottom: ${currentBottom}px">${formatMoeda(totalItem)}</div>
        `;
    }).join('');
};

const formatMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
};
