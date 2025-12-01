import { useState, useEffect } from 'react';
import { Copy, Check, Loader } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';

/**
 * 🪷 PixPayment Component
 * Seção dedicada ao PIX com QR Code e Copia e Cola
 */
function PixPayment({ valor, onPixGenerated, onConfirm }) {
    const { isDark } = useTheme();
    const [loading, setLoading] = useState(false);
    const [pixData, setPixData] = useState(null);
    const [copied, setCopied] = useState(false);

    const textPrimary = isDark ? '#f1f5f9' : '#1f2937';
    const textSecondary = isDark ? '#94a3b8' : '#6b7280';
    const borderColor = isDark ? '#334155' : '#e5e7eb';
    const bgModal = isDark ? '#1e293b' : '#ffffff';

    useEffect(() => {
        if (valor > 0) {
            gerarPix();
        }
    }, [valor]);

    const gerarPix = async () => {
        setLoading(true);
        try {
            // Gerar descrição limpa (sem espaços, barras, acentos)
            const now = new Date();
            const descricaoLimpa = `VENDA${now.getDate().toString().padStart(2, '0')}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear()}`;

            const response = await api.post('/pagamentos/pix/gerar', {
                valor,
                descricao: descricaoLimpa
            });

            setPixData(response.data);
            if (onPixGenerated) {
                onPixGenerated(response.data);
            }
        } catch (error) {
            console.error('Erro ao gerar PIX:', error);
            alert(error.response?.data?.error || 'Erro ao gerar código PIX. Verifique as configurações.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = async () => {
        if (!pixData?.pixCode) return;

        try {
            await navigator.clipboard.writeText(pixData.pixCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Erro ao copiar:', error);
            alert('Erro ao copiar código');
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem',
                gap: '1rem'
            }}>
                <Loader size={48} color="#a855f7" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ fontSize: '16px', fontWeight: '600', color: textPrimary }}>
                    Gerando QR Code PIX...
                </p>
            </div>
        );
    }

    if (!pixData) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: textSecondary
            }}>
                <p>Aguarde...</p>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
        }}>
            {/* QR Code */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '1rem',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: `2px solid ${borderColor}`
            }}>
                <img
                    src={pixData.qrCode}
                    alt="QR Code PIX"
                    style={{
                        width: '280px',
                        height: '280px',
                        imageRendering: 'pixelated'
                    }}
                />
            </div>

            {/* Código Copia e Cola */}
            <div>
                <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: textSecondary,
                    marginBottom: '8px'
                }}>
                    💳 Código PIX Copia e Cola
                </label>
                <div style={{
                    position: 'relative'
                }}>
                    <textarea
                        readOnly
                        value={pixData.pixCode}
                        style={{
                            width: '100%',
                            padding: '12px',
                            paddingRight: '60px',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            border: `2px solid ${borderColor}`,
                            borderRadius: '8px',
                            backgroundColor: isDark ? '#0f172a' : '#f9fafb',
                            color: textPrimary,
                            resize: 'none',
                            height: '80px',
                            lineHeight: '1.4'
                        }}
                    />
                    <button
                        onClick={handleCopyCode}
                        style={{
                            position: 'absolute',
                            right: '8px',
                            top: '8px',
                            padding: '8px 12px',
                            border: 'none',
                            borderRadius: '6px',
                            background: copied ? '#10b981' : '#a855f7',
                            color: '#ffffff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 150ms'
                        }}
                        onMouseEnter={(e) => {
                            if (!copied) e.currentTarget.style.background = '#9333ea';
                        }}
                        onMouseLeave={(e) => {
                            if (!copied) e.currentTarget.style.background = '#a855f7';
                        }}
                    >
                        {copied ? (
                            <>
                                <Check size={14} />
                                Copiado!
                            </>
                        ) : (
                            <>
                                <Copy size={14} />
                                Copiar
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Informações */}
            <div style={{
                padding: '14px',
                backgroundColor: isDark ? '#5b21b6' : '#faf5ff',
                borderRadius: '8px',
                border: '2px solid #a855f7'
            }}>
                <p style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#a855f7',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <span style={{ fontSize: '16px' }}>⏱️</span>
                    Aguardando pagamento...
                </p>
                <p style={{
                    fontSize: '12px',
                    color: textSecondary,
                    marginBottom: '4px'
                }}>
                    1. Abra o app do seu banco
                </p>
                <p style={{
                    fontSize: '12px',
                    color: textSecondary,
                    marginBottom: '4px'
                }}>
                    2. Escaneie o QR Code ou copie o código
                </p>
                <p style={{
                    fontSize: '12px',
                    color: textSecondary
                }}>
                    3. Confirme o recebimento após o pagamento
                </p>
            </div>

            {/* Detalhes */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '12px',
                padding: '12px',
                backgroundColor: isDark ? '#0f172a' : '#f9fafb',
                borderRadius: '8px',
                border: `1px solid ${borderColor}`
            }}>
                <div>
                    <p style={{ fontSize: '11px', color: textSecondary, marginBottom: '2px' }}>Recebedor</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: textPrimary }}>{pixData.nomeRecebedor}</p>
                </div>
                <div>
                    <p style={{ fontSize: '11px', color: textSecondary, marginBottom: '2px' }}>Cidade</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: textPrimary }}>{pixData.cidade}</p>
                </div>
                <div>
                    <p style={{ fontSize: '11px', color: textSecondary, marginBottom: '2px' }}>Valor</p>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#a855f7' }}>
                        R$ {pixData.valor.toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
    );
}

// Add spin animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

export default PixPayment;
