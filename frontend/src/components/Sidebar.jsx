import { useNavigate } from 'react-router-dom';
import {
    Home,
    ShoppingCart,
    Receipt,
    FileText,
    ClipboardList,
    Package,
    Warehouse,
    ShoppingBag,
    DollarSign,
    Wallet,
    TrendingUp,
    ArrowUpDown,
    Users,
    Factory,
    CreditCard as CreditCardIcon,
    BarChart3,
    LogOut,
    FolderKanban
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import SidebarGroup from './SidebarGroup';
import SidebarItem from './SidebarItem';

function Sidebar({ setAuth }) {
    const navigate = useNavigate();
    const { isDark } = useTheme();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setAuth(false);
        navigate('/login');
    };

    const bgColor = isDark ? '#1e293b' : '#ffffff';
    const borderColor = isDark ? '#334155' : '#e5e7eb';
    const textSecondary = isDark ? '#94a3b8' : '#9ca3af';

    return (
        <aside style={{
            width: '260px',
            height: '100vh',
            backgroundColor: bgColor,
            borderRight: `1px solid ${borderColor}`,
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 50
        }}>
            {/* Logo/Brand */}
            <div style={{
                padding: '1.25rem 1.25rem 1.5rem',
                marginBottom: '0.5rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Lotus Logo SVG */}
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ flexShrink: 0 }}
                    >
                        <defs>
                            <linearGradient id="lotusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#7c3aed" />
                            </linearGradient>
                        </defs>
                        {/* Center petal */}
                        <path d="M16 6C16 6 14 12 14 16C14 18.2091 14.8954 20 16 20C17.1046 20 18 18.2091 18 16C18 12 16 6 16 6Z" fill="url(#lotusGradient)" />
                        {/* Left petal */}
                        <path d="M8 14C8 14 11 18 14 19C15.6569 19.6667 17 19 17.5 17.5C18 16 17 14 15 13C12 11.5 8 14 8 14Z" fill="url(#lotusGradient)" opacity="0.8" />
                        {/* Right petal */}
                        <path d="M24 14C24 14 21 18 18 19C16.3431 19.6667 15 19 14.5 17.5C14 16 15 14 17 13C20 11.5 24 14 24 14Z" fill="url(#lotusGradient)" opacity="0.8" />
                        {/* Left outer petal */}
                        <path d="M4 20C4 20 8 22 11 22C12.6569 22 14 21 14 19.5C14 18 12.5 17 11 17C8 17 4 20 4 20Z" fill="url(#lotusGradient)" opacity="0.6" />
                        {/* Right outer petal */}
                        <path d="M28 20C28 20 24 22 21 22C19.3431 22 18 21 18 19.5C18 18 19.5 17 21 17C24 17 28 20 28 20Z" fill="url(#lotusGradient)" opacity="0.6" />
                    </svg>

                    <div>
                        <h1 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            margin: 0,
                            letterSpacing: '-0.01em',
                            lineHeight: '1.2'
                        }}>
                            Lotus Core
                        </h1>
                        <p style={{
                            fontSize: '10px',
                            fontWeight: '500',
                            color: isDark ? '#94a3b8' : '#9ca3af',
                            margin: 0,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase'
                        }}>
                            ERP
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '0'
            }}>
                <SidebarGroup title="Dashboard" defaultExpanded={true}>
                    <SidebarItem path="/" icon={Home} label="Home" />
                </SidebarGroup>

                <SidebarGroup title="Sales" defaultExpanded={true}>
                    <SidebarItem path="/pdv" icon={ShoppingCart} label="PDV" />
                    <SidebarItem path="/vendas" icon={Receipt} label="Vendas" />
                    <SidebarItem path="/orcamentos" icon={ClipboardList} label="Orçamentos" />
                </SidebarGroup>

                <SidebarGroup title="Inventory">
                    <SidebarItem path="/produtos" icon={Package} label="Produtos" />
                    <SidebarItem path="/estoque" icon={Warehouse} label="Estoque" />
                    <SidebarItem path="/fornecedores" icon={Factory} label="Fornecedores" />
                </SidebarGroup>

                <SidebarGroup title="Financial">
                    <SidebarItem path="/financeiro" icon={DollarSign} label="Painel Geral" />
                    <SidebarItem path="/crediario" icon={CreditCardIcon} label="Crediário" />
                </SidebarGroup>

                <SidebarGroup title="Contacts">
                    <SidebarItem path="/clientes" icon={Users} label="Clientes" />
                </SidebarGroup>

                <SidebarGroup title="Reports">
                    <SidebarItem path="/relatorios" icon={BarChart3} label="Relatórios" />
                </SidebarGroup>
            </nav>

            {/* Footer / Logout */}
            <div style={{
                padding: '1rem 0.75rem',
                borderTop: `1px solid ${borderColor}`
            }}>
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.625rem 1rem',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        color: textSecondary,
                        fontSize: '14px',
                        fontWeight: '400',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? '#7f1d1d' : '#fef2f2';
                        e.currentTarget.style.color = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = textSecondary;
                    }}
                >
                    <LogOut size={20} strokeWidth={1.5} />
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
