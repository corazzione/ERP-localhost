import { useState, useEffect } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';

function MissingDataModal({ isOpen, onClose, missingFields = [], clienteId, onSuccess }) {
    const { isDark } = useTheme();
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Inicializa campos vazios baseados no que está faltando
            const initialData = {};
            missingFields.forEach(field => {
                initialData[field] = '';
            });
            setFormData(initialData);
        }
    }, [isOpen, missingFields]);

    if (!isOpen) return null;

    const bgModal = isDark ? '#1e293b' : '#ffffff';
    const textPrimary = isDark ? '#f1f5f9' : '#1f2937';
    const textSecondary = isDark ? '#94a3b8' : '#6b7280';
    const borderColor = isDark ? '#334155' : '#e5e7eb';
    const inputBg = isDark ? '#0f172a' : '#f9fafb';

    const fieldLabels = {
        'nome': 'Nome Completo',
        'endereco_linha_1': 'Endereço (Rua, Número, Bairro)',
        'telefone': 'Telefone / Celular'
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Mapear campos de volta para o formato do banco de dados se necessário
            // O backend espera: nome, endereco, telefone (conforme clienteController.js e prisma schema provavel)
            // No reciboController mapeamos: endereco -> endereco_linha_1
            // Então se falta 'endereco_linha_1', devemos atualizar 'endereco'

            const updatePayload = {};
            if (formData.nome) updatePayload.nome = formData.nome;
            if (formData.telefone) updatePayload.telefone = formData.telefone;
            if (formData.endereco_linha_1) updatePayload.endereco = formData.endereco_linha_1;

            await api.put(`/clientes/${clienteId}`, updatePayload);

            toast.success('Dados atualizados com sucesso!');
            onSuccess(); // Tenta gerar o recibo novamente
            onClose();
        } catch (error) {
            console.error('Erro ao atualizar cliente:', error);
            toast.error('Erro ao salvar dados do cliente');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999, // Bem alto para ficar acima de outros modais
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                backgroundColor: bgModal,
                borderRadius: '12px',
                width: '90%',
                maxWidth: '500px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '1.5rem',
                    borderBottom: `1px solid ${borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div style={{
                        padding: '10px',
                        backgroundColor: '#fff7ed',
                        borderRadius: '50%'
                    }}>
                        <AlertTriangle size={24} color="#f97316" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', color: textPrimary, margin: 0 }}>
                            Dados Obrigatórios Faltando
                        </h2>
                        <p style={{ fontSize: '14px', color: textSecondary, margin: '4px 0 0 0' }}>
                            Preencha os campos abaixo para gerar o recibo fiscal.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {missingFields.map(field => (
                            <div key={field}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: textPrimary,
                                    marginBottom: '6px'
                                }}>
                                    {fieldLabels[field] || field} <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    name={field}
                                    value={formData[field]}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '6px',
                                        border: `1px solid ${borderColor}`,
                                        backgroundColor: inputBg,
                                        color: textPrimary,
                                        fontSize: '15px'
                                    }}
                                    placeholder={`Digite ${fieldLabels[field]?.toLowerCase() || field}...`}
                                />
                            </div>
                        ))}
                    </div>

                    <div style={{
                        marginTop: '24px',
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'flex-end'
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 16px',
                                borderRadius: '6px',
                                border: `1px solid ${borderColor}`,
                                backgroundColor: 'transparent',
                                color: textSecondary,
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#f97316',
                                color: 'white',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Salvando...' : (
                                <>
                                    <Save size={18} />
                                    Salvar e Gerar Recibo
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default MissingDataModal;
