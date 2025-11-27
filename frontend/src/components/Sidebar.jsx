import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

function Sidebar({ setAuth }) {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setAuth(false);
        navigate('/login');
    };

    const menuItems = [
        { path: '/', icon: '📊', label: 'Dashboard' },
        { path: '/pdv', icon: '🏪', label: 'PDV (Caixa)', highlight: true },
        { path: '/clientes', icon: '👥', label: 'Clientes' },
        { path: '/produtos', icon: '📦', label: 'Produtos' },
        { path: '/vendas', icon: '📋', label: 'Vendas' },
        { path: '/novo-orcamento', icon: '✏️', label: 'Novo Orçamento' },
        { path: '/orcamentos', icon: '📄', label: 'Orçamentos' },
        { path: '/pedidos', icon: '🏭', label: 'Pedidos' },
        { path: '/pedidos-compra', icon: '🛒', label: 'Compras' },
        { path: '/crediario', icon: '💳', label: 'Crediário' },
        { path: '/financeiro', icon: '💰', label: 'Financeiro' },
        { path: '/relatorios', icon: '📈', label: 'Relatórios' }
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <aside style={{
            width: '260px',
            height: '100vh',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 50
        }}>
            {/* Logo */}
            <div style={{
                padding: '1.5rem 1.5rem 1rem',
                borderBottom: '1px solid #e5e7eb'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={logo} alt="Rivvi ERP" style={{ height: '32px' }} />
                    <span style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        Rivvi ERP
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem 0.75rem'
            }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {menuItems.map((item) => (
                        <li key={item.path} style={{ marginBottom: '4px' }}>
                            <Link
                                to={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    textDecoration: 'none',
                                    fontSize: '14px',
                                    fontWeight: isActive(item.path) ? '600' : '500',
                                    color: isActive(item.path) ? '#3b82f6' : '#6b7280',
                                    backgroundColor: isActive(item.path) ? '#eff6ff' : 'transparent',
                                    transition: 'all 0.2s',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive(item.path)) {
                                        e.target.style.backgroundColor = '#f9fafb';
                                        e.target.style.color = '#374151';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive(item.path)) {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#6b7280';
                                    }
                                }}
                            >
                                {isActive(item.path) && (
                                    <div style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '3px',
                                        height: '20px',
                                        backgroundColor: '#3b82f6',
                                        borderRadius: '0 2px 2px 0'
                                    }} />
                                )}
                                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                                <span>{item.label}</span>
                                {item.highlight && (
                                    <span style={{
                                        marginLeft: 'auto',
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        color: '#10b981',
                                        backgroundColor: '#d1fae5',
                                        padding: '2px 8px',
                                        borderRadius: '6px'
                                    }}>HOT</span>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Logout */}
            <div style={{
                padding: '1rem',
                borderTop: '1px solid #e5e7eb'
            }}>
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '10px',
                        backgroundColor: 'transparent',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        color: '#6b7280',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#fef2f2';
                        e.target.style.borderColor = '#fecaca';
                        e.target.style.color = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.color = '#6b7280';
                    }}
                >
                    <span>🚪</span>
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
