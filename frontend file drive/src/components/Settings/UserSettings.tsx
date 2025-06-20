import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Key, 
  Shield, 
  Brain, 
  Save, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Copy,
  RefreshCw
} from 'lucide-react';
import { User as UserType, QuantumKey } from '../../types';

interface UserSettingsProps {
  user: UserType;
  onUpdateUser: (updates: Partial<UserType>) => void;
  onClose: () => void;
}

const mockQuantumKeys: QuantumKey[] = [
  {
    id: '1',
    name: 'Key Sharing Encryption Key',
    algorithm: 'CRYSTALS-Kyber',
    publicKey: 'kyber_pk_1a2b3c4d5e6f...',
    createdAt: new Date('2025-06-20'),
    isActive: true,
  },
  {
    id: '2',
    name: 'File Sharing Key',
    algorithm: 'CRYSTALS-Dilithium',
    publicKey: 'dilithium_pk_9z8y7x6w5v...',
    createdAt: new Date('2025-06-20'),
    isActive: true,
  },
];

export const UserSettings: React.FC<UserSettingsProps> = ({ user, onUpdateUser, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [aiApiKey, setAiApiKey] = useState(user.aiApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [quantumKeys] = useState<QuantumKey[]>(mockQuantumKeys);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  const handleSaveApiKey = () => {
    onUpdateUser({ aiApiKey });
  };

  const generateQuantumKey = async () => {
    setIsGeneratingKey(true);
    // Simulate key generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGeneratingKey(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'ai', label: 'AI Settings', icon: Brain },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'quantum', label: 'Quantum Keys', icon: Key },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-gray-800/30 border-r border-gray-700/50 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Settings</h2>
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-quantum-600/20 text-quantum-300 border border-quantum-600/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">Profile Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={user.name}
                      onChange={(e) => onUpdateUser({ name: e.target.value })}
                      className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-quantum-500/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      onChange={(e) => onUpdateUser({ email: e.target.value })}
                      className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-quantum-500/50"
                    />
                  </div>
                </div>

                <div className="bg-gray-800/30 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Storage Usage</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Used</span>
                      <span className="text-white">
                        {Math.round(user.storageUsed / (1024 ** 3))} GB of {Math.round(user.storageLimit / (1024 ** 3))} GB
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 bg-quantum-gradient rounded-full"
                        style={{ width: `${(user.storageUsed / user.storageLimit) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">AI Settings</h3>
                
                <div className="bg-gray-800/30 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Google AI API Key</h4>
                  <p className="text-gray-400 mb-4">
                    Add your Google AI API key to enable AI-powered features like file analysis, smart suggestions, and content extraction.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={aiApiKey}
                          onChange={(e) => setAiApiKey(e.target.value)}
                          placeholder="Enter your Google AI API key"
                          className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-quantum-500/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleSaveApiKey}
                      className="flex items-center space-x-2 px-4 py-2 bg-quantum-600 hover:bg-quantum-700 text-white rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save API Key</span>
                    </button>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-blue-400">How to get your API key</h5>
                      <p className="text-blue-300/80 text-sm mt-1">
                        Visit the Google AI Studio, create a new project, and generate an API key. 
                        Keep your key secure and never share it publicly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">Security Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800/30 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h4>
                    <p className="text-gray-400 mb-4">Add an extra layer of security to your account.</p>
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                      Enable 2FA
                    </button>
                  </div>
                  
                  <div className="bg-gray-800/30 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Login Sessions</h4>
                    <p className="text-gray-400 mb-4">Manage your active login sessions.</p>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                      View Sessions
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800/30 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Post-Quantum Encryption</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400">
                        Enable quantum-resistant encryption for your files using CRYSTALS-Kyber and Dilithium algorithms.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={user.quantumKeysEnabled}
                        onChange={(e) => onUpdateUser({ quantumKeysEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-quantum-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-quantum-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'quantum' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">Quantum Keys</h3>
                  <button
                    onClick={generateQuantumKey}
                    disabled={isGeneratingKey}
                    className="flex items-center space-x-2 px-4 py-2 bg-quantum-600 hover:bg-quantum-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isGeneratingKey ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingKey ? 'Generating...' : 'Generate New Key'}</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {quantumKeys.map((key) => (
                    <div key={key.id} className="bg-gray-800/30 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${key.isActive ? 'bg-green-400' : 'bg-gray-500'}`} />
                          <h4 className="text-lg font-semibold text-white">{key.name}</h4>
                          {key.isActive && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-400">{key.algorithm}</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Public Key
                          </label>
                          <div className="flex items-center space-x-2">
                            <code className="flex-1 bg-gray-900/50 px-3 py-2 rounded-lg text-sm text-gray-300 font-mono">
                              {key.publicKey}
                            </code>
                            <button className="p-2 text-gray-400 hover:text-white transition-colors">
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span>Created: {key.createdAt.toLocaleDateString()}</span>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span>Quantum-Safe</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-quantum-500/10 border border-quantum-500/20 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-quantum-400 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-quantum-400">Post-Quantum Security</h5>
                      <p className="text-quantum-300/80 text-sm mt-1">
                        These keys use quantum-resistant algorithms that remain secure even against quantum computer attacks.
                        Your files are encrypted with these keys before being stored.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-end mt-8 pt-6 border-t border-gray-700/50">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};