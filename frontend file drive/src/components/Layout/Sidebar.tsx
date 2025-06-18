import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Star, 
  Clock, 
  Share2, 
  Trash2, 
  Settings, 
  HardDrive,
  Zap,
  Users,
  Shield
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  storageUsed: number;
  storageLimit: number;
}

const menuItems = [
  { id: 'home', label: 'My Drive', icon: Home },
  { id: 'starred', label: 'Starred', icon: Star },
  { id: 'recent', label: 'Recent', icon: Clock },
  { id: 'shared', label: 'Shared', icon: Share2 },
  { id: 'ai-insights', label: 'AI Insights', icon: Zap },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'trash', label: 'Trash', icon: Trash2 },
];

const bottomItems = [
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onViewChange, 
  storageUsed, 
  storageLimit 
}) => {
  const storagePercentage = (storageUsed / storageLimit) * 100;

  return (
    <motion.div 
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="w-70 h-full bg-gray-900/50 backdrop-blur-xl border-r border-gray-800/50 flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-800/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-quantum-gradient rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-quantum-400 to-cyber-400 bg-clip-text text-transparent">
            Quantum Drive
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-quantum-600/20 text-quantum-300 border border-quantum-600/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.id === 'ai-insights' && (
                <div className="ml-auto w-2 h-2 bg-neon-400 rounded-full animate-pulse" />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Storage */}
      <div className="p-4 border-t border-gray-800/50">
        <div className="bg-gray-800/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Storage</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">
                {Math.round(storageUsed / (1024 ** 3))} GB used
              </span>
              <span className="text-gray-500">
                {Math.round(storageLimit / (1024 ** 3))} GB total
              </span>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div 
                className="h-2 bg-quantum-gradient rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${storagePercentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
          
          <button className="w-full py-2 px-4 bg-quantum-600 hover:bg-quantum-700 text-white rounded-lg text-sm font-medium transition-colors">
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="p-4 space-y-2 border-t border-gray-800/50">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-quantum-600/20 text-quantum-300 border border-quantum-600/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};