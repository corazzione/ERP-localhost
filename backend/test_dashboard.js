async function testDashboard() {
    try {
        // 1. Login
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@erp.com', senha: 'senha123' })
        });

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login Status:', loginRes.status);

        if (!token) {
            console.error('Falha no login:', loginData);
            return;
        }

        // 2. Dashboard
        const response = await fetch('http://localhost:5000/api/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Dashboard Status:', response.status);
        const data = await response.json();
        console.log('Dashboard Data:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Erro:', error.message);
    }
}

testDashboard();
