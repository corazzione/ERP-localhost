import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Produtos from './pages/Produtos';
import Vendas from './pages/Vendas';
import Crediario from './pages/Crediario';
import Financeiro from './pages/Financeiro';
import Relatorios from './pages/Relatorios';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
        setLoading(false);
    }, []);

    if (loading) {
        return <div>Carregando...</div>;
    }

    return (
        <ToastProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={
                        isAuthenticated ? <Navigate to="/" /> : <Login setAuth={setIsAuthenticated} />
                    } />

                    <Route path="/" element={
                        isAuthenticated ? <Layout setAuth={setIsAuthenticated} /> : <Navigate to="/login" />
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="clientes" element={<Clientes />} />
                        <Route path="produtos" element={<Produtos />} />
                        <Route path="vendas" element={<Vendas />} />
                        <Route path="crediario" element={<Crediario />} />
                        <Route path="financeiro" element={<Financeiro />} />
                        <Route path="relatorios" element={<Relatorios />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ToastProvider>
    );
}

export default App;
