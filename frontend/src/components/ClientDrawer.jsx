import { useState } from 'react';
import { User, ShoppingBag, CreditCard, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Drawer from './Drawer';
import Tabs from './Tabs';
import Badge from './Badge';

function ClientDrawer({ isOpen, onClose, client }) {
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const textPrimary = isDark ? '#f1f5f9' : '#1f2937';
    const textSecondary = isDark ? '#cbd5e1' : '#6b7280';
    const borderColor = isDark ? '#334155' : '#e5e7eb';

    if (!client) return null;

    // Mock data (will be replaced with API calls)
    const purchases = [
        { id: 1, date: '20/11/2024', total: 450.00, status: 'concluida' },
        { id: 2, date: '15/11/2024', total: 1200.00, status: 'concluida' },
        { id: 3, date: '10/11/2024', total: 850.00, status: 'concluida' }
    ];

    const installments = [
        { id: 1, numero: '3/12', valor: 150.00, vencimento: '01/12/2024', status: 'aberta', diasAtraso: 0 },
        { id: 2, numero: '4/12', valor: 150.00, vencimento: '01/01/2025', status: 'aberta', diasAtraso: 0 }
    ];

    const handleStartSale = () => {
        navigate('/pdv', { state: { selectedClient: client } });
        onClose();
    };

    const tabs = [
        {
            label: 'Dados',
            icon: User,
            content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: textSecondary, marginBottom: '4px' }}>Nome</div>
                        <div style={{ fontSize: '14px', color: textPrimary }}>{client.nome}</div>
                    </div>
                    {client.cpf && (
                        <div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: textSecondary, marginBottom: '4px' }}>CPF</div>
                            <div style={{ fontSize: '14px', color: textPrimary }}>{client.cpf}</div>
                        </div>
                    )}
                    {client.telefone && (
                        <div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: textSecondary, marginBottom: '4px' }}>Telefone</div>
                            <div style={{ fontSize: '14px', color: textPrimary }}>{client.telefone}</div>
                        </div>
                    )}
                    {client.email && (
                        <div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: textSecondary, marginBottom: '4px' }}>E-mail</div>
                            <div style={{ fontSize: '14px', color: textPrimary }}>{client.email}</div>
                        </div>
                    )}
                </div>
            )
        },
        {
            label: 'Compras',
            icon: ShoppingBag,
            badge: purchases.length,
            content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {purchases.map((purchase) => (
                        <div
                            key={purchase.id}
                            style={{
                                padding: '0.75rem',
                                border: `1px solid ${borderColor}`,
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: textPrimary }}>
                                    Venda #{purchase.id}
                                </div>
                                <div style={{ fontSize: '12px', color: textSecondary }}>
                                    {purchase.date}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: textPrimary }}>
                                    R$ {purchase.total.toFixed(2)}
                                </div>
                                <Badge variant="success" size="sm">Paga</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            )
        },
        {
            label: 'Crediário',
            icon: CreditCard,
            badge: installments.length,
            content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{
                        padding: '1rem',
                        backgroundColor: isDark ? '#0f172a' : '#f9fafb',
                        borderRadius: '8px',
                        marginBottom: '0.5rem'
                    }}>
                        <div style={{ fontSize: '12px', color: textSecondary, marginBottom: '4px' }}>
                            Total em aberto
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>
                            R$ {installments.reduce((sum, i) => sum + i.valor, 0).toFixed(2)}
                        </div>
                    </div>

                    {installments.map((inst) => (
                        <div
                            key={inst.id}
                            style={{
                                padding: '0.75rem',
                                border: `1px solid ${borderColor}`,
                                borderRadius: '8px'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: textPrimary }}>
                                    Parcela {inst.numero}
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: textPrimary }}>
                                    R$ {inst.valor.toFixed(2)}
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '12px', color: textSecondary }}>
                                    Venc: {inst.vencimento}
                                </div>
                                <Badge variant="warning" size="sm">Aberta</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            )
        }
    ];

    return (
        <Drawer isOpen={isOpen} onClose={onClose} title={client.nome} width="450px">
            <div style={{ marginBottom: '1.5rem' }}>
                <button
                    onClick={handleStartSale}
                    className="btn btn-primary"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                    <ShoppingBag size={18} />
                    Iniciar Venda com Cliente
                </button>
            </div>

            <Tabs tabs={tabs} />
        </Drawer>
    );
}

export default ClientDrawer;
