import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthPageProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onRegister: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onRegister, loading }) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-quantum-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyber-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-600/5 rounded-full blur-3xl animate-float" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8">
          {isLogin ? (
            <LoginForm
              onLogin={onLogin}
              onSwitchToRegister={() => setIsLogin(false)}
              loading={loading}
            />
          ) : (
            <RegisterForm
              onRegister={onRegister}
              onSwitchToLogin={() => setIsLogin(true)}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
};