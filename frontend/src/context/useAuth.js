import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export const API_BASE_URL = 'http://localhost:8000'; // FastAPI API address

export const useAuth = () => {
    return useContext(AuthContext);
};