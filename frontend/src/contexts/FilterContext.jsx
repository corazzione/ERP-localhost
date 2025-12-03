import { createContext, useContext, useState, useEffect } from 'react';

const FilterContext = createContext();

export function FilterProvider({ children }) {
    const [store, setStore] = useState(() => {
        return localStorage.getItem('selectedStore') || 'all';
    });
    const [stores, setStores] = useState([]);
    const [period, setPeriod] = useState('month');
    const [customDateRange, setCustomDateRange] = useState({ start: null, end: null });
    const [lastUpdated, setLastUpdated] = useState(Date.now());

    // Persist store selection
    useEffect(() => {
        localStorage.setItem('selectedStore', store);
    }, [store]);

    // Fetch stores on mount
    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('http://localhost:3000/api/stores', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setStores(data);

                // Validate selected store
                if (store !== 'all' && !data.find(s => s.id === store)) {
                    setStore('all');
                }
            }
        } catch (error) {
            console.error('Erro ao buscar lojas:', error);
        }
    };

    const value = {
        store,
        setStore,
        stores,
        fetchStores,
        period,
        setPeriod,
        customDateRange,
        setCustomDateRange,
        lastUpdated,
        refreshDashboard: () => setLastUpdated(Date.now())
    };

    return (
        <FilterContext.Provider value={value}>
            {children}
        </FilterContext.Provider>
    );
}

export function useFilters() {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error('useFilters must be used within FilterProvider');
    }
    return context;
}
