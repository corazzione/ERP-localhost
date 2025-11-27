import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function SidebarGroup({ title, children, defaultExpanded = true }) {
    const { isDark } = useTheme();
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const textColor = isDark ? '#94a3b8' : '#9ca3af';

    useEffect(() => {
        const saved = localStorage.getItem(`sidebar-group-${title}`);
        if (saved !== null) {
            setIsExpanded(JSON.parse(saved));
        }
    }, [title]);

    const toggleExpand = () => {
        const newState = !isExpanded;
        setIsExpanded(newState);
        localStorage.setItem(`sidebar-group-${title}`, JSON.stringify(newState));
    };

    return (
        <div style={{ marginBottom: '1.25rem' }}>
            <button
                onClick={toggleExpand}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 1.25rem',
                    marginBottom: '0.5rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    color: textColor
                }}
            >
                <span style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em'
                }}>
                    {title}
                </span>
                <ChevronDown
                    size={14}
                    strokeWidth={2}
                    style={{
                        transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: 'transform 0.2s'
                    }}
                />
            </button>

            <div style={{
                maxHeight: isExpanded ? '1000px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease'
            }}>
                {children}
            </div>
        </div>
    );
}

export default SidebarGroup;
