import { useTheme } from '../contexts/ThemeContext';

function PageContainer({ children, title, subtitle }) {
    const { isDark } = useTheme();

    return (
        <div style={{ minHeight: '100%' }}>
            {(title || subtitle) && (
                <div className="page-header" style={{ marginBottom: '2rem' }}>
                    {title && (
                        <h1 style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            color: isDark ? '#f1f5f9' : '#0f172a',
                            marginBottom: '4px'
                        }}>
                            {title}
                        </h1>
                    )}
                    {subtitle && (
                        <p style={{
                            fontSize: '14px',
                            color: isDark ? '#94a3b8' : '#64748b'
                        }}>
                            {subtitle}
                        </p>
                    )}
                </div>
            )}
            {children}
        </div>
    );
}

export default PageContainer;
