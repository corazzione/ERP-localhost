import { useState, useRef, useEffect } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * 🪷 ClientSelector - Autocomplete inteligente de cliente
 */
function ClientSelector({ clientes, onSelect, onNewClient }) {
    const { isDark } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    const textPrimary = isDark ? '#f1f5f9' : '#1f2937';
    const textSecondary = isDark ? '#94a3b8' : '#6b7280';
    const borderColor = isDark ? '#334155' : '#e5e7eb';
    const bgCard = isDark ? '#1e293b' : '#ffffff';
    const bgHover = isDark ? '#334155' : '#f3f4f6';

    // Filtrar clientes
    const clientesFiltrados = clientes.filter(cliente => {
        const term = searchTerm.toLowerCase();
        return (
            cliente.nome?.toLowerCase().includes(term) ||
            cliente.cpf?.includes(term) ||
            cliente.telefone?.includes(term)
        );
    });

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (cliente) => {
        onSelect(cliente);
        setSearchTerm('');
        setIsOpen(false);
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            {/* Input com ícone */}
            <div style={{ position: 'relative' }}>
                <Search
                    size={18}
                    style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: textSecondary,
                        pointerEvents: 'none'
                    }}
                />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="👤 Buscar cliente por nome, CPF ou telefone..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    style={{
                        width: '100%',
                        padding: '12px 48px 12px 44px',
                        fontSize: '14px',
                        border: `2px solid ${isOpen ? '#8b5cf6' : borderColor}`,
                        borderRadius: '8px',
                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                        color: textPrimary,
                        outline: 'none',
                        transition: 'all 150ms'
                    }}
                />

                {/* Botão Novo Cliente */}
                <button
                    onClick={() => {
                        onNewClient();
                        setIsOpen(false);
                    }}
                    style={{
                        position: 'absolute',
                        right: '6px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#8b5cf6',
                        fontSize: '13px',
                        fontWeight: '600',
                        transition: 'background 150ms'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    title="Cadastrar novo cliente"
                >
                    <UserPlus size={16} />
                    <span>Novo</span>
                </button>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    right: 0,
                    backgroundColor: bgCard,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '10px',
                    boxShadow: isDark
                        ? '0 10px 25px rgba(0, 0, 0, 0.5)'
                        : '0 10px 25px rgba(0, 0, 0, 0.15)',
                    maxHeight: '320px',
                    overflowY: 'auto',
                    zIndex: 1000
                }}>
                    {clientesFiltrados.length === 0 ? (
                        <div style={{
                            padding: '24px',
                            textAlign: 'center',
                            color: textSecondary,
                            fontSize: '14px'
                        }}>
                            {searchTerm ? (
                                <>
                                    <p style={{ marginBottom: '12px' }}>Nenhum cliente encontrado</p>
                                    <button
                                        onClick={() => {
                                            onNewClient();
                                            setIsOpen(false);
                                        }}
                                        style={{
                                            padding: '8px 16px',
                                            background: '#8b5cf6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontWeight: '600'
                                        }}
                                    >
                                        + Cadastrar Cliente
                                    </button>
                                </>
                            ) : (
                                'Digite para buscar...'
                            )}
                        </div>
                    ) : (
                        clientesFiltrados.map(cliente => (
                            <div
                                key={cliente.id}
                                onClick={() => handleSelect(cliente)}
                                style={{
                                    padding: '14px 16px',
                                    cursor: 'pointer',
                                    borderBottom: `1px solid ${borderColor}`,
                                    transition: 'background 100ms',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = bgHover}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                {/* Avatar */}
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    backgroundColor: '#8b5cf6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    flexShrink: 0
                                }}>
                                    {cliente.nome?.charAt(0).toUpperCase()}
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        color: textPrimary,
                                        marginBottom: '2px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {cliente.nome}
                                    </div>
                                    <div style={{
                                        fontSize: '12px',
                                        color: textSecondary,
                                        display: 'flex',
                                        gap: '12px'
                                    }}>
                                        {cliente.telefone && <span>📱 {cliente.telefone}</span>}
                                        {cliente.cpf && <span>📄 {cliente.cpf}</span>}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default ClientSelector;
