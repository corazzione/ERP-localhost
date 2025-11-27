import { useTheme } from '../contexts/ThemeContext';

function LoadingSpinner({ size = 'md', fullScreen = false, text = '' }) {
    const { isDark } = useTheme();

    const sizes = {
        sm: '24px',
        md: '48px',
        lg: '64px',
        xl: '96px'
    };

    const spinner = (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem'
        }}>
            <div style={{
                width: sizes[size],
                height: sizes[size],
                border: '3px solid',
                borderColor: isDark ? '#334155' : '#e5e7eb',
                borderTopColor: '#3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }} />
            {text && (
                <p style={{
                    fontSize: '14px',
                    color: isDark ? '#cbd5e1' : '#64748b',
                    fontWeight: '500'
                }}>
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                backdropFilter: 'blur(4px)'
            }}>
                {spinner}
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            {spinner}
        </div>
    );
}

export default LoadingSpinner;
