import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTheme } from '../contexts/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

function BalanceStatistic() {
    const { isDark } = useTheme();

    const bgCard = isDark ? '#1e293b' : '#ffffff';
    const textPrimary = isDark ? '#f1f5f9' : '#1f2937';
    const textSecondary = isDark ? '#94a3b8' : '#6b7280';
    const borderColor = isDark ? '#334155' : '#e5e7eb';

    const data = {
        labels: ['Entradas', 'Saídas', 'Pendente'],
        datasets: [{
            data: [45, 30, 25],
            backgroundColor: [
                '#8b5cf6', // Roxo
                '#06b6d4', // Cyan
                '#a855f7'  // Roxo claro
            ],
            borderWidth: 0,
            cutout: '75%'
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                titleColor: isDark ? '#f1f5f9' : '#1f2937',
                bodyColor: isDark ? '#cbd5e1' : '#6b7280',
                borderColor: isDark ? '#334155' : '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        return `${label}: ${value}%`;
                    }
                }
            }
        }
    };

    return (
        <div style={{
            backgroundColor: bgCard,
            borderRadius: '12px',
            border: `1px solid ${borderColor}`,
            padding: '1.5rem',
            height: '100%'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
            }}>
                <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: textPrimary,
                    margin: 0
                }}>
                    Estatísticas de Balanço
                </h3>
                <select style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: `1px solid ${borderColor}`,
                    backgroundColor: isDark ? '#0f172a' : '#f9fafb',
                    color: textSecondary,
                    outline: 'none',
                    cursor: 'pointer'
                }}>
                    <option>BRL</option>
                    <option>USD</option>
                </select>
            </div>

            <div style={{
                height: '180px',
                position: 'relative',
                marginBottom: '1.5rem'
            }}>
                <Doughnut data={data} options={options} />
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: textPrimary
                    }}>
                        R$ 1.872
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: textSecondary
                    }}>
                        Gasto Total
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                {data.labels.map((label, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: data.datasets[0].backgroundColor[index]
                            }} />
                            <span style={{ fontSize: '13px', color: textSecondary }}>{label}</span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: textPrimary }}>
                            {data.datasets[0].data[index]}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BalanceStatistic;
