import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCard } from './FileCard';
import { FileItem, ViewMode } from '../../types';
import { Upload } from 'lucide-react';

interface FileGridProps {
  files: FileItem[];
  selectedFiles: string[];
  onSelectFile: (id: string) => void;
  onToggleStar: (id: string) => void;
  onCreateShareLink: (fileId: string, options: any) => Promise<any>;
  viewMode: ViewMode;
  isUploading: boolean;
  onUpload: (files: FileList) => void;
}

export const FileGrid: React.FC<FileGridProps> = ({
  files,
  selectedFiles,
  onSelectFile,
  onToggleStar,
  onCreateShareLink,
  viewMode,
  isUploading,
  onUpload,
}) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      onUpload(droppedFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (files.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex items-center justify-center"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Upload className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Drop files to upload</h3>
          <p className="text-gray-400 mb-6">
            Drag and drop files here, or click the upload button to get started
          </p>
          <div className="text-sm text-gray-500">
            Supported formats: All file types • Max size: 5GB per file
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className="flex-1 p-6"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Upload Overlay */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="bg-gray-900/90 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-quantum-gradient rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Uploading files...</h3>
              <p className="text-gray-400">Quantum processing in progress</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid/List Layout */}
      <motion.div
        layout
        className={
          viewMode.type === 'grid'
            ? `grid gap-4 ${
                viewMode.size === 'small' ? 'grid-cols-6' : 
                viewMode.size === 'large' ? 'grid-cols-3' : 'grid-cols-4'
              }`
            : 'space-y-2'
        }
      >
        <AnimatePresence mode="popLayout">
          {files.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              isSelected={selectedFiles.includes(file.id)}
              onSelect={onSelectFile}
              onToggleStar={onToggleStar}
              onCreateShareLink={onCreateShareLink}
              viewMode={viewMode.type}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};