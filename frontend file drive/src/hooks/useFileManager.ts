import { useState, useCallback, useMemo, useEffect } from 'react';
import { FileItem, SearchFilters, ViewMode, ShareLink } from '../types';
import axios from 'axios';

// Base API URL
const API_BASE_URL = 'http://127.0.0.1:4000/drive/get';
const UPLOAD_API_URL = 'http://127.0.0.1:4000/drive/save';

export const useFileManager = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>({ type: 'grid', size: 'medium' });
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({ query: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch files from backend on mount
  useEffect(() => {
    const fetchFiles = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token missing');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(API_BASE_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(response.data); // Debugging

        if (Array.isArray(response.data)) {
          // Parse and normalize each file
          const parsedFiles = response.data.map((file: any): FileItem => {
            // Safely parse dates
            const createdAt = file.createdAt ? new Date(file.createdAt) : new Date();
            const modifiedAt = file.modifiedAt ? new Date(file.modifiedAt) : new Date();

            // Provide fallbacks for missing fields
            return {
              id: String(file.id || Math.random().toString(36).substr(2, 9)),
              name: file.name || 'Untitled',
              type: file.type || 'file',
              size: file.size || 0,
              mimeType: file.mimeType || '',
              createdAt,
              modifiedAt,
              isStarred: Boolean(file.isStarred),
              isShared: Boolean(file.isShared),
              owner: file.owner || 'you',
              path: file.path || '/',
              version: Number(file.version) || 1,
              encryptionStatus: file.encryptionStatus || 'unencrypted',
              quantumKeyId: file.quantumKeyId || 'unknown',
              aiSuggestions: Array.isArray(file.aiSuggestions)
                ? file.aiSuggestions.slice(0, 1)
                : [],
              shareLinks: Array.isArray(file.shareLinks) ? file.shareLinks : [],
            };
          });

          setFiles(parsedFiles);
        } else {
          throw new Error('Unexpected data format');
        }
      } catch (err) {
        console.error('Failed to fetch files:', err);
        setError('Failed to load files');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const query = searchFilters.query.toLowerCase();
      if (searchFilters.query && !file.name.toLowerCase().includes(query)) return false;
      if (searchFilters.type === 'files' && file.type !== 'file') return false;
      if (searchFilters.type === 'folders' && file.type !== 'folder') return false;
      if (searchFilters.isStarred !== undefined && file.isStarred !== searchFilters.isStarred) return false;
      if (searchFilters.isShared !== undefined && file.isShared !== searchFilters.isShared) return false;
      return true;
    });
  }, [files, searchFilters]);

  const starredFiles = useMemo(() => files.filter(file => file.isStarred), [files]);

  const recentFiles = useMemo(() => {
    return [...files]
      .sort((a, b) => {
        if (!(a.modifiedAt instanceof Date)) {
          console.warn('Invalid modifiedAt for file', a);
          return 0;
        }
        if (!(b.modifiedAt instanceof Date)) {
          console.warn('Invalid modifiedAt for file', b);
          return 0;
        }
        return b.modifiedAt.getTime() - a.modifiedAt.getTime();
      })
      .slice(0, 10);
  }, [files]);

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

    const formData = new FormData();

    // Append each file to the form data
    for (let i = 0; i < fileList.length; i++) {
      formData.append('files', fileList[i]);
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token missing');
      }

      const response = await axios.post(
        UPLOAD_API_URL,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Add the uploaded files to state
      setFiles(prev => [...prev, ...response.data.newFiles]);
    } catch (err) {
      console.error('Failed to upload files:', err);
      setError('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
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
      aiSuggestions: [],
      shareLinks: [],
    };

    setFiles(prev => [...prev, newFolder]);
  }, []);

  const createShareLink = useCallback(async (fileId: string, options: any): Promise<ShareLink> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const shareLink: ShareLink = {
      id: Math.random().toString(36).substr(2, 9),
      fileId,
      url: `https://quantumdrive.com/s/${Math.random().toString(36).substr(2,  12)}`,
      expiresAt: options.expiresAt,
      accessCount: 0,
      maxAccess: options.maxAccess,
      password: options.password,
      permissions: options.permissions,
      createdAt: new Date(),
      createdBy: 'you',
    };

    setFiles(prev => prev.map(file =>
      file.id === fileId
        ? {
            ...file,
            isShared: true,
            shareLinks: [...(file.shareLinks || []), shareLink],
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
    isLoading,
    error,
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