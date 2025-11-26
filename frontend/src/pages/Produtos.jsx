import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

function Produtos() {
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        codigo: '',
        nome: '',
        descricao: '',
        categoria: '',
        unidade: 'UN',
        precoVenda: '',
        precoCusto: '',
        estoqueAtual: '',
        estoqueMinimo: ''
    });
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        carregarProdutos();
    }, []);

    const carregarProdutos = async () => {
        try {
            const response = await api.get('/produtos');
            setProdutos(response.data);
        } catch (error) {
            console.error('Erro:', error);
            showToast('Erro ao carregar produtos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                codigo: product.codigo,
                nome: product.nome,
                descricao: product.descricao || '',
                categoria: product.categoria || '',
                unidade: product.unidade,
                precoVenda: product.precoVenda,
                precoCusto: product.precoCusto,
                estoqueAtual: product.estoqueAtual,
                estoqueMinimo: product.estoqueMinimo
            });
        } else {
            setEditingProduct(null);
            setFormData({
                codigo: '',
                nome: '',
                descricao: '',
                categoria: '',
                unidade: 'UN',
                precoVenda: '',
                precoCusto: '',
                estoqueAtual: '0',
                estoqueMinimo: '0'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const data = {
                ...formData,
                precoVenda: parseFloat(formData.precoVenda),
                precoCusto: parseFloat(formData.precoCusto) || 0,
                estoqueAtual: parseInt(formData.estoqueAtual) || 0,
                estoqueMinimo: parseInt(formData.estoqueMinimo) || 0
            };

            if (editingProduct) {
                await api.put(`/produtos/${editingProduct.id}`, data);
                showToast('Produto atualizado com sucesso!', 'success');
            } else {
                await api.post('/produtos', data);
                showToast('Produto criado com sucesso!', 'success');
            }

            handleCloseModal();
            carregarProdutos();
        } catch (error) {
            console.error('Erro:', error);
            const message = error.response?.data?.error || 'Erro ao salvar produto';
            showToast(message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleAtivo = async (produto) => {
        try {
            await api.put(`/produtos/${produto.id}`, {
                ativo: !produto.ativo
            });
            showToast(
                produto.ativo ? 'Produto inativado' : 'Produto ativado',
                'success'
            );
            carregarProdutos();
        } catch (error) {
            console.error('Erro ao ativar/inativar:', error);
            showToast('Erro ao atualizar produto', 'error');
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Produtos</h1>
                    <p style={{ color: 'var(--color-neutral-500)' }}>Gerencie seu catálogo de produtos</p>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    + Novo Produto
                </button>
            </div>

            <div className="card">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <LoadingSpinner size="large" />
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nome</th>
                                <th>Categoria</th>
                                <th>Preço Venda</th>
                                <th>Estoque</th>
                                <th>Status</th>
                                <th style={{ width: '120px', textAlign: 'center' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {produtos.map((produto) => (
                                <tr key={produto.id}>
                                    <td>{produto.codigo}</td>
                                    <td className="font-semibold">{produto.nome}</td>
                                    <td>{produto.categoria || '-'}</td>
                                    <td>R$ {parseFloat(produto.precoVenda).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    <td>
                                        <span className={produto.estoqueAtual <= produto.estoqueMinimo ? 'badge badge-warning' : ''}>
                                            {produto.estoqueAtual} {produto.unidade}
                                        </span>
                                    </ td>
                                    <td>
                                        <span className={produto.ativo ? 'badge badge-positive' : 'badge badge-neutral'}>
                                            {produto.ativo ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            <button
                                                className="btn btn-sm btn-ghost"
                                                onClick={() => handleOpenModal(produto)}
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn btn-sm btn-ghost"
                                                onClick={() => handleToggleAtivo(produto)}
                                                title={produto.ativo ? 'Inativar' : 'Ativar'}
                                            >
                                                {produto.ativo ? '🚫' : '✅'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {produtos.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                                        Nenhum produto cadastrado
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
                size="large"
            >
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="label">Código <span className="required">*</span></label>
                            <input
                                type="text"
                                name="codigo"
                                className="input"
                                value={formData.codigo}
                                onChange={handleInputChange}
                                required
                                disabled={!!editingProduct}
                            />
                        </div>

                        <div className="form-group">
                            <label className="label">Unidade</label>
                            <select
                                name="unidade"
                                className="select"
                                value={formData.unidade}
                                onChange={handleInputChange}
                            >
                                <option value="UN">Unidade (UN)</option>
                                <option value="KG">Quilograma (KG)</option>
                                <option value="LT">Litro (LT)</option>
                                <option value="MT">Metro (MT)</option>
                                <option value="CX">Caixa (CX)</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Nome <span className="required">*</span></label>
                        <input
                            type="text"
                            name="nome"
                            className="input"
                            value={formData.nome}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Descrição</label>
                        <textarea
                            name="descricao"
                            className="textarea"
                            value={formData.descricao}
                            onChange={handleInputChange}
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Categoria</label>
                        <input
                            type="text"
                            name="categoria"
                            className="input"
                            value={formData.categoria}
                            onChange={handleInputChange}
                            placeholder="Ex: Eletr\u00f4nicos, Roupas, Alimentos..."
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="label">Preço de Custo</label>
                            <input
                                type="number"
                                name="precoCusto"
                                className="input"
                                value={formData.precoCusto}
                                onChange={handleInputChange}
                                step="0.01"
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label className="label">Preço de Venda <span className="required">*</span></label>
                            <input
                                type="number"
                                name="precoVenda"
                                className="input"
                                value={formData.precoVenda}
                                onChange={handleInputChange}
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="label">Estoque Atual</label>
                            <input
                                type="number"
                                name="estoqueAtual"
                                className="input"
                                value={formData.estoqueAtual}
                                onChange={handleInputChange}
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label className="label">Estoque Mínimo</label>
                            <input
                                type="number"
                                name="estoqueMinimo"
                                className="input"
                                value={formData.estoqueMinimo}
                                onChange={handleInputChange}
                                min="0"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={handleCloseModal}
                            disabled={saving}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <LoadingSpinner size="small" color="white" />
                                    Salvando...
                                </>
                            ) : (
                                editingProduct ? 'Atualizar' : 'Criar Produto'
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default Produtos;
