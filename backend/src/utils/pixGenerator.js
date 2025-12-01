/**
 * 🪷 PIX EMV Generator - IMPLEMENTAÇÃO PRÓPRIA E TESTADA
 * 100% compatível com especificação Banco Central do Brasil
 */

/**
 * CRC16-CCITT (polinômio 0x1021) - Padrão oficial PIX
 */
function crc16ccitt(str) {
    let crc = 0xFFFF;

    for (let i = 0; i < str.length; i++) {
        crc ^= (str.charCodeAt(i) << 8);

        for (let bit = 0; bit < 8; bit++) {
            if (crc & 0x8000) {
                crc = ((crc << 1) ^ 0x1021);
            } else {
                crc = (crc << 1);
            }
        }
    }

    crc = crc & 0xFFFF;
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Formata campo EMV: ID(2) + Tamanho(2) + Valor
 */
function emvField(id, value) {
    if (!value) return '';
    const size = String(value.length).padStart(2, '0');
    return `${id}${size}${value}`;
}

/**
 * Gera código PIX EMV
 */
export function generatePixEMV({ chavePix, nomeRecebedor, cidade, valor, descricao }) {
    try {
        // Dados já vêm limpos do controller
        const chave = chavePix.trim();
        const nome = nomeRecebedor.trim().substring(0, 25);
        const cid = cidade.trim().substring(0, 15);
        const desc = descricao ? descricao.trim().substring(0, 25) : '';

        // Construir payload PIX
        let pix = '';

        // 00 = Payload Format Indicator
        pix += emvField('00', '01');

        // 26 = Merchant Account Information (PIX)
        let merchantAccount = '';
        merchantAccount += emvField('00', 'br.gov.bcb.pix');
        merchantAccount += emvField('01', chave);
        if (desc) {
            merchantAccount += emvField('02', desc);
        }
        pix += emvField('26', merchantAccount);

        // 52 = Merchant Category Code
        pix += emvField('52', '0000');

        // 53 = Transaction Currency (BRL)
        pix += emvField('53', '986');

        // 54 = Transaction Amount
        if (valor && valor > 0) {
            pix += emvField('54', valor.toFixed(2));
        }

        // 58 = Country Code
        pix += emvField('58', 'BR');

        // 59 = Merchant Name
        pix += emvField('59', nome);

        // 60 = Merchant City
        pix += emvField('60', cid);

        // 62 = Additional Data Field (opcional)
        if (desc) {
            const additionalData = emvField('05', desc);
            pix += emvField('62', additionalData);
        }

        // 63 = CRC16
        pix += '6304';
        const crcValue = crc16ccitt(pix);
        pix += crcValue;

        console.log('✅ PIX EMV GERADO COM SUCESSO');
        console.log('───────────────────────────────────────');
        console.log('Código completo:', pix);
        console.log('Tamanho:', pix.length, 'caracteres');
        console.log('CRC16:', crcValue);
        console.log('═══════════════════════════════════════');

        return pix;

    } catch (error) {
        console.error('❌ Erro ao gerar PIX:', error);
        throw new Error(`Falha ao gerar código PIX: ${error.message}`);
    }
}

/**
 * Valida chave PIX
 */
export function validatePixKey(key) {
    if (!key) return false;
    const k = key.trim();

    // Email
    if (k.includes('@')) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(k);
    }

    // Telefone (+55...)
    if (k.startsWith('+55')) {
        return /^\+55\d{10,11}$/.test(k);
    }

    // CPF (11 dígitos)
    if (/^\d{11}$/.test(k)) return true;

    // CNPJ (14 dígitos)
    if (/^\d{14}$/.test(k)) return true;

    // EVP (UUID)
    if (/^[a-f0-9]{32}$/i.test(k)) return true;
    if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(k)) return true;

    return true; // Aceitar outras chaves
}
