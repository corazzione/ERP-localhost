import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [formData, setFormData] = useState({
        nome: '',
        cpfCnpj: '',
        email: '',
        telefone: '',
        limiteCredito: 0,
        endereco: '',
        cidade: '',
        estado: '',
        cep: ''
    });
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        carregarClientes();
    }, []);

    const carregarClientes = async () => {
        try {
            const response = await api.get('/clientes');
            setClientes(response.data);
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            showToast('Erro ao carregar clientes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (cliente = null) => {
        if (cliente) {
            setEditingClient(cliente);
            setFormData({
                nome: cliente.nome,
                cpfCnpj: cliente.cpfCnpj,
                email: cliente.email || '',
                telefone: cliente.telefone || '',
                limiteCredito: cliente.limiteCredito,
                endereco: cliente.endereco || '',
                cidade: cliente.cidade || '',
                estado: cliente.estado || '',
                cep: cliente.cep || ''
            });
        } else {
            setEditingClient(null);
            setFormData({
                nome: '',
                cpfCnpj: '',
                email: '',
                telefone: '',
                limiteCredito: 0,
                endereco: '',
                cidade: '',
                estado: '',
                cep: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingClient(null);
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
                limiteCredito: parseFloat(formData.limiteCredito)
            };

            if (editingClient) {
                await api.put(`/clientes/${editingClient.id}`, data);
                showToast('Cliente atualizado com sucesso!', 'success');
            } else {
                await api.post('/clientes', data);
                showToast('Cliente criado com sucesso!', 'success');
            }

            handleCloseModal();
            carregarClientes();
        } catch (error) {
            console.error('Erro:', error);
            const message = error.response?.data?.error || 'Erro ao salvar cliente';
            showToast(message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleAtivo = async (cliente) => {
        try {
            await api.put(`/clientes/${cliente.id}`, {
                ativo: !cliente.ativo
            });
            showToast(
                cliente.ativo ? 'Cliente inativado' : 'Cliente ativado',
                'success'
            );
            carregarClientes();
        } catch (error) {
            console.error('Erro ao ativar/inativar:', error);
            showToast('Erro ao atualizar cliente', 'error');
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Clientes</h1>
                    <p style={{ color: 'var(--color-neutral-500)' }}>Gerencie seus clientes</p>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    + Novo Cliente
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
                                <th>Nome</th>
                                <th>CPF/CNPJ</th>
                                <th>Contato</th>
                                <th>Limite de Crédito</th>
                                <th>Saldo Devedor</th>
                                <th>Status</th>
                                <th style={{ width: '120px', textAlign: 'center' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientes.map((cliente) => (
                                <tr key={cliente.id}>
                                    <td className="font-semibold">{cliente.nome}</td>
                                    <td>{cliente.cpfCnpj}</td>
                                    <td>
                                        <div style={{ fontSize: '0.875rem' }}>
                                            {cliente.email && <div>{cliente.email}</div>}
                                            {cliente.telefone && <div style={{ color: 'var(--color-neutral-500)' }}>{cliente.telefone}</div>}
                                        </div>
                                    </td>
                                    <td>R$ {parseFloat(cliente.limiteCredito).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    <td className={parseFloat(cliente.saldoDevedor) > 0 ? 'text-warning font-semibold' : ''}>
                                        R$ {parseFloat(cliente.saldoDevedor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td>
                                        <span className={cliente.ativo ? 'badge badge-positive' : 'badge badge-neutral'}>
                                            {cliente.ativo ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            <button
                                                className="btn btn-sm btn-ghost"
                                                onClick={() => handleOpenModal(cliente)}
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn btn-sm btn-ghost"
                                                onClick={() => handleToggleAtivo(cliente)}
                                                title={cliente.ativo ? 'Inativar' : 'Ativar'}
                                            >
                                                {cliente.ativo ? '🚫' : '✅'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {clientes.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                                        Nenhum cliente cadastrado
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
                title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                size="large"
            >
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                            <label className="label">CPF/CNPJ <span className="required">*</span></label>
                            <input
                                type="text"
                                name="cpfCnpj"
                                className="input"
                                value={formData.cpfCnpj}
                                onChange={handleInputChange}
                                required
                                disabled={!!editingClient}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="label">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="input"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="label">Telefone</label>
                            <input
                                type="text"
                                name="telefone"
                                className="input"
                                value={formData.telefone}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Endereço</label>
                        <input
                            type="text"
                            name="endereco"
                            className="input"
                            value={formData.endereco}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="label">Cidade</label>
                            <input
                                type="text"
                                name="cidade"
                                className="input"
                                value={formData.cidade}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="label">Estado</label>
                            <input
                                type="text"
                                name="estado"
                                className="input"
                                value={formData.estado}
                                onChange={handleInputChange}
                                maxLength="2"
                            />
                        </div>
                        <div className="form-group">
                            <label className="label">CEP</label>
                            <input
                                type="text"
                                name="cep"
                                className="input"
                                value={formData.cep}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Limite de Crédito (R$)</label>
                        <input
                            type="number"
                            name="limiteCredito"
                            className="input"
                            value={formData.limiteCredito}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                        />
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
                                editingClient ? 'Atualizar' : 'Criar Cliente'
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default Clientes;
