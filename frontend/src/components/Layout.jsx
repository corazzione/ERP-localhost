import { Outlet, Link, useNavigate } from 'react-router-dom';

function Layout({ setAuth }) {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuth(false);
        navigate('/login');
    };

    return (
        <div className="app">
            <aside className="sidebar">
                <div className="sidebar-logo">ERP Unificado</div>
                <nav>
                    <ul className="sidebar-menu">
                        <li><Link to="/">📊 Dashboard</Link></li>
                        <li><Link to="/clientes">👥 Clientes</Link></li>
                        <li><Link to="/produtos">📦 Produtos</Link></li>
                        <li><Link to="/vendas">🛒 Vendas</Link></li>
                        <li><Link to="/crediario">💳 Crediário</Link></li>
                        <li><Link to="/financeiro">💰 Financeiro</Link></li>
                        <li><Link to="/relatorios">📈 Relatórios</Link></li>
                    </ul>
                </nav>
                <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid #374151' }}>
                    <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{user.nome}</p>
                    <button className="btn btn-outline" onClick={handleLogout} style={{ width: '100%', color: 'white', borderColor: 'white' }}>
                        Sair
                    </button>
                </div>
            </aside>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;
