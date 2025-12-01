import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip
} from 'chart.js';
import { useTheme } from '../contexts/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

function DailyBalanceOverview() {
    const { isDark } = useTheme();

    const bgCard = isDark ? '#1e293b' : '#ffffff';
    const textPrimary = isDark ? '#f1f5f9' : '#1f2937';
    const textSecondary = isDark ? '#94a3b8' : '#6b7280';
    const borderColor = isDark ? '#334155' : '#e5e7eb';

    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
            label: 'Balance',
            data: [20, 25, 30, 35, 45, 90, 45, 50, 55, 60, 70, 80],
            borderColor: '#8b5cf6',
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
                gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
                return gradient;
            },
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: '#8b5cf6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2
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
                mode: 'index',
                intersect: false,
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                titleColor: isDark ? '#f1f5f9' : '#1f2937',
                bodyColor: isDark ? '#cbd5e1' : '#6b7280',
                borderColor: isDark ? '#334155' : '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                    label: (context) => {
                        return `$${context.parsed.y} USD`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false
                },
                ticks: {
                    color: textSecondary,
                    font: {
                        size: 11
                    }
                }
            },
            y: {
                grid: {
                    color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    color: textSecondary,
                    font: {
                        size: 11
                    },
                    callback: (value) => `${value} USD`
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
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
                marginBottom: '1rem'
            }}>
                <div>
                    <h3 style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: textPrimary,
                        margin: 0,
                        marginBottom: '4px'
                    }}>
                        Visão Geral Diária
                    </h3>
                    <p style={{
                        fontSize: '12px',
                        color: textSecondary,
                        margin: 0
                    }}>
                        Informações Gerais
                    </p>
                </div>
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
                    <option>Últimos 14 dias</option>
                    <option>Últimos 30 dias</option>
                    <option>Últimos 3 meses</option>
                </select>
            </div>

            <div style={{ height: '180px' }}>
                <Line data={data} options={options} />
            </div>
        </div>
    );
}

export default DailyBalanceOverview;
