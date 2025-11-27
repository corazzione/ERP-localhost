import { AlertCircle, Package, Clock, DollarSign } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Badge from './Badge';

function AlertsCard({ alerts }) {
    const { isDark } = useTheme();

    const bgColor = isDark ? '#1e293b' : '#ffffff';
    const borderColor = isDark ? '#334155' : '#e5e7eb';
    const textPrimary = isDark ? '#f1f5f9' : '#1f2937';
    const textSecondary = isDark ? '#cbd5e1' : '#6b7280';
    const hoverBg = isDark ? '#334155' : '#f9fafb';

    const defaultAlerts = alerts || [
        { type: 'stock', label: 'Estoque baixo', count: 12, icon: Package, color: '#f59e0b' },
        { type: 'overdue', label: 'Parcelas atrasadas', count: 5, icon: AlertCircle, color: '#ef4444' },
        { type: 'payToday', label: 'Contas a pagar hoje', count: 3, icon: DollarSign, color: '#3b82f6' },
        { type: 'receiveToday', label: 'Contas a receber hoje', count: 8, icon: Clock, color: '#10b981' }
    ];

    return (
        <div style={{
            backgroundColor: bgColor,
            border: `1px solid ${borderColor}`,
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <AlertCircle size={20} color="#ef4444" />
                <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: textPrimary,
                    margin: 0
                }}>
                    Atenção Necessária
                </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {defaultAlerts.map((alert, index) => {
                    const Icon = alert.icon;
                    return (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = hoverBg;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    backgroundColor: `${alert.color}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon size={18} color={alert.color} />
                                </div>
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: textPrimary
                                }}>
                                    {alert.label}
                                </span>
                            </div>
                            <Badge variant="danger" size="sm">
                                {alert.count}
                            </Badge>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default AlertsCard;
