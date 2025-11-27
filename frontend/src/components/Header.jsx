import { useState } from 'react';
import { Search, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function Header() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const { isDark, toggleTheme } = useTheme();

    const headerBg = isDark ? '#1e293b' : '#ffffff';
    const borderColor = isDark ? '#334155' : '#e5e7eb';
    const textColor = isDark ? '#f1f5f9' : '#1f2937';
    const inputBg = isDark ? '#0f172a' : '#f9fafb';
    const inputBorder = isDark ? '#334155' : '#e5e7eb';

    return (
        <header style={{
            height: '70px',
            backgroundColor: headerBg,
            borderBottom: `1px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease'
        }}>
            {/* Search Bar */}
            <div style={{ flex: 1, maxWidth: '500px' }}>
                <div style={{ position: 'relative' }}>
                    <Search
                        size={18}
                        style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#9ca3af'
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Buscar produtos, clientes, vendas..."
                        style={{
                            width: '100%',
                            padding: '10px 12px 10px 40px',
                            border: `1px solid ${inputBorder}`,
                            borderRadius: '10px',
                            fontSize: '14px',
                            backgroundColor: inputBg,
                            color: textColor,
                            transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#3b82f6';
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = inputBorder;
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>
            </div>

            {/* Right Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleTheme}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s',
                        color: textColor
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = isDark ? '#334155' : '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    title={isDark ? 'Modo claro' : 'Modo escuro'}
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Notifications */}
                <button style={{
                    position: 'relative',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s',
                    color: textColor
                }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = isDark ? '#334155' : '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                    <Bell size={20} />
                    <span style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#ef4444',
                        borderRadius: '50%',
                        border: `2px solid ${headerBg}`
                    }}></span>
                </button>

                {/* User Profile */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '6px 12px',
                            borderRadius: '10px',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = isDark ? '#334155' : '#f3f4f6'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}>
                            {user.nome?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: textColor }}>
                                {user.nome || 'Usuário'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                Administrador
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;
