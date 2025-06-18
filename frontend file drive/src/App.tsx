import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { FileGrid } from './components/Files/FileGrid';
import { AIInsights } from './components/AI/AIInsights';
import { AuthPage } from './components/Auth/AuthPage';
import { UserSettings } from './components/Settings/UserSettings';
import { useFileManager } from './hooks/useFileManager';
import { useAuth } from './hooks/useAuth';

function App() {
  const [activeView, setActiveView] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const { isAuthenticated, user, loading, login, register, logout, updateUser } = useAuth();

  const {
    files,
    starredFiles,
    recentFiles,
    selectedFiles,
    viewMode,
    searchFilters,
    isUploading,
    setSelectedFiles,
    setViewMode,
    setSearchFilters,
    toggleStar,
    deleteFiles,
    uploadFiles,
    createFolder,
    createShareLink,
  } = useFileManager();

  const handleSelectFile = useCallback((id: string) => {
    setSelectedFiles(prev => 
      prev.includes(id) 
        ? prev.filter(fileId => fileId !== id)
        : [...prev, id]
    );
  }, [setSelectedFiles]);

  const handleUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        uploadFiles(files);
      }
    };
    input.click();
  }, [uploadFiles]);

  const handleCreateFolder = useCallback(() => {
    const name = prompt('Enter folder name:');
    if (name) {
      createFolder(name);
    }
  }, [createFolder]);

  const handleViewChange = useCallback((view: string) => {
    if (view === 'settings') {
      setShowSettings(true);
    } else {
      setActiveView(view);
    }
  }, []);

  const getViewData = () => {
    switch (activeView) {
      case 'starred':
        return starredFiles;
      case 'recent':
        return recentFiles;
      case 'shared':
        return files.filter(f => f.isShared);
      default:
        return files;
    }
  };

  const renderMainContent = () => {
    if (activeView === 'ai-insights') {
      return <AIInsights />;
    }

    return (
      <FileGrid
        files={getViewData()}
        selectedFiles={selectedFiles}
        onSelectFile={handleSelectFile}
        onToggleStar={toggleStar}
        onCreateShareLink={createShareLink}
        viewMode={viewMode}
        isUploading={isUploading}
        onUpload={uploadFiles}
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-quantum-gradient rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <p className="text-gray-400">Loading Quantum Drive...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthPage
        onLogin={login}
        onRegister={register}
        loading={loading}
      />
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-quantum-600/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyber-600/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-600/5 rounded-full blur-3xl animate-float" />
        </div>

        <div className="relative z-10 flex h-screen">
          {/* Sidebar */}
          <Sidebar
            activeView={activeView}
            onViewChange={handleViewChange}
            storageUsed={user?.storageUsed || 0}
            storageLimit={user?.storageLimit || 0}
          />

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header
              searchQuery={searchFilters.query}
              onSearchChange={(query) => setSearchFilters({ ...searchFilters, query })}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onUpload={handleUpload}
              onCreateFolder={handleCreateFolder}
              isDark={isDarkMode}
              onThemeToggle={() => setIsDarkMode(!isDarkMode)}
              user={user}
              onLogout={logout}
              onOpenSettings={() => setShowSettings(true)}
            />

            <main className="flex-1 overflow-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {renderMainContent()}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>

        {/* Settings Modal */}
        <AnimatePresence>
          {showSettings && user && (
            <UserSettings
              user={user}
              onUpdateUser={updateUser}
              onClose={() => setShowSettings(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;