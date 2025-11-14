import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    if (isAuthenticated) {
        navigate('/', { replace: true });
        return null; 
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        
        if (success) {
            navigate('/', { replace: true });
        }
    };

    return (
        <div style={styles.container}>
            <h2>Login to Dashboard</h2>
            
            {error && <p style={styles.error}>{error}</p>}
            
            <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    style={styles.button}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <div style={styles.footer}>
                <p>
                    Don't have an account?{' '}
                    <Link to="/register" style={styles.link}>
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid #ccc', borderRadius: '8px' },
    formGroup: { marginBottom: '15px' },
    input: { width: '100%', padding: '8px', boxSizing: 'border-box' },
    button: { width: '100%', padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    error: { color: 'red', border: '1px solid red', padding: '10px', borderRadius: '4px' },
    footer: { marginTop: '20px', textAlign: 'center', paddingTop: '15px', borderTop: '1px solid #eee' },
    link: { color: '#007bff', textDecoration: 'none', fontWeight: '500' }
};

export default LoginPage;