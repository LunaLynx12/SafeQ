export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  mimeType?: string;
  createdAt: Date;
  modifiedAt: Date;
  parentId?: string;
  isStarred: boolean;
  isShared: boolean;
  owner: string;
  thumbnailUrl?: string;
  path: string;
  version: number;
  aiSuggestions?: string[];
  encryptionStatus: 'encrypted' | 'unencrypted' | 'processing';
  quantumKeyId?: string;
  shareLinks?: ShareLink[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  storageUsed: number;
  storageLimit: number;
  aiApiKey?: string;
  quantumKeysEnabled: boolean;
  createdAt: Date;
}

export interface ShareLink {
  id: string;
  fileId: string;
  url: string;
  expiresAt?: Date;
  accessCount: number;
  maxAccess?: number;
  password?: string;
  permissions: 'view' | 'download' | 'edit';
  createdAt: Date;
  createdBy: string;
}

export interface ViewMode {
  type: 'grid' | 'list';
  size: 'small' | 'medium' | 'large';
}

export interface SearchFilters {
  query: string;
  type?: 'all' | 'files' | 'folders';
  dateRange?: {
    start: Date;
    end: Date;
  };
  owner?: string;
  isStarred?: boolean;
  isShared?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export interface QuantumKey {
  id: string;
  name: string;
  algorithm: 'CRYSTALS-Kyber' | 'CRYSTALS-Dilithium' | 'SPHINCS+';
  publicKey: string;
  createdAt: Date;
  isActive: boolean;
}