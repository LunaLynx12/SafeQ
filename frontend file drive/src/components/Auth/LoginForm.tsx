import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Zap } from 'lucide-react';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onSwitchToRegister: () => void;
  loading: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSwitchToRegister, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const result = await onLogin(email, password);
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-quantum-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-quantum-400 to-cyber-400 bg-clip-text text-transparent">
          Welcome Back
        </h1>
        <p className="text-gray-400 mt-2">Sign in to your Quantum Drive</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-quantum-500/50 focus:border-quantum-500/50 transition-all"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl pl-12 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-quantum-500/50 focus:border-quantum-500/50 transition-all"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full bg-quantum-gradient hover:shadow-lg hover:shadow-quantum-500/25 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Signing In...</span>
            </div>
          ) : (
            'Sign In'
          )}
        </motion.button>

        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-quantum-400 hover:text-quantum-300 transition-colors"
          >
            Don't have an account? <span className="font-semibold">Sign up</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};