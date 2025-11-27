# 🪷 Lotus Core ERP - Frontend Crediário Integration Guide

## 📋 Overview

Este guia documenta como integrar o módulo de crediário no frontend React, conectando-se ao backend completo já implementado.

---

## 🎨 Fase 7: UX Frontend

### 1. Modal de Crediário no PDV

**Localização:** Atualizar componente `PDV.jsx` ou criar `CrediarioModal.jsx`

**Funcionalidade:**
- Aparecer quando forma de pagamento = "Crediário"
- Permitir escolha entre 3 modos
- Mostrar prévia de parcelas em tempo real

**Exemplo de Implementação:**

```jsx
import { useState, useEffect } from 'react';
import Modal from './Modal';

function CrediarioModal({ isOpen, onClose, valorTotal, onConfirm }) {
    const [modo, setModo] = useState('PADRAO');
    const [numParcelas, setNumParcelas] = useState(12);
    const [taxaPersonalizada, setTaxaPersonalizada] = useState(8);
    const [tipoJuros, setTipoJuros] = useState('COMPOSTO');
    const [primeiroVencimento, setPrimeiroVencimento] = useState('');
    const [parcelasManual, setParcelasManual] = useState([]);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (modo !== 'MANUAL') {
            calcularPreview();
        }
    }, [modo, numParcelas, taxaPersonalizada, tipoJuros]);

    const calcularPreview = async () => {
        const taxa = modo === 'PADRAO' ? 8 : taxaPersonalizada;
        const tipo = modo === 'PADRAO' ? 'COMPOSTO' : tipoJuros;
        
        // Simulação local (ou chamar endpoint de preview)
        const response = await fetch('/api/crediario/preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                valorInicial: valorTotal,
                numParcelas,
                taxa,
                tipoJuros: tipo
            })
        });
        
        const data = await response.json();
        setPreview(data);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Configurar Crediário">
            {/* Seleção de Modo */}
            <div className="form-group">
                <label>Modo de Crediário</label>
                <select value={modo} onChange={(e) => setModo(e.target.value)}>
                    <option value="PADRAO">Padrão (8% ao mês)</option>
                    <option value="PERSONALIZADO">Taxa Personalizada</option>
                    <option value="MANUAL">Valores Manuais</option>
                </select>
            </div>

            {/* Número de Parcelas */}
            <div className="form-group">
                <label>Número de Parcelas</label>
                <input 
                    type="number" 
                    value={numParcelas} 
                    onChange={(e) => setNumParcelas(parseInt(e.target.value))}
                    min="1"
                    max="24"
                />
            </div>

            {/* Se PERSONALIZADO */}
            {modo === 'PERSONALIZADO' && (
                <>
                    <div className="form-group">
                        <label>Taxa Mensal (%)</label>
                        <input 
                            type="number" 
                            value={taxaPersonalizada} 
                            onChange={(e) => setTaxaPersonalizada(parseFloat(e.target.value))}
                            step="0.1"
                        />
                    </div>
                    <div className="form-group">
                        <label>Tipo de Juros</label>
                        <select value={tipoJuros} onChange={(e) => setTipoJuros(e.target.value)}>
                            <option value="SIMPLES">Juros Simples</option>
                            <option value="COMPOSTO">Juros Compostos (Price)</option>
                        </select>
                    </div>
                </>
            )}

            {/* Primeiro Vencimento */}
            <div className="form-group">
                <label>Primeiro Vencimento</label>
                <input 
                    type="date" 
                    value={primeiroVencimento}
                    onChange={(e) => setPrimeiroVencimento(e.target.value)}
                />
            </div>

            {/* Preview de Parcelas */}
            {preview && modo !== 'MANUAL' && (
                <div className="preview-parcelas">
                    <h3>Prévia das Parcelas</h3>
                    <div className="summary">
                        <p><strong>Valor à Vista:</strong> R$ {valorTotal.toFixed(2)}</p>
                        <p><strong>Valor Total:</strong> R$ {preview.valorTotal.toFixed(2)}</p>
                        <p><strong>Juros Total:</strong> R$ {preview.valorJurosTotal.toFixed(2)}</p>
                        <p><strong>Valor da Parcela:</strong> R$ {preview.valorParcela.toFixed(2)}</p>
                    </div>
                    
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Vencimento</th>
                                <th>Principal</th>
                                <th>Juros</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {preview.parcelas.slice(0, 3).map(p => (
                                <tr key={p.numero}>
                                    <td>{p.numero}</td>
                                    <td>{new Date(p.dataVencimento).toLocaleDateString()}</td>
                                    <td>R$ {p.valorPrincipal.toFixed(2)}</td>
                                    <td>R$ {p.valorJurosPrevisto.toFixed(2)}</td>
                                    <td>R$ {p.valorTotalPrevisto.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {preview.parcelas.length > 3 && (
                        <p className="text-muted">... e mais {preview.parcelas.length - 3} parcelas</p>
                    )}
                </div>
            )}

            {/* Botões */}
            <div className="modal-actions">
                <button onClick={onClose} className="btn-secondary">Cancelar</button>
                <button 
                    onClick={() => onConfirm({
                        modoCrediario: modo,
                        numParcelas,
                        primeiroVencimento,
                        taxaPersonalizadaMensal: modo === 'PERSONALIZADO' ? taxaPersonalizada : null,
                        tipoJurosPersonalizado: modo === 'PERSONALIZADO' ? tipoJuros : null,
                        parcelasManual: modo === 'MANUAL' ? parcelasManual : null
                    })}
                    className="btn-primary"
                >
                    Confirmar Crediário
                </button>
            </div>
        </Modal>
    );
}

export default CrediarioModal;
```

### 2. Página de Gestão de Parcelas

**Localização:** Criar `pages/Crediario.jsx`

**Funcionalidades:**
- Listar todas as parcelas pendentes
- Filtrar por cliente, status, vencidas
- Registrar pagamento
- Mostrar economia em pagamento antecipado

```jsx
import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

function Crediario() {
    const [parcelas, setParcelas] = useState([]);
    const [filtro, setFiltro] = useState('todas');
    const [parcelaSelecionada, setParcelaSelecionada] = useState(null);
    const [showPagamentoModal, setShowPagamentoModal] = useState(false);

    useEffect(() => {
        carregarParcelas();
    }, [filtro]);

    const carregarParcelas = async () => {
        const query = filtro === 'vencidas' ? '?vencidas=true' : '';
        const response = await fetch(`/api/crediario/parcelas${query}`);
        const data = await response.json();
        setParcelas(data);
    };

    const abrirPagamento = (parcela) => {
        setParcelaSelecionada(parcela);
        setShowPagamentoModal(true);
    };

    const registrarPagamento = async (valorPago, dataPagamento) => {
        await fetch(`/api/crediario/parcelas/${parcelaSelecionada.id}/pagar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ valorPago, dataPagamento })
        });
        
        setShowPagamentoModal(false);
        carregarParcelas();
    };

    const columns = [
        { key: 'carne.cliente.nome', label: 'Cliente' },
        { key: 'numeroParcela', label: 'Parcela' },
        { 
            key: 'dataVencimento', 
            label: 'Vencimento',
            render: (value) => new Date(value).toLocaleDateString()
        },
        { 
            key: 'valorTotalPrevisto', 
            label: 'Valor',
            render: (value) => `R$ ${parseFloat(value).toFixed(2)}`
        },
        {
            key: 'status',
            label: 'Status',
            render: (value, row) => {
                const hoje = new Date();
                const vencimento = new Date(row.dataVencimento);
                const atrasado = vencimento < hoje && value === 'pendente';
                
                return (
                    <Badge 
                        variant={
                            value === 'pago' ? 'success' :
                            atrasado ? 'danger' : 'warning'
                        }
                    >
                        {value === 'pago' ? 'Pago' : atrasado ? 'Atrasado' : 'Pendente'}
                    </Badge>
                );
            }
        },
        {
            key: 'actions',
            label: 'Ações',
            render: (_, row) => row.status === 'pendente' && (
                <button 
                    onClick={() => abrirPagamento(row)}
                    className="btn-sm btn-primary"
                >
                    Registrar Pagamento
                </button>
            )
        }
    ];

    return (
        <div className="page-container">
            <h1>Gestão de Crediário</h1>
            
            {/* Filtros */}
            <div className="filters">
                <button 
                    onClick={() => setFiltro('todas')}
                    className={filtro === 'todas' ? 'active' : ''}
                >
                    Todas
                </button>
                <button 
                    onClick={() => setFiltro('pendentes')}
                    className={filtro === 'pendentes' ? 'active' : ''}
                >
                    Pendentes
                </button>
                <button 
                    onClick={() => setFiltro('vencidas')}
                    className={filtro === 'vencidas' ? 'active' : ''}
                >
                    Vencidas
                </button>
            </div>

            {/* Tabela */}
            <DataTable 
                data={parcelas}
                columns={columns}
            />

            {/* Modal de Pagamento */}
            {showPagamentoModal && (
                <PagamentoModal 
                    parcela={parcelaSelecionada}
                    onConfirm={registrarPagamento}
                    onClose={() => setShowPagamentoModal(false)}
                />
            )}
        </div>
    );
}

export default Crediario;
```

### 3. Indicadores Visuais

**Economia por Pagamento Antecipado:**
```jsx
{diasAntecipados > 0 && (
    <div className="alert alert-success">
        <strong>🎉 Economia!</strong>
        <p>Pagamento antecipado em {diasAntecipados} dias</p>
        <p>Desconto: R$ {descontoAntecipacao.toFixed(2)}</p>
        <p>Valor final: R$ {valorFinal.toFixed(2)}</p>
    </div>
)}
```

**Multa por Atraso:**
```jsx
{diasAtraso > 0 && (
    <div className="alert alert-warning">
        <strong>⚠️ Pagamento em Atraso</strong>
        <p>Atraso: {diasAtraso} dias</p>
        <p>Multa (2%): R$ {multaAtraso.toFixed(2)}</p>
        <p>Juros de Mora: R$ {jurosMora.toFixed(2)}</p>
        <p>Valor final: R$ {valorFinal.toFixed(2)}</p>
    </div>
)}
```

---

## 🔌 Endpoints da API

### Criar Venda com Crediário
```
POST /api/vendas

Body:
{
  "clienteId": "uuid",
  "itens": [...],
  "formaPagamento": "crediario",
  "modoCrediario": "PADRAO" | "PERSONALIZADO" | "MANUAL",
  "numParcelas": 12,
  "primeiroVencimento": "2024-12-15",
  
  // Se PERSONALIZADO
  "taxaPersonalizadaMensal": 10.5,
  "tipoJurosPersonalizado": "SIMPLES",
  
  // Se MANUAL
  "parcelasManual": [
    { "numero": 1, "valor": 150, "vencimento": "2024-12-15" }
  ]
}
```

### Listar Parcelas
```
GET /api/crediario/parcelas?vencidas=true&clienteId=uuid&status=pendente
```

### Registrar Pagamento
```
POST /api/crediario/parcelas/:id/pagar

Body:
{
  "valorPago": 150.00,        // opcional
  "dataPagamento": "2024-11-27" // opcional
}

Response:
{
  "parcela": { /* dados atualizados */ },
  "resumo": {
    "valorFinal": 147.50,
    "descontoAntecipacao": 2.50,
    "diasAntecipados": 10,
    "economizado": true,
    "parcelasRestantes": 5
  }
}
```

### Simular Quitação
```
GET /api/crediario/:carneId/simular-quitacao

Response:
{
  "valorAQuitarHoje": 1450.00,
  "valorSemDesconto": 1575.00,
  "descontoJuros": 125.00,
  "parcelasRestantes": 10,
  "economia": "7.9%"
}
```

---

## 🎨 Estilos Sugeridos

```css
/* crediario.css */
.preview-parcelas {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
}

.preview-parcelas .summary {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.preview-parcelas .summary p {
    margin: 0;
    padding: 0.5rem;
    background: white;
    border-radius: 4px;
}

.alert-success {
    background: #d4edda;
    border-left: 4px solid #28a745;
    padding: 1rem;
    border-radius: 4px;
}

.alert-warning {
    background: #fff3cd;
    border-left: 4px solid #ffc107;
    padding: 1rem;
    border-radius: 4px;
}
```

---

## ✅ Checklist de Integração

- [ ] Criar `CrediarioModal.jsx`
- [ ] Integrar modal no componente PDV
- [ ] Criar página `Crediario.jsx`
- [ ] Adicionar rota `/crediario` no React Router
- [ ] Testar criação de venda modo PADRÃO
- [ ] Testar criação de venda modo PERSONALIZADO
- [ ] Testar criação de venda modo MANUAL
- [ ] Testar pagamento antecipado (verificar desconto)
- [ ] Testar pagamento atrasado (verificar multa)
- [ ] Validar integração com Dashboard Financeiro

---

**Data:** 27/11/2024  
**Módulo:** Crediário Frontend Integration  
**Sistema:** Lotus Core ERP 🪷
