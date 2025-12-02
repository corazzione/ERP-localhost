import React, { useState, useEffect } from 'react';
import { X, Edit2, Trash2, Check, AlertTriangle, Store } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import { useToast } from '../components/Toast';

const ManageStoresModal = ({ onClose, onUpdate }) => {
    const { isDark } = useTheme();
    const { addToast } = useToast();
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const bgColor = isDark ? '#1e293b' : '#ffffff';
    const textColor = isDark ? '#f8fafc' : '#1e293b';
    const borderColor = isDark ? '#334155' : '#e2e8f0';
    const hoverColor = isDark ? '#334155' : '#f1f5f9';
    const inputBg = isDark ? '#0f172a' : '#f8fafc';

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const response = await api.get('/stores');
            setStores(response.data);
        } catch (error) {
            console.error('Erro ao buscar lojas:', error);
            addToast({
                type: 'error',
                title: 'Erro',
                message: 'Não foi possível carregar as lojas.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (store) => {
        setEditingId(store.id);
        setEditName(store.nome);
        setDeleteConfirmId(null);
    };

    const handleSave = async (id) => {
        if (!editName.trim()) return;

        try {
            await api.patch(`/stores/${id}`, { nome: editName });
            addToast({
                type: 'success',
                title: 'Sucesso',
                message: 'Loja atualizada com sucesso!'
            });
            setEditingId(null);
            fetchStores();
            onUpdate();
        } catch (error) {
            console.error('Erro ao atualizar loja:', error);
            addToast({
                type: 'error',
                title: 'Erro',
                message: 'Erro ao atualizar loja.'
            });
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/stores/${id}`);
            addToast({
                type: 'success',
                title: 'Sucesso',
                message: 'Loja removida com sucesso!'
            });
            setDeleteConfirmId(null);
            fetchStores();
            onUpdate();
        } catch (error) {
            console.error('Erro ao excluir loja:', error);
            addToast({
                type: 'error',
                title: 'Erro',
                message: 'Erro ao excluir loja.'
            });
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: bgColor,
                borderRadius: '12px',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: `1px solid ${borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: textColor,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <Store size={24} color="#6366f1" />
                        Gerenciar Lojas
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: isDark ? '#94a3b8' : '#64748b'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    padding: '20px',
                    overflowY: 'auto',
                    flex: 1
                }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: textColor }}>
                            Carregando...
                        </div>
                    ) : stores.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: textColor }}>
                            Nenhuma loja cadastrada.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {stores.map(store => (
                                <div
                                    key={store.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '12px 16px',
                                        backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                                        border: `1px solid ${borderColor}`,
                                        borderRadius: '8px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {editingId === store.id ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                style={{
                                                    flex: 1,
                                                    padding: '8px 12px',
                                                    borderRadius: '6px',
                                                    border: `1px solid ${isDark ? '#475569' : '#cbd5e1'}`,
                                                    backgroundColor: inputBg,
                                                    color: textColor,
                                                    outline: 'none'
                                                }}
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleSave(store.id)}
                                                style={{
                                                    padding: '8px',
                                                    borderRadius: '6px',
                                                    backgroundColor: '#10b981',
                                                    color: 'white',
                                                    border: 'none',
                                                    cursor: 'pointer'
                                                }}
                                                title="Salvar"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                style={{
                                                    padding: '8px',
                                                    borderRadius: '6px',
                                                    backgroundColor: isDark ? '#475569' : '#e2e8f0',
                                                    color: textColor,
                                                    border: 'none',
                                                    cursor: 'pointer'
                                                }}
                                                title="Cancelar"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: '500', color: textColor }}>{store.nome}</span>
                                                <span style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                                                    Código: {store.codigo}
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {deleteConfirmId === store.id ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontSize: '0.875rem', color: '#ef4444', fontWeight: '500' }}>
                                                            Confirmar?
                                                        </span>
                                                        <button
                                                            onClick={() => handleDelete(store.id)}
                                                            style={{
                                                                padding: '6px',
                                                                borderRadius: '6px',
                                                                backgroundColor: '#ef4444',
                                                                color: 'white',
                                                                border: 'none',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirmId(null)}
                                                            style={{
                                                                padding: '6px',
                                                                borderRadius: '6px',
                                                                backgroundColor: isDark ? '#475569' : '#e2e8f0',
                                                                color: textColor,
                                                                border: 'none',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(store)}
                                                            style={{
                                                                padding: '8px',
                                                                borderRadius: '6px',
                                                                background: 'transparent',
                                                                color: isDark ? '#94a3b8' : '#64748b',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                transition: 'color 0.2s'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.color = '#6366f1'}
                                                            onMouseLeave={(e) => e.currentTarget.style.color = isDark ? '#94a3b8' : '#64748b'}
                                                            title="Editar"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirmId(store.id)}
                                                            style={{
                                                                padding: '8px',
                                                                borderRadius: '6px',
                                                                background: 'transparent',
                                                                color: isDark ? '#94a3b8' : '#64748b',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                transition: 'color 0.2s'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                                            onMouseLeave={(e) => e.currentTarget.style.color = isDark ? '#94a3b8' : '#64748b'}
                                                            title="Excluir"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '20px',
                    borderTop: `1px solid ${borderColor}`,
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            backgroundColor: isDark ? '#334155' : '#e2e8f0',
                            color: textColor,
                            border: 'none',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageStoresModal;
