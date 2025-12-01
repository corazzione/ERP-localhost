import { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from './Toast';
import api from '../services/api';
import { playSound } from '../utils/sounds';
import { validarCPF, validarCNPJ, formatarCPF, formatarTelefone } from '../utils/validators';

function QuickClientModal({ isOpen, onClose, onClientCreated }) {
    const { isDark } = useTheme();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        nome: '',
        cpfCnpj: '',
        telefone: ''
    });
    const [loading, setLoading] = useState(false);

    const bgColor = isDark ? '#1e293b' : '#ffffff';
    const borderColor = isDark ? '#334155' : '#e5e7eb';
    const textPrimary = isDark ? '#f1f5f9' : '#1f2937';

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar CPF/CNPJ se fornecido
        if (formData.cpfCnpj) {
            const cleanCPF = formData.cpfCnpj.replace(/\D/g, '');
            if (cleanCPF.length === 11 && !validarCPF(formData.cpfCnpj)) {
                showToast('CPF inválido', 'error');
                playSound('error');
                return;
            }
            if (cleanCPF.length === 14 && !validarCNPJ(formData.cpfCnpj)) {
                showToast('CNPJ inválido', 'error');
                playSound('error');
                return;
            }
            if (cleanCPF.length > 0 && cleanCPF.length !== 11 && cleanCPF.length !== 14) {
                showToast('CPF/CNPJ deve ter 11 ou 14 dígitos', 'error');
                playSound('error');
                return;
            }
        }

        setLoading(true);
        try {
            const response = await api.post('/clientes', formData);
            playSound('success');
            showToast('Cliente cadastrado com sucesso!', 'success');
            if (onClientCreated) {
                onClientCreated(response.data);
            }
            handleClose();
        } catch (error) {
            console.error('Erro ao criar cliente:', error);
            playSound('error');
            showToast(error.response?.data?.error || 'Erro ao criar cliente', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ nome: '', cpfCnpj: '', telefone: '' });
        onClose();
    };

    const handleCPFChange = (value) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length <= 14) {
            if (cleaned.length <= 11) {
                setFormData({ ...formData, cpfCnpj: formatarCPF(value) });
            } else {
                setFormData({ ...formData, cpfCnpj: value });
            }
        }
    };

    const handlePhoneChange = (value) => {
        setFormData({ ...formData, telefone: formatarTelefone(value) });
    };

    return (
        <>
            {/* Overlay */}
            <div
                onClick={handleClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {/* Modal */}
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        backgroundColor: bgColor,
                        borderRadius: '12px',
                        padding: '1.5rem',
                        width: '90%',
                        maxWidth: '400px',
                        border: `1px solid ${borderColor}`,
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: textPrimary, margin: 0 }}>
                            Cadastro Rápido de Cliente
                        </h3>
                        <button
                            onClick={handleClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                color: textPrimary
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label className="label">Nome *</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="label">CPF/CNPJ</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.cpfCnpj}
                                    onChange={(e) => handleCPFChange(e.target.value)}
                                    placeholder="000.000.000-00"
                                />
                            </div>

                            <div>
                                <label className="label">Telefone</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.telefone}
                                    onChange={(e) => handlePhoneChange(e.target.value)}
                                    placeholder="(00) 00000-0000"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="btn btn-outline"
                                    style={{ flex: 1 }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                    style={{ flex: 1 }}
                                >
                                    {loading ? 'Salvando...' : 'Salvar e Usar'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default QuickClientModal;
