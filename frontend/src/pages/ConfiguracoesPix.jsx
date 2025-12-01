import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Save, ArrowLeft, Check, AlertCircle, Loader } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../components/Toast';
import api from '../services/api';

/**
 * 🪷 Configurações PIX
 * Página para configurar dados do PIX Copia e Cola
 */
function ConfiguracoesPix() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(false);
    const [loadingConfig, setLoadingConfig] = useState(true);
    const [formData, setFormData] = useState({
        nomeRecebedor: '',
        chavePix: '',
        cidade: '',
        descricaoPadrao: 'Venda Lótus Core',
        nomeLoja: ''
    });

    const bgMain = isDark ? '#0f172a' : '#f8fafc';
    const bgCard = isDark ? '#1e293b' : '#ffffff';
    const textPrimary = isDark ? '#f1f5f9' : '#1f2937';
    const textSecondary = isDark ? '#94a3b8' : '#6b7280';
    const borderColor = isDark ? '#334155' : '#e5e7eb';

    useEffect(() => {
        carregarConfig();
    }, []);

    const carregarConfig = async () => {
        setLoadingConfig(true);
        try {
            const response = await api.get('/config/pix');
            setFormData({
                nomeRecebedor: response.data.nomeRecebedor || '',
                chavePix: response.data.chavePix || '',
                cidade: response.data.cidade || '',
                descricaoPadrao: response.data.descricaoPadrao || 'Venda Lótus Core',
                nomeLoja: response.data.nomeLoja || ''
            });
        } catch (error) {
            // Se não houver configuração, não mostrar erro
            if (error.response?.status !== 404) {
                console.error('Erro ao carregar configuração:', error);
            }
        } finally {
            setLoadingConfig(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/config/pix', formData);
            showToast('Configuração PIX salva com sucesso!', 'success');
            setTimeout(() => navigate('/'), 1500);
        } catch (error) {
            console.error('Erro ao salvar:', error);
            showToast(error.response?.data?.error || 'Erro ao salvar configuração', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    if (loadingConfig) {
        return (
            <div style={{
                minHeight: '100vh',
                backgroundColor: bgMain,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Loader size={48} color="#8b5cf6" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: bgMain,
            padding: '2rem'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: textSecondary,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '14px',
                            fontWeight: '500',
                            marginBottom: '1rem',
                            padding: '4px',
                            transition: 'color 150ms'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#8b5cf6'}
                        onMouseLeave={(e) => e.currentTarget.style.color = textSecondary}
                    >
                        <ArrowLeft size={18} />
                        Voltar ao Dashboard
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Smartphone size={32} color="#8b5cf6" />
                        <div>
                            <h1 style={{
                                fontSize: '28px',
                                fontWeight: '700',
                                color: textPrimary,
                                margin: 0,
                                marginBottom: '4px'
                            }}>
                                Configurações PIX
                            </h1>
                            <p style={{
                                fontSize: '14px',
                                color: textSecondary,
                                margin: 0
                            }}>
                                Configure os dados para receber pagamentos via PIX
                            </p>
                        </div>
                    </div>
                </div>

                {/* Alert Info */}
                <div style={{
                    padding: '16px',
                    backgroundColor: isDark ? '#1e3a8a' : '#dbeafe',
                    border: `1px solid ${isDark ? '#3b82f6' : '#60a5fa'}`,
                    borderRadius: '10px',
                    marginBottom: '2rem',
                    display: 'flex',
                    gap: '12px'
                }}>
                    <AlertCircle size={20} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <p style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: isDark ? '#93c5fd' : '#1e40af',
                            marginBottom: '4px'
                        }}>
                            Importante
                        </p>
                        <p style={{
                            fontSize: '13px',
                            color: isDark ? '#bfdbfe' : '#1e40af',
                            margin: 0,
                            lineHeight: '1.5'
                        }}>
                            Esta configuração é necessária para gerar QR Codes e códigos PIX Copia e Cola no PDV.
                            Certifique-se de usar uma chave PIX válida cadastrada em seu banco.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{
                        backgroundColor: bgCard,
                        borderRadius: '12px',
                        padding: '2rem',
                        border: `1px solid ${borderColor}`
                    }}>
                        <div style={{
                            display: 'grid',
                            gap: '1.5rem'
                        }}>
                            {/* Nome Loja */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: textPrimary,
                                    marginBottom: '8px'
                                }}>
                                    🏪 Nome da Loja *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nomeLoja}
                                    onChange={(e) => handleChange('nomeLoja', e.target.value)}
                                    placeholder="Ex: Loja ABC Ltda"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        fontSize: '15px',
                                        border: `2px solid ${borderColor}`,
                                        borderRadius: '8px',
                                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                                        color: textPrimary,
                                        outline: 'none',
                                        transition: 'border-color 150ms'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = borderColor}
                                />
                            </div>

                            {/* Nome Recebedor */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: textPrimary,
                                    marginBottom: '8px'
                                }}>
                                    👤 Nome do Recebedor *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nomeRecebedor}
                                    onChange={(e) => handleChange('nomeRecebedor', e.target.value)}
                                    placeholder="Nome que aparecerá no PIX"
                                    maxLength={25}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        fontSize: '15px',
                                        border: `2px solid ${borderColor}`,
                                        borderRadius: '8px',
                                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                                        color: textPrimary,
                                        outline: 'none',
                                        transition: 'border-color 150ms'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = borderColor}
                                />
                                <p style={{
                                    fontSize: '12px',
                                    color: textSecondary,
                                    marginTop: '4px',
                                    margin: '4px 0 0 0'
                                }}>
                                    Máximo 25 caracteres
                                </p>
                            </div>

                            {/* Chave PIX */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: textPrimary,
                                    marginBottom: '8px'
                                }}>
                                    🔑 Chave PIX *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.chavePix}
                                    onChange={(e) => handleChange('chavePix', e.target.value)}
                                    placeholder="Email, telefone (+55), CPF, CNPJ ou chave aleatória"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        fontSize: '15px',
                                        border: `2px solid ${borderColor}`,
                                        borderRadius: '8px',
                                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                                        color: textPrimary,
                                        fontFamily: 'monospace',
                                        outline: 'none',
                                        transition: 'border-color 150ms'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = borderColor}
                                />
                                <p style={{
                                    fontSize: '12px',
                                    color: textSecondary,
                                    marginTop: '4px',
                                    margin: '4px 0 0 0'
                                }}>
                                    Email, telefone (+5511999999999), CPF, CNPJ ou chave aleatória
                                </p>
                            </div>

                            {/* Cidade */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: textPrimary,
                                    marginBottom: '8px'
                                }}>
                                    📍 Cidade *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.cidade}
                                    onChange={(e) => handleChange('cidade', e.target.value)}
                                    placeholder="Ex: São Paulo"
                                    maxLength={15}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        fontSize: '15px',
                                        border: `2px solid ${borderColor}`,
                                        borderRadius: '8px',
                                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                                        color: textPrimary,
                                        outline: 'none',
                                        transition: 'border-color 150ms'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = borderColor}
                                />
                                <p style={{
                                    fontSize: '12px',
                                    color: textSecondary,
                                    marginTop: '4px',
                                    margin: '4px 0 0 0'
                                }}>
                                    Máximo 15 caracteres
                                </p>
                            </div>

                            {/* Descrição Padrão */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: textPrimary,
                                    marginBottom: '8px'
                                }}>
                                    📝 Descrição Padrão
                                </label>
                                <input
                                    type="text"
                                    value={formData.descricaoPadrao}
                                    onChange={(e) => handleChange('descricaoPadrao', e.target.value)}
                                    placeholder="Ex: Venda Lótus Core"
                                    maxLength={25}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        fontSize: '15px',
                                        border: `2px solid ${borderColor}`,
                                        borderRadius: '8px',
                                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                                        color: textPrimary,
                                        outline: 'none',
                                        transition: 'border-color 150ms'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = borderColor}
                                />
                                <p style={{
                                    fontSize: '12px',
                                    color: textSecondary,
                                    marginTop: '4px',
                                    margin: '4px 0 0 0'
                                }}>
                                    Aparecerá nos comprovantes PIX (máximo 25 caracteres)
                                </p>
                            </div>
                        </div>

                        {/* Botões */}
                        <div style={{
                            marginTop: '2rem',
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                style={{
                                    padding: '12px 24px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    border: `2px solid ${borderColor}`,
                                    borderRadius: '8px',
                                    background: 'transparent',
                                    color: textSecondary,
                                    cursor: 'pointer',
                                    transition: 'all 150ms'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = isDark ? '#1e293b' : '#f3f4f6';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '12px 32px',
                                    fontSize: '15px',
                                    fontWeight: '700',
                                    border: 'none',
                                    borderRadius: '8px',
                                    background: loading
                                        ? (isDark ? '#334155' : '#e5e7eb')
                                        : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                    color: loading ? textSecondary : '#ffffff',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 150ms',
                                    opacity: loading ? 0.5 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {loading ? (
                                    <>
                                        <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Salvar Configuração
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ConfiguracoesPix;
