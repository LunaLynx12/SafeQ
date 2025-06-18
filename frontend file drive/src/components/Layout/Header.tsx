import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Upload, 
  Grid3X3, 
  List, 
  SlidersHorizontal,
  Bell,
  User,
  Moon,
  Sun,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { ViewMode, User as UserType } from '../../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onUpload: () => void;
  onCreateFolder: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
  user: UserType | null;
  onLogout: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onUpload,
  onCreateFolder,
  isDark,
  onThemeToggle,
  user,
  onLogout,
  onOpenSettings,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gray-900/30 backdrop-blur-xl border-b border-gray-800/50 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search files, folders, and content..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-quantum-500/50 focus:border-quantum-500/50 transition-all"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <kbd className="px-2 py-1 bg-gray-700/50 text-xs text-gray-400 rounded border border-gray-600/50">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3 ml-6">
          {/* Upload & Create */}
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={onUpload}
              className="flex items-center space-x-2 px-4 py-2 bg-quantum-600 hover:bg-quantum-700 text-white rounded-lg font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </motion.button>
            
            <motion.button
              onClick={onCreateFolder}
              className="p-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>

          {/* View Mode */}
          <div className="flex items-center bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange({ ...viewMode, type: 'grid' })}
              className={`p-2 rounded-md transition-colors ${
                viewMode.type === 'grid' 
                  ? 'bg-quantum-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange({ ...viewMode, type: 'list' })}
              className={`p-2 rounded-md transition-colors ${
                viewMode.type === 'list' 
                  ? 'bg-quantum-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Filter */}
          <motion.button
            className="p-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            onClick={onThemeToggle}
            className="p-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>

          {/* Notifications */}
          <motion.button
            className="relative p-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-500 rounded-full animate-pulse" />
          </motion.button>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <User className="w-5 h-5" />
              <span className="text-sm font-medium">{user?.name}</span>
              <ChevronDown className="w-4 h-4" />
            </motion.button>

            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 bg-gray-900/90 backdrop-blur-xl border border-gray-800/50 rounded-xl shadow-lg z-50"
              >
                <div className="p-3 border-b border-gray-800/50">
                  <div className="text-sm font-medium text-white">{user?.name}</div>
                  <div className="text-xs text-gray-400">{user?.email}</div>
                </div>
                
                <div className="p-2">
                  <button
                    onClick={() => {
                      onOpenSettings();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};