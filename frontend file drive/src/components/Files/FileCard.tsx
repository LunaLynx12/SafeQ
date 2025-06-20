import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  File,
  Folder,
  Star,
  Share2,
  MoreVertical,
  Download,
  Trash2,
  FileText,
  Image,
  FileVideo,
  FileAudio,
  Code,
  Archive,
  Shield,
  ShieldCheck,
  Clock,
  Loader2,
} from 'lucide-react';
import { FileItem } from '../../types';
import { ShareModal } from './ShareModal';
import axios from 'axios';

interface FileCardProps {
  file: FileItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onToggleStar: (id: string) => void;
  onCreateShareLink: (fileId: string, options: any) => Promise<any>;
  viewMode: 'grid' | 'list';
}

const getFileIcon = (file: FileItem) => {
  if (file.type === 'folder') return Folder;

  if (!file.mimeType) return File;

  if (file.mimeType.startsWith('image/')) return Image;
  if (file.mimeType.startsWith('video/')) return FileVideo;
  if (file.mimeType.startsWith('audio/')) return FileAudio;
  if (file.mimeType.includes('pdf')) return FileText;
  if (
    file.mimeType.includes('text/') ||
    file.mimeType.includes('javascript') ||
    file.mimeType.includes('python')
  )
    return Code;
  if (file.mimeType.includes('zip') || file.mimeType.includes('archive')) return Archive;

  return File;
};

const getEncryptionIcon = (status: string) => {
  switch (status) {
    case 'encrypted':
      return <ShieldCheck className="w-3 h-3 text-green-400" />;
    case 'processing':
      return <Clock className="w-3 h-3 text-yellow-400 animate-pulse" />;
    default:
      return <Shield className="w-3 h-3 text-gray-400" />;
  }
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const FileCard: React.FC<FileCardProps> = ({
  file,
  isSelected,
  onSelect,
  onToggleStar,
  onCreateShareLink,
  viewMode,
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  const Icon = getFileIcon(file);
  const isFolder = file.type === 'folder';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setShowActionsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDownload = async () => {
    if (isFolder) return;
    
    setIsDownloading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await axios.get(
        `http://127.0.0.1:4000/drive/download_encrypted/${file.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name || 'download');
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // You might want to add toast notification here
    } finally {
      setIsDownloading(false);
      setShowActionsMenu(false);
    }
  };

  const ActionsMenu = () => (
    <div
      ref={actionMenuRef}
      className="absolute right-0 mt-2 w-32 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={handleDownload}
        disabled={isDownloading || isFolder}
        className={`w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 flex items-center space-x-2 ${
          isDownloading ? 'opacity-50 cursor-not-allowed' : ''
        } ${
          isFolder ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isDownloading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
      </button>
      <button
        onClick={() => {
          console.log('Delete', file.name);
          setShowActionsMenu(false);
        }}
        className="w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center space-x-2"
      >
        <Trash2 className="w-4 h-4" />
        <span>Delete</span>
      </button>
    </div>
  );

  const MoreButton = () => (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowActionsMenu((prev) => !prev);
        }}
        className="p-1 text-gray-400 hover:text-white rounded-md transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {showActionsMenu && <ActionsMenu />}
    </div>
  );

  if (viewMode === 'list') {
    return (
      <>
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center p-4 rounded-xl border transition-all duration-200 group cursor-pointer ${
            isSelected
              ? 'bg-quantum-600/20 border-quantum-500/50'
              : 'bg-gray-800/30 border-gray-700/30 hover:bg-gray-800/50 hover:border-gray-600/50'
          }`}
          onClick={() => onSelect(file.id)}
          whileHover={{ y: -2 }}
        >
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
              isFolder ? 'bg-cyber-600/20 text-cyber-400' : 'bg-gray-700/50 text-gray-300'
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0 ml-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-white font-medium truncate">{file.name}</h3>
              {getEncryptionIcon(file.encryptionStatus)}
            </div>
            {file.aiSuggestions && file.aiSuggestions.length > 0 && (
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-neon-400 rounded-full animate-pulse" />
                <span className="text-xs text-neon-400">{file.aiSuggestions[0]}</span>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 w-20 text-right">
            <span className="text-sm text-gray-400">{formatFileSize(file.size)}</span>
          </div>

          <div className="flex-shrink-0 flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(file.id);
              }}
              className={`p-1 rounded-md transition-colors ${
                file.isStarred ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
              }`}
            >
              <Star className="w-4 h-4" fill={file.isStarred ? 'currentColor' : 'none'} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowShareModal(true);
              }}
              className="p-1 text-gray-400 hover:text-blue-400 rounded-md transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <MoreButton />
          </div>
        </motion.div>

        {showShareModal && (
          <ShareModal
            file={file}
            onClose={() => setShowShareModal(false)}
            onCreateShareLink={onCreateShareLink}
          />
        )}
      </>
    );
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`group relative bg-gray-800/30 border border-gray-700/30 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:bg-gray-800/50 hover:border-gray-600/50 hover:shadow-lg ${
          isSelected ? 'ring-2 ring-quantum-500/50 bg-quantum-600/10' : ''
        }`}
        onClick={() => onSelect(file.id)}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
            isFolder ? 'bg-cyber-600/20 text-cyber-400' : 'bg-gray-700/50 text-gray-300'
          }`}
        >
          <Icon className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-white font-medium truncate flex-1">{file.name}</h3>
            {getEncryptionIcon(file.encryptionStatus)}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{formatFileSize(file.size)}</span>
          </div>

          {file.version > 1 && (
            <div className="text-xs text-quantum-400">v{file.version}</div>
          )}

          {file.aiSuggestions && file.aiSuggestions.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-neon-400 rounded-full animate-pulse" />
              <span className="text-xs text-neon-400 truncate">{file.aiSuggestions[0]}</span>
            </div>
          )}
        </div>

        <div className="absolute top-3 right-3 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar(file.id);
            }}
            className={`p-1 rounded-md transition-colors ${
              file.isStarred ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
            }`}
            >
            <Star className="w-4 h-4" fill={file.isStarred ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowShareModal(true);
            }}
            className="p-1 text-gray-400 hover:text-blue-400 rounded-md transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <MoreButton />
        </div>

        {file.isShared && (
          <div className="absolute bottom-3 right-3">
            <p>Shared</p>
          </div>
        )}
      </motion.div>

      {showShareModal && (
        <ShareModal
          file={file}
          onClose={() => setShowShareModal(false)}
          onCreateShareLink={onCreateShareLink}
        />
      )}
    </>
  );
};