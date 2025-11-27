// Script para testar endpoints de Orçamentos e Pedidos
const API_URL = 'http://localhost:5000/api';

async function testarSistemaOrcamentos() {
    try {
        console.log('🔐 Fazendo login...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@erp.com', senha: 'senha123' })
        });
        const { token } = await loginRes.json();
        console.log('✅ Login OK!\n');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // 1. Listar clientes
        console.log('📋 Listando clientes...');
        const clientesRes = await fetch(`${API_URL}/clientes`, { headers });
        const clientes = await clientesRes.json();
        const cliente = clientes[0];
        console.log(`✅ ${clientes.length} clientes. Usando: ${cliente?.nome || 'Balcão'}\n`);

        // 2. Criar orçamento
        console.log('💼 Criando orçamento...');
        const orcRes = await fetch(`${API_URL}/orcamentos`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                clienteId: cliente?.id,
                itens: [
                    { descricao: 'Camiseta + Estampa 30x40cm', quantidade: 10, precoUnit: 60, especificacoes: 'DTF colorido' },
                    { descricao: 'Filme DTF Premium', quantidade: 1, precoUnit: 15 }
                ],
                desconto: 10,
                observacoes: 'Entrega em 5 dias',
                validadeDias: 15
            })
        });
        const orc = await orcRes.json();
        console.log(`✅ Orçamento: ${orc.numero} | Total: R$ ${parseFloat(orc.total).toFixed(2)}\n`);

        // 3. Aprovar → Pedido
        console.log('✔️  Aprovando orçamento...');
        const aprRes = await fetch(`${API_URL}/orcamentos/${orc.id}/aprovar`, {
            method: 'POST',
            headers,
            body: JSON.stringify({})
        });
        const { pedido } = await aprRes.json();
        console.log(`✅ Pedido: ${pedido.numero}\n`);

        // 4. Lançar custos
        console.log('💰 Lançando custos...');
        await fetch(`${API_URL}/pedidos/${pedido.id}/custos`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ tipo: 'material', descricao: 'Filme DTF A3', valor: 80 })
        });
        await fetch(`${API_URL}/pedidos/${pedido.id}/custos`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ tipo: 'material', descricao: 'Tinta', valor: 30 })
        });
        await fetch(`${API_URL}/pedidos/${pedido.id}/custos`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ tipo: 'mao_obra', descricao: 'Mão de obra', valor: 50 })
        });
        console.log('✅ 3 custos lançados\n');

        // 5. Ver margem
        console.log('📊 Verificando margem...');
        const pedRes = await fetch(`${API_URL}/pedidos/${pedido.id}`, { headers });
        const pd = await pedRes.json();
        console.log(`Faturamento: R$ ${parseFloat(pd.total).toFixed(2)}`);
        console.log(`Custo: R$ ${parseFloat(pd.custoTotal).toFixed(2)}`);
        console.log(`💰 Margem: R$ ${parseFloat(pd.margemReal).toFixed(2)}\n`);

        // 6. Finalizar → Venda
        console.log('🎉 Finalizando...');
        const finRes = await fetch(`${API_URL}/pedidos/${pedido.id}/finalizar`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ formaPagamento: 'dinheiro' })
        });
        const finJson = await finRes.json();
        console.log('DEBUG finJson:', JSON.stringify(finJson, null, 2));
        const venda = finJson.venda;
        console.log(`✅ Venda: ${venda.numero}\n`);

        console.log('═══════════════════════════════════════');
        console.log('✅ TODOS OS TESTES PASSARAM!');
        console.log(`Orçamento → Pedido → Venda`);
        console.log(`Margem: R$ ${parseFloat(pd.margemReal).toFixed(2)}`);
        console.log('═══════════════════════════════════════');

    } catch (error) {
        console.error('❌ ERRO:', error.message);
    }
}

testarSistemaOrcamentos();
