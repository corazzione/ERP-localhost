// import fetch from 'node-fetch'; // Native fetch is available in Node 18+

const ports = [5000];
const credentials = { email: 'admin@erp.com', senha: 'senha123' };

async function testPort(port) {
    const baseUrl = `http://localhost:${port}/api`;
    console.log(`Testing port ${port}...`);

    try {
        // Login
        const loginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        if (!loginRes.ok) {
            console.log(`Port ${port}: Login failed with status ${loginRes.status}`);
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log(`Port ${port}: Login successful. Token obtained.`);

        // List Clientes
        const clientesRes = await fetch(`${baseUrl}/clientes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!clientesRes.ok) {
            console.log(`Port ${port}: Failed to fetch clients with status ${clientesRes.status}`);
            const text = await clientesRes.text();
            console.log(`Response: ${text}`);
            return;
        }

        const clientes = await clientesRes.json();
        console.log(`Port ${port}: Fetched ${clientes.length} clients.`);
        console.log('Sample client:', clientes[0]);

        // List Produtos
        const produtosRes = await fetch(`${baseUrl}/produtos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!produtosRes.ok) {
            console.log(`Port ${port}: Failed to fetch products with status ${produtosRes.status}`);
            const text = await produtosRes.text();
            console.log(`Response: ${text}`);
            return;
        }

        const produtos = await produtosRes.json();
        console.log(`Port ${port}: Fetched ${produtos.length} products.`);

    } catch (error) {
        console.log(`Port ${port}: Error - ${error.message}`);
        if (error.cause) console.log('Cause:', error.cause);
    }
}

async function run() {
    for (const port of ports) {
        await testPort(port);
    }
}

run();
