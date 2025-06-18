import { useState, useCallback, useEffect } from 'react';
import { AuthState, User } from '../types';

// Mock authentication - replace with real API calls
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('quantum_token');
        if (token) {
          // Simulate API call to verify token
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const mockUser: User = {
            id: '1',
            name: 'Alex Chen',
            email: 'alex@quantumdrive.com',
            storageUsed: 45 * 1024 ** 3,
            storageLimit: 100 * 1024 ** 3,
            aiApiKey: '',
            quantumKeysEnabled: true,
            createdAt: new Date('2024-01-01'),
          };
          
          setAuthState({
            isAuthenticated: true,
            user: mockUser,
            loading: false,
          });
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUser: User = {
        id: '1',
        name: email.split('@')[0],
        email,
        storageUsed: 45 * 1024 ** 3,
        storageLimit: 100 * 1024 ** 3,
        aiApiKey: '',
        quantumKeysEnabled: true,
        createdAt: new Date(),
      };
      
      localStorage.setItem('quantum_token', 'mock_token_' + Date.now());
      
      setAuthState({
        isAuthenticated: true,
        user: mockUser,
        loading: false,
      });
      
      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: false, error: 'Invalid credentials' };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        storageUsed: 0,
        storageLimit: 15 * 1024 ** 3, // 15GB for new users
        aiApiKey: '',
        quantumKeysEnabled: false,
        createdAt: new Date(),
      };
      
      localStorage.setItem('quantum_token', 'mock_token_' + Date.now());
      
      setAuthState({
        isAuthenticated: true,
        user: mockUser,
        loading: false,
      });
      
      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: false, error: 'Registration failed' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('quantum_token');
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
    });
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : null,
    }));
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    updateUser,
  };
};