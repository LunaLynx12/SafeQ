import { useState, useCallback, useMemo } from 'react';
import { FileItem, SearchFilters, ViewMode, ShareLink } from '../types';

const mockFiles: FileItem[] = [
  {
    id: '1',
    name: 'Project Quantum',
    type: 'folder',
    createdAt: new Date('2024-01-15'),
    modifiedAt: new Date('2024-01-20'),
    isStarred: true,
    isShared: false,
    owner: 'you',
    path: '/Project Quantum',
    version: 1,
    encryptionStatus: 'encrypted',
    quantumKeyId: '1',
  },
  {
    id: '2',
    name: 'Design Assets',
    type: 'folder',
    createdAt: new Date('2024-01-10'),
    modifiedAt: new Date('2024-01-18'),
    isStarred: false,
    isShared: true,
    owner: 'you',
    path: '/Design Assets',
    version: 1,
    encryptionStatus: 'encrypted',
    quantumKeyId: '1',
  },
  {
    id: '3',
    name: 'quantum-report.pdf',
    type: 'file',
    size: 2456789,
    mimeType: 'application/pdf',
    createdAt: new Date('2024-01-12'),
    modifiedAt: new Date('2024-01-16'),
    isStarred: true,
    isShared: false,
    owner: 'you',
    path: '/quantum-report.pdf',
    version: 3,
    aiSuggestions: ['Archive', 'Share with team', 'Create summary'],
    encryptionStatus: 'encrypted',
    quantumKeyId: '1',
  },
  {
    id: '4',
    name: 'ui-mockups.fig',
    type: 'file',
    size: 15678901,
    mimeType: 'application/figma',
    createdAt: new Date('2024-01-08'),
    modifiedAt: new Date('2024-01-19'),
    isStarred: false,
    isShared: true,
    owner: 'you',
    path: '/ui-mockups.fig',
    version: 12,
    aiSuggestions: ['Export assets', 'Create presentation'],
    encryptionStatus: 'encrypted',
    quantumKeyId: '2',
  },
  {
    id: '5',
    name: 'neural-network.py',
    type: 'file',
    size: 45678,
    mimeType: 'text/x-python',
    createdAt: new Date('2024-01-05'),
    modifiedAt: new Date('2024-01-17'),
    isStarred: true,
    isShared: false,
    owner: 'you',
    path: '/neural-network.py',
    version: 8,
    aiSuggestions: ['Run analysis', 'Create documentation', 'Optimize code'],
    encryptionStatus: 'processing',
  },
  {
    id: '6',
    name: 'presentation.pptx',
    type: 'file',
    size: 8901234,
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    createdAt: new Date('2024-01-03'),
    modifiedAt: new Date('2024-01-14'),
    isStarred: false,
    isShared: true,
    owner: 'you',
    path: '/presentation.pptx',
    version: 5,
    aiSuggestions: ['Convert to PDF', 'Extract images'],
    encryptionStatus: 'unencrypted',
  },
];

interface ShareLinkOptions {
  permissions: 'view' | 'download' | 'edit';
  expiresAt?: Date;
  password?: string;
  maxAccess?: number;
}

export const useFileManager = () => {
  const [files, setFiles] = useState<FileItem[]>(mockFiles);
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>({ type: 'grid', size: 'medium' });
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({ query: '' });
  const [isUploading, setIsUploading] = useState(false);

  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      if (searchFilters.query) {
        const query = searchFilters.query.toLowerCase();
        if (!file.name.toLowerCase().includes(query)) return false;
      }
      
      if (searchFilters.type && searchFilters.type !== 'all') {
        if (searchFilters.type === 'files' && file.type !== 'file') return false;
        if (searchFilters.type === 'folders' && file.type !== 'folder') return false;
      }
      
      if (searchFilters.isStarred !== undefined && file.isStarred !== searchFilters.isStarred) {
        return false;
      }
      
      if (searchFilters.isShared !== undefined && file.isShared !== searchFilters.isShared) {
        return false;
      }

      return true;
    });
  }, [files, searchFilters]);

  const starredFiles = useMemo(() => files.filter(file => file.isStarred), [files]);
  const recentFiles = useMemo(() => 
    [...files].sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime()).slice(0, 10),
    [files]
  );

  const toggleStar = useCallback((fileId: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, isStarred: !file.isStarred } : file
    ));
  }, []);

  const deleteFiles = useCallback((fileIds: string[]) => {
    setFiles(prev => prev.filter(file => !fileIds.includes(file.id)));
    setSelectedFiles([]);
  }, []);

  const uploadFiles = useCallback(async (fileList: FileList) => {
    setIsUploading(true);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newFiles: FileItem[] = Array.from(fileList).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: 'file' as const,
      size: file.size,
      mimeType: file.type,
      createdAt: new Date(),
      modifiedAt: new Date(),
      isStarred: false,
      isShared: false,
      owner: 'you',
      path: `/${file.name}`,
      version: 1,
      encryptionStatus: 'processing',
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    setIsUploading(false);
  }, []);

  const createFolder = useCallback((name: string) => {
    const newFolder: FileItem = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      type: 'folder',
      createdAt: new Date(),
      modifiedAt: new Date(),
      isStarred: false,
      isShared: false,
      owner: 'you',
      path: `/${name}`,
      version: 1,
      encryptionStatus: 'encrypted',
      quantumKeyId: '1',
    };
    
    setFiles(prev => [...prev, newFolder]);
  }, []);

  const createShareLink = useCallback(async (fileId: string, options: ShareLinkOptions): Promise<ShareLink> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const shareLink: ShareLink = {
      id: Math.random().toString(36).substr(2, 9),
      fileId,
      url: `https://quantumdrive.com/s/${Math.random().toString(36).substr(2, 12)}`,
      expiresAt: options.expiresAt,
      accessCount: 0,
      maxAccess: options.maxAccess,
      password: options.password,
      permissions: options.permissions,
      createdAt: new Date(),
      createdBy: 'you',
    };

    // Update file to mark as shared
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { 
            ...file, 
            isShared: true,
            shareLinks: [...(file.shareLinks || []), shareLink]
          }
        : file
    ));

    return shareLink;
  }, []);

  return {
    files: filteredFiles,
    starredFiles,
    recentFiles,
    selectedFiles,
    viewMode,
    searchFilters,
    currentPath,
    isUploading,
    setSelectedFiles,
    setViewMode,
    setSearchFilters,
    setCurrentPath,
    toggleStar,
    deleteFiles,
    uploadFiles,
    createFolder,
    createShareLink,
  };
};