import { useState, useEffect } from 'react';
import { Search, Bell, Sun, Moon, Calendar, ChevronDown } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTheme } from '../contexts/ThemeContext';
import { useFilters } from '../contexts/FilterContext';
import { useLocation } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';
import CreateStoreModal from './CreateStoreModal';
import ManageStoresModal from './ManageStoresModal';
import StoreDropdown from './StoreDropdown';
import api from '../services/api';

function Header() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCreateStoreModal, setShowCreateStoreModal] = useState(false);
    const [showManageStoresModal, setShowManageStoresModal] = useState(false);
    const [stores, setStores] = useState([]);
    const { isDark, toggleTheme } = useTheme();
    const { store, setStore, period, setPeriod, customDateRange, setCustomDateRange, refreshDashboard } = useFilters();
    const location = useLocation();

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const response = await api.get('/stores');
            const activeStores = response.data;
            setStores(activeStores);

            // Se a loja selecionada não existir mais (foi excluída), voltar para 'all'
            if (store !== 'all' && !activeStores.find(s => s.id === store)) {
                setStore('all');
            }

            refreshDashboard(); // Force dashboard refresh when stores change
        } catch (error) {
            console.error('Erro ao buscar lojas:', error);
        }
    };

    const handleStoreChange = (e) => {
        const value = e.target.value;
        if (value === 'new') {
            setShowCreateStoreModal(true);
        } else {
            setStore(value);
        }
    };

    const handleStoreCreated = (newStore) => {
        fetchStores();
        setStore(newStore.id.toString());
    };

    // Pages that show period filter - including '/' for homepage (dashboard)
    const pagesWithPeriodFilter = ['/', '/dashboard', '/orcamentos', '/painel-geral', '/crediario'];
    const showPeriodFilter = pagesWithPeriodFilter.includes(location.pathname);

    const headerBg = isDark ? '#1e293b' : '#ffffff';
    const borderColor = isDark ? '#334155' : '#e5e7eb';
    const textColor = isDark ? '#f1f5f9' : '#1f2937';
    const textSecondary = isDark ? '#94a3b8' : '#6b7280';
    const inputBg = isDark ? '#0f172a' : '#f9fafb';
    const inputBorder = isDark ? '#334155' : '#e5e7eb';

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        if (newPeriod === 'custom') {
            setShowDatePicker(true);
        } else {
            setCustomDateRange({ start: null, end: null });
        }
    };

    const applyCustomDates = () => {
        setShowDatePicker(false);
    };

    return (
        <>
            {/* Create Store Modal */}
            {showCreateStoreModal && (
                <CreateStoreModal
                    onClose={() => setShowCreateStoreModal(false)}
                    onSuccess={handleStoreCreated}
                />
            )}


            {showManageStoresModal && (
                <ManageStoresModal
                    onClose={() => setShowManageStoresModal(false)}
                    onUpdate={fetchStores}
                />
            )}

            {/* Custom Date Picker Modal */}
            {showDatePicker && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000
                }}>
                    <div style={{
                        backgroundColor: headerBg,
                        borderRadius: '12px',
                        padding: '24px',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                        maxWidth: '600px',
                        width: '90%'
                    }}>
                        <h3 style={{
                            margin: '0 0 20px 0',
                            fontSize: '18px',
                            fontWeight: '600',
                            color: textColor,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <Calendar size={20} />
                            Selecione o Período
                        </h3>

                        <div style={{
                            display: 'flex',
                            gap: '16px',
                            marginBottom: '20px',
                            flexWrap: 'wrap'
                        }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    color: textSecondary
                                }}>
                                    Data Início
                                </label>
                                <DatePicker
                                    selected={customDateRange.start}
                                    onChange={(date) => setCustomDateRange(prev => ({ ...prev, start: date }))}
                                    selectsStart
                                    startDate={customDateRange.start}
                                    endDate={customDateRange.end}
                                    dateFormat="dd/MM/yyyy"
                                    className="date-picker-input"
                                    placeholderText="Selecione..."
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    color: textSecondary
                                }}>
                                    Data Fim
                                </label>
                                <DatePicker
                                    selected={customDateRange.end}
                                    onChange={(date) => setCustomDateRange(prev => ({ ...prev, end: date }))}
                                    selectsEnd
                                    startDate={customDateRange.start}
                                    endDate={customDateRange.end}
                                    minDate={customDateRange.start}
                                    dateFormat="dd/MM/yyyy"
                                    className="date-picker-input"
                                    placeholderText="Selecione..."
                                />
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                onClick={() => {
                                    setShowDatePicker(false);
                                    setPeriod('month');
                                }}
                                style={{
                                    padding: '8px 16px',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    border: `1px solid ${borderColor}`,
                                    borderRadius: '6px',
                                    backgroundColor: 'transparent',
                                    color: textColor,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={applyCustomDates}
                                disabled={!customDateRange.start || !customDateRange.end}
                                style={{
                                    padding: '8px 16px',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    border: 'none',
                                    borderRadius: '6px',
                                    backgroundColor: customDateRange.start && customDateRange.end ? '#8b5cf6' : '#94a3b8',
                                    color: '#ffffff',
                                    cursor: customDateRange.start && customDateRange.end ? 'pointer' : 'not-allowed'
                                }}
                            >
                                Aplicar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header style={{
                height: '70px',
                backgroundColor: headerBg,
                borderBottom: `1px solid ${borderColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 2rem',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease'
            }}>
                {/* Search Bar */}
                <div style={{ flex: 1, maxWidth: '400px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search
                            size={18}
                            style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#9ca3af'
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Buscar produtos, clientes, vendas..."
                            style={{
                                width: '100%',
                                padding: '10px 12px 10px 40px',
                                border: `1px solid ${inputBorder}`,
                                borderRadius: '10px',
                                fontSize: '14px',
                                backgroundColor: inputBg,
                                color: textColor,
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#3b82f6';
                                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = inputBorder;
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                </div>

                {/* Filter Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '1rem' }}>
                    {/* Store Filter - Always visible */}

                    <StoreDropdown
                        stores={stores}
                        selectedStore={store}
                        onChange={setStore}
                        onNewStore={() => setShowCreateStoreModal(true)}
                        onManage={() => setShowManageStoresModal(true)}
                    />

                    {/* Period Filter - Conditional */}
                    {showPeriodFilter && (
                        <div style={{ position: 'relative' }}>
                            <Calendar
                                size={16}
                                style={{
                                    position: 'absolute',
                                    left: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#8b5cf6',
                                    pointerEvents: 'none',
                                    zIndex: 1
                                }}
                            />
                            <select
                                value={period}
                                onChange={(e) => handlePeriodChange(e.target.value)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#8b5cf6';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = borderColor;
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#8b5cf6';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.15)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = borderColor;
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                                style={{
                                    appearance: 'none',
                                    padding: '10px 34px 10px 34px',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    border: `1px solid ${borderColor}`,
                                    borderRadius: '8px',
                                    backgroundColor: headerBg,
                                    color: textColor,
                                    cursor: 'pointer',
                                    outline: 'none',
                                    minWidth: '140px',
                                    transition: 'all 0.2s ease',
                                    boxShadow: isDark ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.05)',
                                    height: '40px'
                                }}
                            >
                                <option value="today">Hoje</option>
                                <option value="week">Semana</option>
                                <option value="month">Mês</option>
                                <option value="year">Ano</option>
                                <option value="custom">Personalizado</option>
                            </select>
                            <ChevronDown
                                size={14}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none',
                                    color: '#8b5cf6'
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Right Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleTheme}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s',
                            color: textColor
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title={isDark ? 'Modo claro' : 'Modo escuro'}
                    >
                        {isDark ? <Sun size={22} /> : <Moon size={22} />}
                    </button>

                    {/* Notifications */}
                    <NotificationDropdown />

                    {/* User Profile */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '6px 12px',
                                borderRadius: '10px',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#f3f4f6'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px'
                            }}>
                                {user.nome?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: textColor }}>
                                    {user.nome || 'Usuário'}
                                </div>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                    Administrador
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </header>
        </>
    );
}

export default Header;
