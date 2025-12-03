import { useTheme } from '../../contexts/ThemeContext';

/**
 * 🪷 PaymentMethodButton - Botão de método de pagamento premium
 * Com estados ativo/inativo e cores customizadas
 */
function PaymentMethodButton({
    id,
    label,
    icon: Icon,
    color,
    isActive,
    onClick
}) {
    const { isDark } = useTheme();

    const borderColor = isDark ? '#334155' : '#e5e7eb';
    const textInactive = isDark ? '#94a3b8' : '#6b7280';

    // Gerar cor pastél para fundo ativo
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    const rgb = hexToRgb(color);
    const bgActive = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)` : `${color}20`;

    return (
        <button
            onClick={onClick}
            style={{
                padding: '16px',
                border: `2px solid ${isActive ? color : borderColor}`,
                borderRadius: '10px',
                background: isActive ? bgActive : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                minWidth: '90px'
            }}
            data-testid={`payment-method-${id}`}
            onMouseEnter={(e) => {
                if (!isActive) {
                    e.currentTarget.style.borderColor = color;
                    e.currentTarget.style.backgroundColor = `${color}08`;
                }
            }}
            onMouseLeave={(e) => {
                if (!isActive) {
                    e.currentTarget.style.borderColor = borderColor;
                    e.currentTarget.style.backgroundColor = 'transparent';
                }
            }}
        >
            <Icon
                size={28}
                color={isActive ? color : textInactive}
                style={{ transition: 'color 200ms' }}
            />
            <span style={{
                fontSize: '13px',
                fontWeight: '600',
                color: isActive ? color : textInactive,
                textAlign: 'center',
                transition: 'color 200ms'
            }}>
                {label}
            </span>
        </button>
    );
}

export default PaymentMethodButton;
