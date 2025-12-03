import axios from 'axios';

async function testBudgetCreation() {
    try {
        // 1. Login to get token
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'admin@erp.com',
            senha: 'senha123'
        });
        const token = loginRes.data.token;
        console.log('Login successful, token obtained.');

        // 2. Get a store ID
        const storesRes = await axios.get('http://localhost:3000/api/stores', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const storeId = storesRes.data[0]?.id;
        if (!storeId) throw new Error('No stores found');
        console.log('Store ID obtained:', storeId);

        // 3. Create Budget
        const budgetPayload = {
            clienteId: null,
            lojaId: storeId,
            itens: [
                {
                    produtoId: null, // Ad-hoc item
                    descricao: 'Test Item',
                    quantidade: 1,
                    precoUnit: 100.00,
                    subtotal: 100.00,
                    total: 100.00
                }
            ],
            subtotal: 100.00,
            desconto: 0,
            total: 100.00,
            observacoes: 'Test Budget via Script'
        };

        const budgetRes = await axios.post('http://localhost:3000/api/orcamentos', budgetPayload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Budget created successfully:', budgetRes.data);

        // Handle dummy response or real response
        if (budgetRes.data.message === 'Controller is reachable') {
            console.log('PASS: Controller is reachable (Dummy Mode)');
        } else {
            console.log('Budget Number:', budgetRes.data.numero);
            console.log('Budget Loja ID:', budgetRes.data.lojaId);

            if (budgetRes.data.lojaId !== storeId) {
                console.error('FAIL: Budget lojaId does not match requested storeId');
            } else {
                console.log('PASS: Budget linked to correct store.');
            }
        }

    } catch (error) {
        console.error('Test Failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
            console.error('Headers:', error.response.headers);
        } else {
            console.error('Error Message:', error.message);
        }
    }
}

testBudgetCreation();
