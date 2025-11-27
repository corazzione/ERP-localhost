import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/Toast';
import logo from '../assets/logo.png';

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
            const { token, refreshToken, usuario } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
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
        <div className="login-container" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
            <div className="login-card" style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img src={logo} alt="Rivvi ERP" style={{ height: '60px', marginBottom: '1rem' }} />
                    <h1 style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: '700' }}>Rivvi ERP</h1>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Entre para acessar seu painel</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label" style={{ color: '#334155' }}>Email</label>
                        <input
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="seu@email.com"
                            style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}
                        />
                    </div>
                    <div className="form-group">
                        <label className="label" style={{ color: '#334155' }}>Senha</label>
                        <input
                            type="password"
                            className="input"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            required
                            placeholder="••••••••"
                            style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            fontSize: '1rem',
                            background: 'linear-gradient(to right, #2563eb, #3b82f6)',
                            border: 'none'
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
                <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        &copy; {new Date().getFullYear()} Rivvi Systems. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
