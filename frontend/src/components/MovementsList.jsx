import { Eye, Printer, Copy } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Tabs from './Tabs';
import Badge from './Badge';

function MovementsList({ sales, budgets, purchases }) {
    const { isDark } = useTheme();

    const bgColor = isDark ? '#1e293b' : '#ffffff';
    const borderColor = isDark ? '#334155' : '#e5e7eb';
    const textPrimary = isDark ? '#f1f5f9' : '#1f2937';
    const textSecondary = isDark ? '#cbd5e1' : '#6b7280';
    const hoverBg = isDark ? '#334155' : '#f9fafb';

    const defaultSales = sales || [
        { id: '#001', date: '27/11/2024 14:30', client: 'João Silva', total: 'R$ 450,00', payment: 'PIX', status: 'concluida' },
        { id: '#002', date: '27/11/2024 13:15', client: 'Maria Santos', total: 'R$ 1.200,00', payment: 'Crédito 3x', status: 'concluida' },
        { id: '#003', date: '27/11/2024 11:45', client: 'Pedro Costa', total: 'R$ 850,00', payment: 'Débito', status: 'concluida' }
    ];

    const getStatusBadge = (status) => {
        const variants = {
            concluida: 'success',
            pendente: 'warning',
            cancelada: 'danger'
        };
        const labels = {
            concluida: 'Concluída',
            pendente: 'Pendente',
            cancelada: 'Cancelada'
        };
        return <Badge variant={variants[status]} size="sm">{labels[status]}</Badge>;
    };

    const renderTable = (data) => (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: `2px solid ${borderColor}` }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: textSecondary, textTransform: 'uppercase' }}>Número</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: textSecondary, textTransform: 'uppercase' }}>Data/Hora</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: textSecondary, textTransform: 'uppercase' }}>Cliente</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: textSecondary, textTransform: 'uppercase' }}>Total</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: textSecondary, textTransform: 'uppercase' }}>Pagamento</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: textSecondary, textTransform: 'uppercase' }}>Status</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: textSecondary, textTransform: 'uppercase' }}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr
                            key={index}
                            style={{
                                borderBottom: `1px solid ${borderColor}`,
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = hoverBg;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: textPrimary }}>{item.id}</td>
                            <td style={{ padding: '12px', fontSize: '14px', color: textSecondary }}>{item.date}</td>
                            <td style={{ padding: '12px', fontSize: '14px', color: textPrimary }}>{item.client}</td>
                            <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: textPrimary, textAlign: 'right' }}>{item.total}</td>
                            <td style={{ padding: '12px', fontSize: '14px', color: textSecondary }}>{item.payment}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>{getStatusBadge(item.status)}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                    <button
                                        className="btn btn-outline"
                                        style={{ padding: '6px', minWidth: 'auto' }}
                                        title="Ver detalhes"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        className="btn btn-outline"
                                        style={{ padding: '6px', minWidth: 'auto' }}
                                        title="Imprimir"
                                    >
                                        <Printer size={16} />
                                    </button>
                                    <button
                                        className="btn btn-outline"
                                        style={{ padding: '6px', minWidth: 'auto' }}
                                        title="Duplicar"
                                    >
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const tabs = [
        {
            label: 'Vendas',
            badge: defaultSales.length,
            content: renderTable(defaultSales)
        },
        {
            label: 'Orçamentos',
            badge: 0,
            content: <div style={{ padding: '2rem', textAlign: 'center', color: textSecondary }}>Nenhum orçamento recente</div>
        },
        {
            label: 'Compras',
            badge: 0,
            content: <div style={{ padding: '2rem', textAlign: 'center', color: textSecondary }}>Nenhuma compra recente</div>
        }
    ];

    return (
        <div style={{
            backgroundColor: bgColor,
            border: `1px solid ${borderColor}`,
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
            <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: textPrimary,
                margin: '0 0 1.5rem 0'
            }}>
                Movimentações Recentes
            </h3>
            <Tabs tabs={tabs} />
        </div>
    );
}

export default MovementsList;
