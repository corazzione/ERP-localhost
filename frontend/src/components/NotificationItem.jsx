import { Bell, Info, AlertTriangle, Bug, CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function NotificationItem({ notification, onRead }) {
    const { isDark } = useTheme();

    const getIcon = () => {
        switch (notification.type) {
            case 'update':
                return <CheckCircle size={16} color="#22c55e" />;
            case 'bug':
                return <Bug size={16} color="#ef4444" />;
            case 'alert':
                return <AlertTriangle size={16} color="#f59e0b" />;
            default:
                return <Info size={16} color="#3b82f6" />;
        }
    };

    const getBgColor = () => {
        if (notification.isRead) return 'transparent';
        return isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        // Menos de 24h
        if (diff < 86400000) {
            return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    return (
        <div
            onClick={() => !notification.isRead && onRead(notification.id)}
            style={{
                padding: '12px 16px',
                background: getBgColor(),
                borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                cursor: notification.isRead ? 'default' : 'pointer',
                transition: 'background 0.2s ease',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
            }}
            onMouseEnter={(e) => {
                if (!notification.isRead) {
                    e.currentTarget.style.background = isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)';
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = getBgColor();
            }}
        >
            <div style={{ marginTop: '2px' }}>
                {getIcon()}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '4px'
                }}>
                    <span style={{
                        fontSize: '13px',
                        fontWeight: notification.isRead ? '500' : '600',
                        color: isDark ? '#f1f5f9' : '#0f172a'
                    }}>
                        {notification.title}
                    </span>
                    <span style={{
                        fontSize: '11px',
                        color: isDark ? '#94a3b8' : '#64748b'
                    }}>
                        {formatDate(notification.createdAt)}
                    </span>
                </div>
                <p style={{
                    margin: 0,
                    fontSize: '12px',
                    color: isDark ? '#cbd5e1' : '#475569',
                    lineHeight: '1.4'
                }}>
                    {notification.message}
                </p>
            </div>
            {!notification.isRead && (
                <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#3b82f6',
                    marginTop: '6px'
                }} />
            )}
        </div>
    );
}

export default NotificationItem;
