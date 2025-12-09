import { useState, useCallback } from 'react';
import { X, MapPin, Loader2 } from 'lucide-react';
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
        telefone: '',
        email: '',
        cep: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: ''
    });
    const [loading, setLoading] = useState(false);
    const [loadingCep, setLoadingCep] = useState(false);

    const bgColor = isDark ? '#1e293b' : '#ffffff';
    const borderColor = isDark ? '#334155' : '#e5e7eb';
    const textPrimary = isDark ? '#f1f5f9' : '#1f2937';
    const textSecondary = isDark ? '#94a3b8' : '#6b7280';

    // ViaCEP autofill - hook must be before conditional return
    const buscarCep = useCallback(async (cep) => {
        const cepLimpo = cep.replace(/\D/g, '');
        if (cepLimpo.length !== 8) return;

        setLoadingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await response.json();

            if (data.erro) {
                showToast('CEP não encontrado', 'error');
                return;
            }

            setFormData(prev => ({
                ...prev,
                endereco: data.logradouro || prev.endereco,
                bairro: data.bairro || prev.bairro,
                cidade: data.localidade || prev.cidade,
                estado: data.uf || prev.estado
            }));
            showToast('Endereço preenchido!', 'success');
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        } finally {
            setLoadingCep(false);
        }
    }, [showToast]);

    // Early return AFTER all hooks
    if (!isOpen) return null;

    const handleCepBlur = () => {
        if (formData.cep) {
            buscarCep(formData.cep);
        }
    };

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
        setFormData({ nome: '', cpfCnpj: '', telefone: '', email: '', cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' });
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

    const inputStyle = {
        width: '100%',
        padding: '10px 12px',
        fontSize: '14px',
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        backgroundColor: isDark ? '#0f172a' : '#fff',
        color: textPrimary,
        outline: 'none'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '12px',
        fontWeight: '600',
        color: textSecondary,
        marginBottom: '4px'
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
                    justifyContent: 'center',
                    overflow: 'auto',
                    padding: '20px'
                }}
            >
                {/* Modal */}
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        backgroundColor: bgColor,
                        borderRadius: '16px',
                        padding: '1.5rem',
                        width: '100%',
                        maxWidth: '600px',
                        border: `1px solid ${borderColor}`,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}
                >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: textPrimary, margin: 0 }}>
                            Cadastro de Cliente
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            {/* Nome */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Nome *</label>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </div>

                            {/* CPF/CNPJ */}
                            <div>
                                <label style={labelStyle}>CPF/CNPJ *</label>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    value={formData.cpfCnpj}
                                    onChange={(e) => handleCPFChange(e.target.value)}
                                    placeholder="000.000.000-00"
                                    required
                                />
                            </div>

                            {/* Telefone */}
                            <div>
                                <label style={labelStyle}>Telefone</label>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    value={formData.telefone}
                                    onChange={(e) => handlePhoneChange(e.target.value)}
                                    placeholder="(00) 00000-0000"
                                />
                            </div>

                            {/* Email */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>E-mail</label>
                                <input
                                    type="email"
                                    style={inputStyle}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            {/* Address Section Header */}
                            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <MapPin size={16} color={textSecondary} />
                                <span style={{ fontSize: '13px', fontWeight: '600', color: textSecondary }}>Endereço</span>
                            </div>

                            {/* CEP */}
                            <div>
                                <label style={labelStyle}>CEP</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        style={inputStyle}
                                        value={formData.cep}
                                        onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                                        onBlur={handleCepBlur}
                                        placeholder="00000-000"
                                        maxLength={9}
                                    />
                                    {loadingCep && (
                                        <Loader2
                                            size={16}
                                            color={textSecondary}
                                            style={{
                                                position: 'absolute',
                                                right: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                animation: 'spin 1s linear infinite'
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Logradouro */}
                            <div>
                                <label style={labelStyle}>Logradouro</label>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    value={formData.endereco}
                                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                                    placeholder="Rua, Avenida..."
                                />
                            </div>

                            {/* Número */}
                            <div>
                                <label style={labelStyle}>Número</label>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    value={formData.numero}
                                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                                    placeholder="123"
                                />
                            </div>

                            {/* Complemento */}
                            <div>
                                <label style={labelStyle}>Complemento</label>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    value={formData.complemento}
                                    onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                                    placeholder="Apto, Sala..."
                                />
                            </div>

                            {/* Bairro */}
                            <div>
                                <label style={labelStyle}>Bairro</label>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    value={formData.bairro}
                                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                                />
                            </div>

                            {/* Cidade */}
                            <div>
                                <label style={labelStyle}>Cidade</label>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    value={formData.cidade}
                                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                                />
                            </div>

                            {/* UF */}
                            <div>
                                <label style={labelStyle}>UF</label>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    value={formData.estado}
                                    onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                                    maxLength={2}
                                    placeholder="SP"
                                />
                            </div>

                            {/* Buttons */}
                            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
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

            <style>{`
                @keyframes spin {
                    from { transform: translateY(-50%) rotate(0deg); }
                    to { transform: translateY(-50%) rotate(360deg); }
                }
            `}</style>
        </>
    );
}

export default QuickClientModal;

