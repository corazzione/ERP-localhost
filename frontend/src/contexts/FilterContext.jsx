import { createContext, useContext, useState } from 'react';

const FilterContext = createContext();

export function FilterProvider({ children }) {
    const [store, setStore] = useState('all');
    const [period, setPeriod] = useState('month');
    const [customDateRange, setCustomDateRange] = useState({ start: null, end: null });
    const [lastUpdated, setLastUpdated] = useState(Date.now());

    const value = {
        store,
        setStore,
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
