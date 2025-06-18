import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { registerUser, loginUser } from "../../services/auth";

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    const result = await loginUser(email, password);
    setLoading(false);
    console.log(result);

    // Check for success in both possible response formats
    if (
      result?.success === true || 
      result?.message?.toLowerCase().includes('login successful')
    ) {
      console.log('Login succeeded!');
      
      // Get token from result
      const token = result.access_token || result.data?.access_token;
      
      if (token) {
        // Save to localStorage for HTTPBearer use
        localStorage.setItem('token', token);

        // Redirect to /drive
        window.location.href = '/drive';
      } else {
        console.error('No access token received');
      }
    } else {
      console.log('Login failed!');
    }

    return result;
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    setLoading(true);
    const result = await registerUser(name, email, password);
    setLoading(false);
    console.log(result);
    return result;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-quantum-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyber-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-600/5 rounded-full blur-3xl animate-float" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8">
          {isLogin ? (
            <LoginForm
              onLogin={handleLogin}
              onSwitchToRegister={() => setIsLogin(false)}
              loading={loading}
            />
          ) : (
            <RegisterForm
              onRegister={handleRegister}
              onSwitchToLogin={() => setIsLogin(true)}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
};
