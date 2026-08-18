import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('scrapconnect_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check token and load user profile on app startup
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await api.getMe();
          if (response.success && response.user) {
            setUser(response.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Failed to load authenticated user:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Login handler
  const login = async (credentials) => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.login(credentials);
      if (response.success && response.token) {
        localStorage.setItem('scrapconnect_token', response.token);
        setToken(response.token);
        setUser(response.user);
        setLoading(false);
        return response.user;
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
      throw err;
    }
  };

  // Register handler
  const register = async (userData) => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.register(userData);
      if (response.success && response.token) {
        localStorage.setItem('scrapconnect_token', response.token);
        setToken(response.token);
        setUser(response.user);
        setLoading(false);
        return response.user;
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
      setLoading(false);
      throw err;
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('scrapconnect_token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  // Update profile handler
  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const response = await api.updateProfile(profileData);
      if (response.success && response.user) {
        setUser(response.user);
        return response;
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
      throw err;
    }
  };

  const value = {
    user,
    setUser,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isBuyer: user?.role === 'buyer',
    isSeller: user?.role === 'seller',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
