'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('vastra_token');
            if (!token) {
                setLoading(false);
                return;
            }
            const data = await api.get('/auth/me');
            setUser(data.user);
        } catch (error) {
            if (error?.status === 401) {
                localStorage.removeItem('vastra_token');
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const data = await api.post('/auth/login', { email, password });
        localStorage.setItem('vastra_token', data.token);
        setUser(data.user);
        return data;
    };

    const register = async (formData) => {
        const data = await api.post('/auth/register', formData);
        localStorage.setItem('vastra_token', data.token);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('vastra_token');
        setUser(null);
        window.location.href = '/';
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
