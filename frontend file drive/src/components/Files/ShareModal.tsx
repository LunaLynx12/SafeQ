import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Share2, 
  Copy, 
  Calendar, 
  Lock, 
  Eye, 
  Download, 
  Edit,
  Users,
  Link,
  X,
  CheckCircle
} from 'lucide-react';
import { FileItem, ShareLink } from '../../types';

interface ShareModalProps {
  file: FileItem;
  onClose: () => void;
  onCreateShareLink: (fileId: string, options: ShareLinkOptions) => Promise<ShareLink>;
}

interface ShareLinkOptions {
  permissions: 'view' | 'download' | 'edit';
  expiresAt?: Date;
  password?: string;
  maxAccess?: number;
}

export const ShareModal: React.FC<ShareModalProps> = ({ file, onClose, onCreateShareLink }) => {
  const [permissions, setPermissions] = useState<'view' | 'download' | 'edit'>('view');
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [hasAccessLimit, setHasAccessLimit] = useState(false);
  const [maxAccess, setMaxAccess] = useState(10);
  const [shareLink, setShareLink] = useState<ShareLink | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    
    const options: ShareLinkOptions = {
      permissions,
      expiresAt: hasExpiry ? new Date(expiryDate) : undefined,
      password: hasPassword ? password : undefined,
      maxAccess: hasAccessLimit ? maxAccess : undefined,
    };
    
    try {
      const link = await onCreateShareLink(file.id, options);
      setShareLink(link);
    } catch (error) {
      console.error('Failed to create share link:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const permissionOptions = [
    { value: 'view', label: 'View Only', icon: Eye, description: 'Can view the file' },
    { value: 'download', label: 'Download', icon: Download, description: 'Can view and download' },
    { value: 'edit', label: 'Edit', icon: Edit, description: 'Can view, download, and edit' },
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
        className="bg-gray-900/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-quantum-gradient rounded-xl flex items-center justify-center">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Share File</h2>
                <p className="text-gray-400">{file.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!shareLink ? (
            <>
              {/* Permissions */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Access Permissions</h3>
                <div className="grid grid-cols-1 gap-3">
                  {permissionOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center space-x-3 p-4 rounded-xl border cursor-pointer transition-all ${
                          permissions === option.value
                            ? 'bg-quantum-600/20 border-quantum-500/50'
                            : 'bg-gray-800/30 border-gray-700/30 hover:border-gray-600/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="permissions"
                          value={option.value}
                          checked={permissions === option.value}
                          onChange={(e) => setPermissions(e.target.value as any)}
                          className="sr-only"
                        />
                        <Icon className="w-5 h-5 text-quantum-400" />
                        <div>
                          <div className="font-medium text-white">{option.label}</div>
                          <div className="text-sm text-gray-400">{option.description}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Advanced Options */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Advanced Options</h3>
                <div className="space-y-4">
                  {/* Expiry Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-white">Set Expiry Date</div>
                        <div className="text-sm text-gray-400">Link will expire automatically</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasExpiry}
                        onChange={(e) => setHasExpiry(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-quantum-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-quantum-600"></div>
                    </label>
                  </div>

                  {hasExpiry && (
                    <div className="ml-8">
                      <input
                        type="datetime-local"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-quantum-500/50"
                      />
                    </div>
                  )}

                  {/* Password Protection */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Lock className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-white">Password Protection</div>
                        <div className="text-sm text-gray-400">Require password to access</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasPassword}
                        onChange={(e) => setHasPassword(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-quantum-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-quantum-600"></div>
                    </label>
                  </div>

                  {hasPassword && (
                    <div className="ml-8">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-quantum-500/50"
                      />
                    </div>
                  )}

                  {/* Access Limit */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-white">Access Limit</div>
                        <div className="text-sm text-gray-400">Limit number of accesses</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasAccessLimit}
                        onChange={(e) => setHasAccessLimit(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-quantum-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-quantum-600"></div>
                    </label>
                  </div>

                  {hasAccessLimit && (
                    <div className="ml-8">
                      <input
                        type="number"
                        value={maxAccess}
                        onChange={(e) => setMaxAccess(parseInt(e.target.value))}
                        min="1"
                        max="1000"
                        className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-quantum-500/50 w-24"
                      />
                      <span className="ml-2 text-gray-400">accesses</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700/50">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateLink}
                  disabled={isGenerating}
                  className="flex items-center space-x-2 px-6 py-2 bg-quantum-600 hover:bg-quantum-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Link className="w-4 h-4" />
                  <span>{isGenerating ? 'Generating...' : 'Generate Link'}</span>
                </button>
              </div>
            </>
          ) : (
            /* Share Link Generated */
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Share Link Created</h3>
                <p className="text-gray-400">Your secure share link is ready to use</p>
              </div>

              <div className="bg-gray-800/30 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Link className="w-5 h-5 text-quantum-400" />
                  <span className="font-medium text-white">Share URL</span>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 bg-gray-900/50 px-3 py-2 rounded-lg text-sm text-gray-300 font-mono break-all">
                    {shareLink.url}
                  </code>
                  <button
                    onClick={handleCopyLink}
                    className={`p-2 rounded-lg transition-colors ${
                      copied ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Permission</div>
                  <div className="font-medium text-white capitalize">{shareLink.permissions}</div>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">Access Count</div>
                  <div className="font-medium text-white">
                    {shareLink.accessCount} / {shareLink.maxAccess || '∞'}
                  </div>
                </div>
              </div>

              {shareLink.expiresAt && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-medium">Expires:</span>
                    <span className="text-yellow-300">
                      {shareLink.expiresAt.toLocaleDateString()} at {shareLink.expiresAt.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};