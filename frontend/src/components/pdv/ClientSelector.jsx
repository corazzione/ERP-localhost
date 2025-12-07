import { memo, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Search, UserPlus, Phone, FileText } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * 🪷 ClientSelector - Autocomplete inteligente de cliente
 * Optimized with React.memo and debounced search
 */
const ClientSelector = memo(function ClientSelector({ clientes, onSelect, onNewClient }) {
    const { isDark } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);
    const debounceRef = useRef(null);

    // Memoized theme colors
    const themeColors = useMemo(() => ({
        textPrimary: isDark ? '#f1f5f9' : '#1f2937',
        textSecondary: isDark ? '#94a3b8' : '#6b7280',
        borderColor: isDark ? '#334155' : '#e5e7eb',
        bgCard: isDark ? '#1e293b' : '#ffffff',
        bgHover: isDark ? '#334155' : '#f3f4f6',
        bgInput: isDark ? '#0f172a' : '#ffffff'
    }), [isDark]);

    const { textPrimary, textSecondary, borderColor, bgCard, bgHover, bgInput } = themeColors;

    // Debounced search
    const handleSearchChange = useCallback((e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setIsOpen(true);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            setDebouncedSearch(value);
        }, 200);
    }, []);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    // Filtrar clientes - memoized
    const clientesFiltrados = useMemo(() => {
        const term = debouncedSearch.toLowerCase();
        if (!term) return clientes.slice(0, 20); // Limit initial results

        return clientes.filter(cliente =>
            cliente.nome?.toLowerCase().includes(term) ||
            cliente.cpf?.includes(term) ||
            cliente.telefone?.includes(term)
        ).slice(0, 20); // Limit results
    }, [clientes, debouncedSearch]);

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

    const handleSelect = useCallback((cliente) => {
        onSelect(cliente);
        setSearchTerm('');
        setDebouncedSearch('');
        setIsOpen(false);
    }, [onSelect]);

    const handleFocus = useCallback(() => {
        setIsOpen(true);
    }, []);

    const handleNewClientClick = useCallback(() => {
        onNewClient();
        setIsOpen(false);
    }, [onNewClient]);

    const handleNewClientHover = useCallback((e) => {
        e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
    }, []);

    const handleNewClientLeave = useCallback((e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
    }, []);

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
                    placeholder="Buscar cliente por nome, CPF ou telefone..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={handleFocus}
                    style={{
                        width: '100%',
                        padding: '12px 48px 12px 44px',
                        fontSize: '14px',
                        border: `2px solid ${isOpen ? '#8b5cf6' : borderColor}`,
                        borderRadius: '8px',
                        backgroundColor: bgInput,
                        color: textPrimary,
                        outline: 'none',
                        transition: 'all 150ms'
                    }}
                />

                {/* Botão Novo Cliente */}
                <button
                    onClick={handleNewClientClick}
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
                    onMouseEnter={handleNewClientHover}
                    onMouseLeave={handleNewClientLeave}
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
                                        onClick={handleNewClientClick}
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
                            <ClientRow
                                key={cliente.id}
                                cliente={cliente}
                                onSelect={handleSelect}
                                textPrimary={textPrimary}
                                textSecondary={textSecondary}
                                borderColor={borderColor}
                                bgHover={bgHover}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
});

// Memoized Client Row Component
const ClientRow = memo(function ClientRow({
    cliente,
    onSelect,
    textPrimary,
    textSecondary,
    borderColor,
    bgHover
}) {
    const handleClick = useCallback(() => {
        onSelect(cliente);
    }, [onSelect, cliente]);

    const handleMouseEnter = useCallback((e) => {
        e.currentTarget.style.backgroundColor = bgHover;
    }, [bgHover]);

    const handleMouseLeave = useCallback((e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
    }, []);

    return (
        <div
            onClick={handleClick}
            style={{
                padding: '14px 16px',
                cursor: 'pointer',
                borderBottom: `1px solid ${borderColor}`,
                transition: 'background 100ms',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
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
                    {cliente.telefone && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={12} />
                            {cliente.telefone}
                        </span>
                    )}
                    {cliente.cpf && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FileText size={12} />
                            {cliente.cpf}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
});

export default ClientSelector;
