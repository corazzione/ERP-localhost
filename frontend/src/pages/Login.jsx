import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/Toast';

function Login({ setAuth }) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { email, senha });
            const { token, usuario } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(usuario));

            setAuth(true);
            navigate('/');
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Email ou senha inválidos';
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>ERP Unificado</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">Email</label>
                        <input
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Senha</label>
                        <input
                            type="password"
                            className="input"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            required
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
                <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-neutral-500)', textAlign: 'center' }}>
                    Use: admin@erp.com / senha123
                </p>
            </div>
        </div>
    );
}

export default Login;
