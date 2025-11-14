import { createContext, useState, useContext } from 'react';
import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8000';

const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
}; 

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('access_token'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await axios.post(
                `${API_BASE_URL}/token`, 
                formData.toString(), 
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }
            );

            const newToken = response.data.access_token;
            localStorage.setItem('access_token', newToken);
            setToken(newToken);
            setIsAuthenticated(true);
            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.detail || "Ошибка входа. Проверьте учетные данные.";
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const register = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/register`,
                { email, password }
            );

            const newToken = response.data.access_token;
            localStorage.setItem('access_token', newToken);
            setToken(newToken);
            setIsAuthenticated(true);
            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.detail || "Registration failed. Please try again.";
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        setToken(null);
        setIsAuthenticated(false);
    };

    const contextValue = {
        token,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        API_BASE_URL
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext };