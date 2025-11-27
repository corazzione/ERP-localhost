import { useTheme } from '../contexts/ThemeContext';

function Badge({ children, variant = 'default', size = 'md' }) {
    const { isDark } = useTheme();

    const variants = {
        default: {
            bg: isDark ? '#374151' : '#e5e7eb',
            color: isDark ? '#f3f4f6' : '#1f2937'
        },
        primary: {
            bg: '#3b82f6',
            color: '#ffffff'
        },
        success: {
            bg: isDark ? '#064e3b' : '#d1fae5',
            color: isDark ? '#10b981' : '#047857'
        },
        warning: {
            bg: isDark ? '#78350f' : '#fef3c7',
            color: isDark ? '#fbbf24' : '#d97706'
        },
        danger: {
            bg: isDark ? '#7f1d1d' : '#fee2e2',
            color: isDark ? '#ef4444' : '#dc2626'
        },
        info: {
            bg: isDark ? '#1e3a8a' : '#dbeafe',
            color: isDark ? '#60a5fa' : '#1d4ed8'
        }
    };

    const sizes = {
        sm: {
            fontSize: '10px',
            padding: '2px 6px'
        },
        md: {
            fontSize: '11px',
            padding: '3px 8px'
        },
        lg: {
            fontSize: '12px',
            padding: '4px 10px'
        }
    };

    const style = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '600',
        borderRadius: '6px',
        ...variants[variant],
        ...sizes[size]
    };

    return <span style={style}>{children}</span>;
}

export default Badge;
