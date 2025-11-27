import { useEffect, useRef } from 'react';
import { Scan } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { playSound } from '../utils/sounds';

function BarcodeInput({ onScan, autoFocus = true }) {
    const { isDark } = useTheme();
    const inputRef = useRef(null);
    const scanBufferRef = useRef('');
    const scanTimerRef = useRef(null);

    const borderColor = isDark ? '#334155' : '#e5e7eb';
    const textPrimary = isDark ? '#f1f5f9' : '#1f2937';
    const accentColor = '#8b5cf6';

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }

        // Keep focus on input ONLY if no modal is open and no other input is focused
        const handleFocus = () => {
            // Don't steal focus if there's a modal open or another input is focused
            const hasModal = document.querySelector('[style*="z-index: 1000"]') ||
                document.querySelector('[role="dialog"]');
            const activeElement = document.activeElement;
            const isInputFocused = activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'SELECT' ||
                activeElement.tagName === 'TEXTAREA'
            );

            // Only refocus if no modal and no other input is focused
            if (!hasModal && !isInputFocused && document.activeElement !== inputRef.current) {
                inputRef.current?.focus();
            }
        };

        const interval = setInterval(handleFocus, 500); // Reduced frequency from 100ms

        return () => clearInterval(interval);
    }, [autoFocus]);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const barcode = scanBufferRef.current.trim();

            if (barcode) {
                playSound('beep');
                if (onScan) {
                    onScan(barcode);
                }
                scanBufferRef.current = '';
                e.target.value = '';
            }
        } else {
            // Add to buffer
            scanBufferRef.current += e.key;

            // Clear buffer after 100ms of no input (typical scanner behavior)
            clearTimeout(scanTimerRef.current);
            scanTimerRef.current = setTimeout(() => {
                scanBufferRef.current = '';
            }, 100);
        }
    };

    return (
        <div style={{
            position: 'relative',
            width: '100%'
        }}>
            <Scan
                size={20}
                style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: accentColor,
                    pointerEvents: 'none',
                    animation: 'pulse 2s ease-in-out infinite'
                }}
            />
            <input
                ref={inputRef}
                type="text"
                className="input"
                placeholder="Aguardando leitura do código de barras..."
                onKeyPress={handleKeyPress}
                style={{
                    fontSize: '1rem',
                    padding: '0.75rem 0.75rem 0.75rem 3rem',
                    width: '100%',
                    border: `2px solid ${accentColor}`,
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    color: textPrimary
                }}
            />

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}

export default BarcodeInput;
