import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

function Tabs({ tabs, defaultTab = 0, onChange }) {
    const { isDark } = useTheme();
    const [activeTab, setActiveTab] = useState(defaultTab);

    const borderColor = isDark ? '#334155' : '#e5e7eb';
    const activeColor = '#3b82f6';
    const textColor = isDark ? '#cbd5e1' : '#6b7280';
    const textActive = isDark ? '#f1f5f9' : '#1f2937';

    const handleTabClick = (index) => {
        setActiveTab(index);
        if (onChange) {
            onChange(index);
        }
    };

    return (
        <div>
            {/* Tab Headers */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                borderBottom: `2px solid ${borderColor}`,
                marginBottom: '1.5rem'
            }}>
                {tabs.map((tab, index) => {
                    const isActive = activeTab === index;

                    return (
                        <button
                            key={index}
                            onClick={() => handleTabClick(index)}
                            style={{
                                padding: '0.75rem 1.25rem',
                                backgroundColor: 'transparent',
                                border: 'none',
                                borderBottom: `2px solid ${isActive ? activeColor : 'transparent'}`,
                                marginBottom: '-2px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: isActive ? '600' : '500',
                                color: isActive ? textActive : textColor,
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.color = textActive;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.color = textColor;
                                }
                            }}
                        >
                            {tab.icon && <tab.icon size={16} />}
                            <span>{tab.label}</span>
                            {tab.badge && (
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    padding: '2px 6px',
                                    borderRadius: '10px',
                                    backgroundColor: isActive ? activeColor : (isDark ? '#374151' : '#e5e7eb'),
                                    color: isActive ? '#ffffff' : textColor
                                }}>
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div>
                {tabs[activeTab]?.content}
            </div>
        </div>
    );
}

export default Tabs;
