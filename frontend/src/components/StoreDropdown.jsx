import { useState, useRef, useEffect } from 'react';
import { Store, ChevronDown, Plus, Check, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function StoreDropdown({ stores, selectedStore, onChange, onNewStore, onManage }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { isDark } = useTheme();

    const bgColor = isDark ? '#1e293b' : '#ffffff';
    const borderColor = isDark ? '#334155' : '#e5e7eb';
    const textColor = isDark ? '#f1f5f9' : '#1f2937';
    const hoverBg = isDark ? '#334155' : '#f3f4f6';
    const activeBg = isDark ? '#3b82f6' : '#eff6ff';
    const activeText = isDark ? '#ffffff' : '#3b82f6';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getSelectedLabel = () => {
        if (selectedStore === 'all') return 'Todas as Lojas';
        const store = stores.find(s => s.id === selectedStore);
        return store ? store.nome : 'Selecione...';
    };

    const handleSelect = (value) => {
        onChange(value);
        setIsOpen(false);
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 16px',
                    backgroundColor: bgColor,
                    border: `1px solid ${isOpen ? '#8b5cf6' : borderColor}`,
                    borderRadius: '10px',
                    color: textColor,
                    cursor: 'pointer',
                    minWidth: '200px',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                    boxShadow: isOpen
                        ? '0 0 0 3px rgba(139, 92, 246, 0.15)'
                        : (isDark ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.05)')
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : '#f3e8ff',
                        color: '#8b5cf6'
                    }}>
                        <Store size={14} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>
                        {getSelectedLabel()}
                    </span>
                </div>
                <ChevronDown
                    size={14}
                    style={{
                        color: '#94a3b8',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                    }}
                />
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    width: '100%',
                    minWidth: '240px',
                    backgroundColor: bgColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    zIndex: 50,
                    overflow: 'hidden',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div style={{ padding: '6px' }}>
                        <div style={{
                            padding: '8px 12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            color: '#94a3b8',
                            letterSpacing: '0.05em'
                        }}>
                            Filtrar por Loja
                        </div>

                        <button
                            onClick={() => handleSelect('all')}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBg}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 12px',
                                border: 'none',
                                background: 'transparent',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                color: selectedStore === 'all' ? activeText : textColor,
                                backgroundColor: selectedStore === 'all' ? (isDark ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff') : 'transparent',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            <span style={{ fontSize: '13px', fontWeight: '500' }}>Todas as Lojas</span>
                            {selectedStore === 'all' && <Check size={14} />}
                        </button>

                        <div style={{ height: '1px', backgroundColor: borderColor, margin: '6px 0' }}></div>

                        {stores.map(store => (
                            <button
                                key={store.id}
                                onClick={() => handleSelect(store.id)}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBg}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 12px',
                                    border: 'none',
                                    background: 'transparent',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    color: selectedStore === store.id ? activeText : textColor,
                                    backgroundColor: selectedStore === store.id ? (isDark ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff') : 'transparent',
                                    transition: 'all 0.15s ease',
                                    marginBottom: '2px'
                                }}
                            >
                                <span style={{ fontSize: '13px', fontWeight: '500' }}>{store.nome}</span>
                                {selectedStore === store.id && <Check size={14} />}
                            </button>
                        ))}

                        <div style={{ height: '1px', backgroundColor: borderColor, margin: '6px 0' }}></div>

                        <button
                            onClick={() => {
                                setIsOpen(false);
                                onNewStore();
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(139, 92, 246, 0.1)' : '#f5f3ff'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 12px',
                                border: 'none',
                                background: 'transparent',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                color: '#8b5cf6',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                border: '1px solid #8b5cf6'
                            }}>
                                <Plus size={12} />
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: '600' }}>Cadastrar nova loja</span>
                        </button>

                        <button
                            onClick={() => {
                                setIsOpen(false);
                                onManage();
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(99, 102, 241, 0.1)' : '#eef2ff'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 12px',
                                border: 'none',
                                background: 'transparent',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                color: '#6366f1',
                                transition: 'all 0.15s ease',
                                marginTop: '2px'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                border: '1px solid #6366f1'
                            }}>
                                <Settings size={12} />
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: '600' }}>Gerenciar lojas</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StoreDropdown;
