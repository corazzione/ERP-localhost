import { PlusCircle, MinusCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function IncomeExpense() {
    const { isDark } = useTheme();

    const bgCard = isDark ? '#1e293b' : '#ffffff';
    const textPrimary = isDark ? '#f1f5f9' : '#1f2937';
    const textSecondary = isDark ? '#94a3b8' : '#6b7280';
    const borderColor = isDark ? '#334155' : '#e5e7eb';

    const items = [
        { label: 'Vendas', amount: 22578.00, color: '#06b6d4', type: '+' },
        { label: 'Fornecedores', amount: 55578.00, color: '#3b82f6', type: '-' },
        { label: 'Despesas', amount: 55578.00, color: '#8b5cf6', type: '-' },
        { label: 'Outros', amount: 22578.00, color: '#ec4899', type: '+' }
    ];

    return (
        <div style={{
            backgroundColor: bgCard,
            borderRadius: '12px',
            border: `1px solid ${borderColor}`,
            padding: '1.5rem',
            height: '100%'
        }}>
            <h3 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: textPrimary,
                margin: 0,
                marginBottom: '1.5rem'
            }}>
                Receitas / Despesas
            </h3>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                {items.map((item, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        borderRadius: '8px',
                        backgroundColor: isDark ? '#0f172a' : '#f9fafb'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                backgroundColor: item.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {item.type === '+' ? (
                                    <PlusCircle size={20} color="#ffffff" />
                                ) : (
                                    <MinusCircle size={20} color="#ffffff" />
                                )}
                            </div>
                            <div>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: textPrimary,
                                    marginBottom: '2px'
                                }}>
                                    R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                                <div style={{
                                    fontSize: '12px',
                                    color: textSecondary
                                }}>
                                    {item.label}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default IncomeExpense;
