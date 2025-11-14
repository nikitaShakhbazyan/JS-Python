import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { isAuthenticated, API_BASE_URL, login } = useAuth();
    const navigate = useNavigate();

    if (isAuthenticated) {
        navigate('/', { replace: true });
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/register`, {
                email,
                password
            });

            // Automatically log in after successful registration
            if (response.data.access_token) {
                const success = await login(email, password);
                if (success) {
                    navigate('/', { replace: true });
                }
            }
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Registration failed. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2>Create New Account</h2>

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
                        placeholder="your.email@example.com"
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
                        placeholder="Minimum 6 characters"
                        minLength={6}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label>Confirm Password:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={styles.input}
                        placeholder="Re-enter your password"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={styles.button}
                >
                    {loading ? 'Creating Account...' : 'Register'}
                </button>
            </form>

            <div style={styles.footer}>
                <p>
                    Already have an account?{' '}
                    <Link to="/login" style={styles.link}>
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '400px',
        margin: '50px auto',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: 'white'
    },
    formGroup: {
        marginBottom: '15px'
    },
    input: {
        width: '100%',
        padding: '10px',
        boxSizing: 'border-box',
        border: '1px solid #ced4da',
        borderRadius: '4px',
        fontSize: '14px',
        marginTop: '5px'
    },
    button: {
        width: '100%',
        padding: '12px 15px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '500'
    },
    error: {
        color: '#721c24',
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '15px'
    },
    footer: {
        marginTop: '20px',
        textAlign: 'center',
        paddingTop: '15px',
        borderTop: '1px solid #eee'
    },
    link: {
        color: '#007bff',
        textDecoration: 'none',
        fontWeight: '500'
    }
};

export default RegisterPage;
