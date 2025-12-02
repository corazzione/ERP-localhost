import { useState } from 'react';
import { X, Store, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

function CreateStoreModal({ onClose, onSuccess }) {
    const [nome, setNome] = useState('');
    const [codigo, setCodigo] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { isDark } = useTheme();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/stores', { nome, codigo });
            onSuccess(response.data);
            onClose();
        } catch (err) {
            console.error('Erro ao criar loja:', err);
            setError(err.response?.data?.error || 'Erro ao criar loja');
        } finally {
            setLoading(false);
        }
    };

    const bgColor = isDark ? '#1e293b' : '#ffffff';
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const borderColor = isDark ? '#334155' : '#e2e8f0';
    const inputBg = isDark ? '#0f172a' : '#f8fafc';

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: bgColor,
                borderRadius: '12px',
                padding: '24px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                border: `1px solid ${borderColor}`
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: '600',
                        color: textColor,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Store size={20} color="#8b5cf6" />
                        Nova Loja
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: isDark ? '#94a3b8' : '#64748b'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div style={{
                        padding: '12px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        fontSize: '13px',
                        marginBottom: '16px',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontSize: '13px',
                            fontWeight: '500',
                            color: isDark ? '#cbd5e1' : '#475569'
                        }}>
                            Nome da Loja
                        </label>
                        <input
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Ex: Filial Centro"
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: `1px solid ${borderColor}`,
                                backgroundColor: inputBg,
                                color: textColor,
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontSize: '13px',
                            fontWeight: '500',
                            color: isDark ? '#cbd5e1' : '#475569'
                        }}>
                            Código (Opcional)
                        </label>
                        <input
                            type="text"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            placeholder="Ex: filial-centro"
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: `1px solid ${borderColor}`,
                                backgroundColor: inputBg,
                                color: textColor,
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 16px',
                                borderRadius: '8px',
                                border: `1px solid ${borderColor}`,
                                backgroundColor: 'transparent',
                                color: textColor,
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: '#8b5cf6',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            Criar Loja
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateStoreModal;
