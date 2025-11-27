import { useTheme } from '../contexts/ThemeContext';

function EmptyState({ icon, title, description, action }) {
    const { isDark } = useTheme();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 2rem',
            textAlign: 'center'
        }}>
            {icon && (
                <div style={{
                    fontSize: '48px',
                    marginBottom: '1rem',
                    opacity: 0.5
                }}>
                    {icon}
                </div>
            )}
            {title && (
                <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: isDark ? '#f1f5f9' : '#1e293b',
                    marginBottom: '0.5rem'
                }}>
                    {title}
                </h3>
            )}
            {description && (
                <p style={{
                    fontSize: '14px',
                    color: isDark ? '#94a3b8' : '#64748b',
                    marginBottom: action ? '1.5rem' : 0,
                    maxWidth: '400px'
                }}>
                    {description}
                </p>
            )}
            {action && action}
        </div>
    );
}

export default EmptyState;
