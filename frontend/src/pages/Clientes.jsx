import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Search, MapPin, Loader2 } from 'lucide-react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import ClientDrawer from '../components/ClientDrawer';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

function Clientes() {
    const { showToast } = useToast();
    const [clientes, setClientes] = useState([]);
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCliente, setEditingCliente] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [showDrawer, setShowDrawer] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingCep, setLoadingCep] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        cpfCnpj: '',
        telefone: '',
        email: '',
        cep: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: ''
    });

    useEffect(() => {
        carregarClientes();
    }, []);

    useEffect(() => {
        const filtered = clientes.filter(cliente =>
            cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (cliente.cpfCnpj && cliente.cpfCnpj.includes(searchTerm)) ||
            (cliente.telefone && cliente.telefone.includes(searchTerm))
        );
        setFilteredClientes(filtered);
    }, [searchTerm, clientes]);

    const carregarClientes = async () => {
        try {
            setLoading(true);
            const response = await api.get('/clientes');
            const data = response.data.data || response.data;
            setClientes(data);
            setFilteredClientes(data);
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            showToast('Erro ao carregar clientes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (cliente) => {
        setSelectedClient(cliente);
        setShowDrawer(true);
    };

    const handleEdit = (cliente) => {
        setEditingCliente(cliente);
        setFormData({
            nome: cliente.nome || '',
            cpfCnpj: cliente.cpfCnpj || '',
            telefone: cliente.telefone || '',
            email: cliente.email || '',
            cep: cliente.cep || '',
            endereco: cliente.endereco || '',
            numero: cliente.numero || '',
            complemento: cliente.complemento || '',
            bairro: cliente.bairro || '',
            cidade: cliente.cidade || '',
            estado: cliente.estado || ''
        });
        setShowModal(true);
    };

    const handleNew = () => {
        setEditingCliente(null);
        setFormData({
            nome: '',
            cpfCnpj: '',
            telefone: '',
            email: '',
            cep: '',
            endereco: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: ''
        });
        setShowModal(true);
    };

    // ViaCEP autofill
    const buscarCep = useCallback(async (cep) => {
        const cepLimpo = cep.replace(/\D/g, '');
        if (cepLimpo.length !== 8) return;

        setLoadingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await response.json();

            if (data.erro) {
                showToast('CEP não encontrado', 'error');
                return;
            }

            setFormData(prev => ({
                ...prev,
                endereco: data.logradouro || prev.endereco,
                bairro: data.bairro || prev.bairro,
                cidade: data.localidade || prev.cidade,
                estado: data.uf || prev.estado
            }));
            showToast('Endereço preenchido automaticamente!', 'success');
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            showToast('Erro ao buscar CEP', 'error');
        } finally {
            setLoadingCep(false);
        }
    }, [showToast]);

    const handleCepBlur = () => {
        if (formData.cep) {
            buscarCep(formData.cep);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCliente) {
                await api.put(`/clientes/${editingCliente.id}`, formData);
                showToast('Cliente atualizado com sucesso!', 'success');
            } else {
                await api.post('/clientes', formData);
                showToast('Cliente criado com sucesso!', 'success');
            }
            setShowModal(false);
            carregarClientes();
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            showToast(error.response?.data?.error || 'Erro ao salvar cliente', 'error');
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
            key: 'cpfCnpj',
            label: 'CPF/CNPJ',
            sortable: true
        },
        {
            key: 'telefone',
            label: 'Telefone',
            sortable: false
        },
        {
            key: 'email',
            label: 'E-mail',
            sortable: false
        },
        {
            key: 'cidade',
            label: 'Cidade',
            sortable: true
        }
    ];

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Users size={32} color="#3b82f6" />
                    <div>
                        <h1 className="page-title">Clientes</h1>
                        <p className="page-subtitle">Gerencie seus clientes</p>
                    </div>
                </div>
                <button onClick={handleNew} className="btn btn-primary">
                    <Plus size={20} />
                    Novo Cliente
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
                    placeholder="Buscar por nome, CPF ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '3rem', width: '100%' }}
                />
            </div>

            {/* Data Table */}
            <div className="card">
                <DataTable
                    columns={columns}
                    data={filteredClientes}
                    onRowClick={handleRowClick}
                    emptyMessage="Nenhum cliente encontrado"
                />
            </div>

            {/* Modal */}
            {showModal && (
                <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCliente ? 'Editar Cliente' : 'Novo Cliente'}>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="label">Nome *</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">CPF/CNPJ *</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.cpfCnpj}
                                    onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
                                    required
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

                            {/* Address Section */}
                            <div className="form-group full-width" style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '14px', fontWeight: '600' }}>
                                    <MapPin size={16} />
                                    <span>Endereço</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="label">CEP</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.cep}
                                        onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                                        onBlur={handleCepBlur}
                                        placeholder="00000-000"
                                        maxLength={9}
                                    />
                                    {loadingCep && (
                                        <Loader2
                                            size={16}
                                            style={{
                                                position: 'absolute',
                                                right: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                animation: 'spin 1s linear infinite'
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="label">Logradouro</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.endereco}
                                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                                    placeholder="Rua, Avenida..."
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Número</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.numero}
                                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                                    placeholder="123"
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Complemento</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.complemento}
                                    onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                                    placeholder="Apto, Sala..."
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Bairro</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.bairro}
                                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
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
                                <label className="label">UF</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.estado}
                                    onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                                    maxLength={2}
                                    placeholder="SP"
                                />
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {editingCliente ? 'Atualizar' : 'Criar'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Client Drawer */}
            <ClientDrawer
                isOpen={showDrawer}
                onClose={() => setShowDrawer(false)}
                client={selectedClient}
            />

            <style>{`
                @keyframes spin {
                    from { transform: translateY(-50%) rotate(0deg); }
                    to { transform: translateY(-50%) rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default Clientes;

