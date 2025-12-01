import QRCode from 'qrcode';

/**
 * 🪷 QR Code Generator
 * Gera QR Code a partir de texto (código PIX EMV)
 */

/**
 * Gera QR Code em formato base64 (data URL)
 * @param {string} text - Texto para gerar QR Code (código PIX EMV)
 * @returns {Promise<string>} Data URL do QR Code em base64
 */
export async function generateQRCode(text) {
    try {
        const qrCodeDataURL = await QRCode.toDataURL(text, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            width: 512,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        return qrCodeDataURL;
    } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
        throw new Error('Falha ao gerar QR Code');
    }
}

/**
 * Gera QR Code em formato buffer (para salvar arquivo)
 * @param {string} text - Texto para gerar QR Code
 * @returns {Promise<Buffer>} Buffer do QR Code
 */
export async function generateQRCodeBuffer(text) {
    try {
        const qrCodeBuffer = await QRCode.toBuffer(text, {
            errorCorrectionLevel: 'M',
            type: 'png',
            width: 512,
            margin: 1
        });

        return qrCodeBuffer;
    } catch (error) {
        console.error('Erro ao gerar QR Code buffer:', error);
        throw new Error('Falha ao gerar QR Code buffer');
    }
}
