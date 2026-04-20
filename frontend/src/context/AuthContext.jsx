import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount, restore user from localStorage if a token exists
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');
        if (token && storedUser) {
            // Set the default authorization header for all future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await axios.post('/api/login', { email, password });

        // Save token and user to localStorage for persistence across refreshes
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));

        // Set the Authorization header so all future requests are authenticated
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

        setUser(data.user);
        return data.user;
    };

    const logout = async () => {
        try {
            await axios.post('/api/logout');
        } catch (e) { /* ignore */ }

        // Clear all stored credentials
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
