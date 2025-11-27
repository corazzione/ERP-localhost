import { useTheme } from '../contexts/ThemeContext';

function Card({ children, title, subtitle, actions, padding = '1.5rem', className = '' }) {
    const { isDark } = useTheme();

    const bgColor = isDark ? '#1e293b' : '#ffffff';
    const borderColor = isDark ? '#334155' : '#e5e7eb';
    const textPrimary = isDark ? '#f1f5f9' : '#1f2937';
    const textSecondary = isDark ? '#cbd5e1' : '#6b7280';

    return (
        <div
            className={`card ${className}`}
            style={{
                backgroundColor: bgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }}
        >
            {(title || actions) && (
                <div style={{
                    padding: padding,
                    borderBottom: `1px solid ${borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        {title && (
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: textPrimary,
                                margin: 0,
                                marginBottom: subtitle ? '4px' : 0
                            }}>
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p style={{
                                fontSize: '14px',
                                color: textSecondary,
                                margin: 0
                            }}>
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {actions && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {actions}
                        </div>
                    )}
                </div>
            )}
            <div style={{ padding: padding }}>
                {children}
            </div>
        </div>
    );
}

export default Card;
