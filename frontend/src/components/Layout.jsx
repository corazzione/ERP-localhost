import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useTheme } from '../contexts/ThemeContext';

function Layout({ setAuth }) {
    const { isDark } = useTheme();

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: isDark ? '#0f172a' : '#f9fafb',
            transition: 'background-color 0.3s ease'
        }}>
            <Sidebar setAuth={setAuth} />
            <div style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Header />
                <main style={{
                    flex: 1,
                    padding: '2rem',
                    overflowY: 'auto'
                }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default Layout;
