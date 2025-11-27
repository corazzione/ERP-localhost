import { useState, useEffect } from 'react';
import { Factory, Plus, Search, Phone, Mail, MapPin } from 'lucide-react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

function Fornecedores() {
    const { showToast } = useToast();
    const [fornecedores, setFornecedores] = useState([]);
    const [filteredFornecedores, setFilteredFornecedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingFornecedor, setEditingFornecedor] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        nome: '',
        cnpj: '',
        telefone: '',
        email: '',
        endereco: '',
        cidade: '',
        estado: '',
        contato: ''
    });

    useEffect(() => {
        carregarFornecedores();
    }, []);

    useEffect(() => {
        const filtered = fornecedores.filter(fornecedor =>
            fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (fornecedor.cnpj && fornecedor.cnpj.includes(searchTerm))
        );
        setFilteredFornecedores(filtered);
    }, [searchTerm, fornecedores]);

    const carregarFornecedores = async () => {
        try {
            setLoading(true);
            const response = await api.get('/fornecedores');
            const data = response.data.data || response.data;
            setFornecedores(data);
            setFilteredFornecedores(data);
        } catch (error) {
            console.error('Erro ao carregar fornecedores:', error);
            showToast('Erro ao carregar fornecedores', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleNew = () => {
        setEditingFornecedor(null);
        setFormData({
            nome: '',
            cnpj: '',
            telefone: '',
            email: '',
            endereco: '',
            cidade: '',
            estado: '',
            contato: ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingFornecedor) {
                await api.put(`/fornecedores/${editingFornecedor.id}`, formData);
                showToast('Fornecedor atualizado com sucesso!', 'success');
            } else {
                await api.post('/fornecedores', formData);
                showToast('Fornecedor criado com sucesso!', 'success');
            }
            setShowModal(false);
            carregarFornecedores();
        } catch (error) {
            console.error('Erro ao salvar fornecedor:', error);
            showToast(error.response?.data?.error || 'Erro ao salvar fornecedor', 'error');
        }
    };

    const columns = [
        {
            key: 'nome',
            label: 'Nome',
            sortable: true,
            render: (value) => (
                <div style={{ fontWeight: '600' }}>{value}</div>
            )
        },
        {
            key: 'cnpj',
            label: 'CNPJ',
            sortable: true
        },
        {
            key: 'contato',
            label: 'Contato',
            sortable: false
        },
        {
            key: 'telefone',
            label: 'Telefone',
            sortable: false,
            render: (value) => value || '-'
        },
        {
            key: 'cidade',
            label: 'Cidade',
            sortable: true,
            render: (value, row) => value && row.estado ? `${value}/${row.estado}` : value || '-'
        }
    ];

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Factory size={32} color="#3b82f6" />
                    <div>
                        <h1 className="page-title">Fornecedores</h1>
                        <p className="page-subtitle">Gerencie seus fornecedores</p>
                    </div>
                </div>
                <button onClick={handleNew} className="btn btn-primary">
                    <Plus size={20} />
                    Novo Fornecedor
                </button>
            </div>

            {/* Search Bar */}
            <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', position: 'relative' }}>
                <Search
                    size={20}
                    style={{
                        position: 'absolute',
                        left: '1.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#6b7280',
                        pointerEvents: 'none'
                    }}
                />
                <input
                    type="text"
                    className="input"
                    placeholder="Buscar por nome ou CNPJ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '3rem', width: '100%' }}
                />
            </div>

            {/* Data Table */}
            <div className="card">
                <DataTable
                    columns={columns}
                    data={filteredFornecedores}
                    emptyMessage="Nenhum fornecedor encontrado"
                />
            </div>

            {/* Modal */}
            {showModal && (
                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                >
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label className="label">Nome / Razão Social *</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">CNPJ</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.cnpj}
                                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Pessoa de Contato</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.contato}
                                    onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Telefone</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.telefone}
                                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">E-mail</label>
                                <input
                                    type="email"
                                    className="input"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="form-group full-width">
                                <label className="label">Endereço</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.endereco}
                                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Cidade</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.cidade}
                                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Estado</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.estado}
                                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                    maxLength={2}
                                />
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {editingFornecedor ? 'Atualizar' : 'Criar'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

export default Fornecedores;
