import { useState, useCallback, useEffect } from 'react';
import { AuthState, User } from '../types';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  const fetchUserProfile = useCallback(async (token: string) => {
    try {
      const response = await fetch('http://127.0.0.1:4000/auth/profile', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profileData = await response.json();
      return {
        id: profileData.id.toString(),
        name: profileData.username,
        email: profileData.email,
        storageUsed: 0, // You'll need to get these from your API
        storageLimit: 15 * 1024 ** 3,
        aiApiKey: '',
        quantumKeysEnabled: false,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const user = await fetchUserProfile(token);
          setAuthState({
            isAuthenticated: true,
            user,
            loading: false,
          });
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        localStorage.removeItem('token');
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    checkAuth();
  }, [fetchUserProfile]);

  const login = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      // Replace with your actual login API call
      const result = await loginUser(email, password); // Your existing login function
      
      if (result?.success === true || result?.message?.toLowerCase().includes('login successful')) {
        const token = result.access_token || result.data?.access_token;
        if (token) {
          localStorage.setItem('token', token);
          const user = await fetchUserProfile(token);
          
          setAuthState({
            isAuthenticated: true,
            user,
            loading: false,
          });
          
          return { success: true, data: { ...result, user } };
        }
      }
      
      throw new Error(result?.message || 'Login failed');
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }, [fetchUserProfile]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      // Replace with your actual register API call
      const result = await registerUser(name, email, password); // Your existing register function
      
      if (result?.success === true || result?.message?.toLowerCase().includes('registration successful')) {
        const token = result.access_token || result.data?.access_token;
        if (token) {
          localStorage.setItem('token', token);
          const user = await fetchUserProfile(token);
          
          setAuthState({
            isAuthenticated: true,
            user,
            loading: false,
          });
          
          return { success: true, data: { ...result, user } };
        }
      }
      
      throw new Error(result?.message || 'Registration failed');
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }, [fetchUserProfile]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
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