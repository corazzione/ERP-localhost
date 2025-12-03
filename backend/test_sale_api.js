import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
const LOJA_ID = 'loja-principal-001';
const PRODUTO_ID = '2f198cc0-9491-469c-8b47-2c966e82ada0'; // Cadeira Gamer (1200.00)

async function runTest() {
    try {
        console.log('🔑 Logging in...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@erp.com',
            senha: 'senha123'
        });
        const token = loginResponse.data.token;
        const headers = { Authorization: `Bearer ${token}` };
        console.log('✅ Logged in.');

        // Get a client for Crediário
        const clientesResponse = await axios.get(`${API_URL}/clientes`, { headers });
        const cliente = clientesResponse.data[0];
        if (!cliente) throw new Error('No clients found for Crediário test');
        console.log(`👤 Using client: ${cliente.nome} (${cliente.id})`);

        // Helper to create sale
        const createSale = async (method, details = {}) => {
            console.log(`\n🛒 Creating Sale: ${method}...`);
            const saleData = {
                lojaId: LOJA_ID,
                itens: [{ produtoId: PRODUTO_ID, quantidade: 1, precoUnit: 1200, subtotal: 1200 }],
                subtotal: 1200,
                total: 1200,
                formaPagamento: method,
                statusPagamento: method === 'crediario' ? 'pendente' : 'pago',
                observacoes: `Teste API ${method}`,
                ...details
            };
            const res = await axios.post(`${API_URL}/vendas`, saleData, { headers });
            console.log(`✅ Sale Created: #${res.data.numero}`);
            return res.data;
        };

        // Helper to check dashboard
        const checkDashboard = async (expectedFaturamento, description) => {
            const res = await axios.get(`${API_URL}/dashboard`, {
                params: { period: 'today', store: LOJA_ID },
                headers
            });
            const actual = res.data.vendas.faturamento;
            console.log(`📊 Dashboard Faturamento: ${actual} (Expected >= ${expectedFaturamento})`);

            if (actual >= expectedFaturamento) {
                console.log(`✅ SUCCESS: ${description} reflected.`);
            } else {
                console.log(`❌ FAILURE: ${description} NOT reflected.`);
            }
            return res.data;
        };

        // Current Faturamento (should be 2400 from previous tests)
        let currentTotal = 2400;

        // 2. Débito
        await createSale('cartao_debito');
        currentTotal += 1200;
        await checkDashboard(currentTotal, 'Débito');

        // 3. Crédito
        await createSale('cartao_credito');
        currentTotal += 1200;
        await checkDashboard(currentTotal, 'Crédito');

        // 4. PIX
        await createSale('pix');
        currentTotal += 1200;
        await checkDashboard(currentTotal, 'PIX');

        // 5. Crediário
        await createSale('crediario', {
            clienteId: cliente.id,
            numParcelas: 2,
            modoCrediario: 'PADRAO'
        });
        currentTotal += 1200;
        const dashData = await checkDashboard(currentTotal, 'Crediário');

        // Verify Crediário Specifics
        const crediarioTotal = dashData.movimentacoes.crediario;
        console.log(`📅 Crediário Total in Dashboard: ${crediarioTotal}`);
        if (crediarioTotal > 0) {
            console.log('✅ Crediário section updated.');
        } else {
            console.log('❌ Crediário section NOT updated.');
        }

    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);
    }
}

runTest();
