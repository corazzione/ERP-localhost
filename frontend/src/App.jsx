import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { FilterProvider } from './contexts/FilterContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import ClienteDetalhes from './pages/ClienteDetalhes';
import Produtos from './pages/Produtos';
import Vendas from './pages/Vendas';
import Crediario from './pages/Crediario';
import Financeiro from './pages/Financeiro';
import Relatorios from './pages/Relatorios';
import PDV from './pages/PDV';
import NovoOrcamento from './pages/NovoOrcamento';
import Orcamentos from './pages/Orcamentos';
import Pedidos from './pages/Pedidos';
import PedidoDetalhes from './pages/PedidoDetalhes';
import PedidosCompra from './pages/PedidosCompra';
import Estoque from './pages/Estoque';
import Fornecedores from './pages/Fornecedores';
import CrediarioDashboard from './pages/CrediarioDashboard';
import FinanceiroDashboard from './pages/FinanceiroDashboard';
import RelatoriosEnhanced from './pages/RelatoriosEnhanced';
import ConfiguracoesPix from './pages/ConfiguracoesPix';

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
        <ThemeProvider>
            <FilterProvider>
                <ToastProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/login" element={
                                isAuthenticated ? <Navigate to="/" /> : <Login setAuth={setIsAuthenticated} />
                            } />

                            {/* Rota do PDV fora do Layout principal para ser tela cheia */}
                            <Route path="/pdv" element={
                                isAuthenticated ? <PDV /> : <Navigate to="/login" />
                            } />

                            <Route path="/" element={
                                isAuthenticated ? <Layout setAuth={setIsAuthenticated} /> : <Navigate to="/login" />
                            }>
                                <Route index element={<Dashboard />} />
                                <Route path="clientes" element={<Clientes />} />
                                <Route path="clientes/:id" element={<ClienteDetalhes />} />
                                <Route path="produtos" element={<Produtos />} />
                                <Route path="vendas" element={<Vendas />} />
                                <Route path="crediario" element={<Crediario />} />
                                <Route path="crediario/dashboard" element={<CrediarioDashboard />} />
                                <Route path="financeiro" element={<FinanceiroDashboard />} />
                                <Route path="financeiro/contas-receber" element={<Financeiro />} />
                                <Route path="relatorios" element={<RelatoriosEnhanced />} />
                                <Route path="novo-orcamento" element={<NovoOrcamento />} />
                                <Route path="orcamentos" element={<Orcamentos />} />
                                <Route path="pedidos" element={<Pedidos />} />
                                <Route path="pedidos/:id" element={<PedidoDetalhes />} />
                                <Route path="pedidos-compra" element={<PedidosCompra />} />
                                <Route path="estoque" element={<Estoque />} />
                                <Route path="fornecedores" element={<Fornecedores />} />
                                <Route path="configuracoes/pix" element={<ConfiguracoesPix />} />
                            </Route>
                        </Routes>
                    </BrowserRouter>
                </ToastProvider>
            </FilterProvider>
        </ThemeProvider>
    );
}

export default App;
