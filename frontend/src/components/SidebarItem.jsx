import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

function SidebarItem({ label, icon: Icon, path, badge }) {
    const location = useLocation();
    const { isDark } = useTheme();

    const isActive = location.pathname === path;

    const baseColor = isDark ? '#94a3b8' : '#6b7280';
    const activeColor = isDark ? '#8b5cf6' : '#7c3aed';
    const activeBg = isDark ? 'rgba(139, 92, 246, 0.1)' : '#f5f3ff';
    const hoverBg = isDark ? '#334155' : '#f9fafb';

    return (
        <Link
            to={path}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 1.25rem',
                marginBottom: '2px',
                marginLeft: '0.5rem',
                marginRight: '0.5rem',
                backgroundColor: isActive ? activeBg : 'transparent',
                color: isActive ? activeColor : baseColor,
                textDecoration: 'none',
                borderRadius: '8px',
                transition: 'all 0.15s ease',
                fontSize: '14px',
                fontWeight: isActive ? '500' : '400',
                position: 'relative'
            }}
            onMouseEnter={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = hoverBg;
                    e.currentTarget.style.color = isDark ? '#e2e8f0' : '#374151';
                }
            }}
            onMouseLeave={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = baseColor;
                }
            }}
        >
            {Icon && (
                <Icon
                    size={20}
                    strokeWidth={1.5}
                    style={{
                        flexShrink: 0,
                        transition: 'all 0.15s'
                    }}
                />
            )}

            <span style={{ flex: 1 }}>{label}</span>

            {badge && (
                <span style={{
                    fontSize: '11px',
                    fontWeight: '500',
                    padding: '2px 7px',
                    borderRadius: '6px',
                    backgroundColor: isDark ? 'rgba(148, 163, 184, 0.15)' : '#e5e7eb',
                    color: isDark ? '#94a3b8' : '#6b7280'
                }}>
                    {badge}
                </span>
            )}
        </Link>
    );
}

export default SidebarItem;
