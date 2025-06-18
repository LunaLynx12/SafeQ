import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Clock, 
  FileText, 
  Star,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';

const insights = [
  {
    id: 1,
    type: 'optimization',
    title: 'Storage Optimization',
    description: 'Found 2.3GB of duplicate files that can be safely removed',
    action: 'Clean up duplicates',
    impact: 'high',
    icon: Target,
    color: 'from-neon-500 to-pink-500',
  },
  {
    id: 2,
    type: 'collaboration',
    title: 'Team Collaboration',
    description: 'Project Quantum folder has high activity - consider creating shared templates',
    action: 'Create templates',
    impact: 'medium',
    icon: Users,
    color: 'from-cyber-500 to-blue-500',
  },
  {
    id: 3,
    type: 'productivity',
    title: 'File Organization',
    description: 'AI suggests grouping design files into categories for better workflow',
    action: 'Auto-organize',
    impact: 'medium',
    icon: BarChart3,
    color: 'from-quantum-500 to-purple-500',
  },
  {
    id: 4,
    type: 'security',
    title: 'Security Scan',
    description: 'All files scanned - no security threats detected',
    action: 'View report',
    impact: 'low',
    icon: Star,
    color: 'from-green-500 to-emerald-500',
  },
];

const stats = [
  { label: 'Files Analyzed', value: '1,247', change: '+12%', icon: FileText },
  { label: 'Storage Saved', value: '892 MB', change: '+5%', icon: TrendingUp },
  { label: 'Productivity Boost', value: '23%', change: '+8%', icon: Zap },
  { label: 'Active Users', value: '156', change: '+3%', icon: Users },
];

export const AIInsights: React.FC = () => {
  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center space-x-3"
      >
        <div className="w-10 h-10 bg-neon-gradient rounded-xl flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Insights</h1>
          <p className="text-gray-400">Intelligent analysis of your files and usage patterns</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-6 hover:border-gray-600/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-6 h-6 text-quantum-400" />
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Insights Cards */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Smart Recommendations</h2>
        
        <div className="grid gap-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={insight.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-6 hover:border-gray-600/50 transition-all duration-200 group"
                whileHover={{ y: -2 }}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 bg-gradient-to-r ${insight.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        insight.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                        insight.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {insight.impact.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 mb-4">{insight.description}</p>
                    
                    <motion.button
                      className={`px-4 py-2 bg-gradient-to-r ${insight.color} text-white rounded-lg font-medium hover:shadow-lg transition-all`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {insight.action}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* AI Processing Status */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-quantum-600/20 to-cyber-600/20 border border-quantum-500/30 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-quantum-400 rounded-full animate-pulse" />
          <span className="text-quantum-300 font-medium">AI Analysis Active</span>
        </div>
        <p className="text-gray-400 mt-2">
          Continuously monitoring your files for optimization opportunities and security threats.
          Next full scan in 2 hours.
        </p>
      </motion.div>
    </div>
  );
};