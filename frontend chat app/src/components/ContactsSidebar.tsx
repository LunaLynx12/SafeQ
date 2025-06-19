import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Settings, LogOut, User, Users } from 'lucide-react';

interface Participant {
  id: number;
  name: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away';
}

interface Message {
  id: number;
  senderId: number;
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: number;
  name: string;
  isGroup: boolean;
  participants: Participant[];
  messages: Message[];
  lastMessage?: string;
  unreadCount?: number;
  lastSeen?: string;
}

interface ContactsSidebarProps {
  conversations: Conversation[];
  selectedConversationId: number;
  onSelectConversation: (id: number) => void;
  user: {
    id: string;
    email: string;
    username?: string;
    token?: string;
  };
  onLogout: () => void;
}

const ContactsSidebar: React.FC<ContactsSidebarProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  user,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conversation) =>
    conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/20 border-r border-white/10">
      {/* Header with User Info */}
      <div className="flex-shrink-0 p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-sm">
                {user.username || user.email}
              </h2>
              <p className="text-xs text-slate-400">Online</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <Settings className="h-4 w-4" />
            </button>
            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-400 focus:bg-black/10 focus:border-blue-500 transition-colors text-sm"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {filteredConversations.map((conversation) => (
            <motion.div
              key={conversation.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectConversation(conversation.id)}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 mb-1 ${
                selectedConversationId === conversation.id
                  ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30'
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    {conversation.isGroup ? (
                      <Users className="h-6 w-6 text-white" />
                    ) : conversation.participants[0]?.avatar ? (
                      <img
                        src={conversation.participants[0].avatar}
                        alt={conversation.participants[0].name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-white" />
                    )}
                  </div>
                  
                  {/* Status indicator for individual chats */}
                  {!conversation.isGroup && conversation.participants[0]?.status && (
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${getStatusColor(
                        conversation.participants[0].status
                      )}`}
                    />
                  )}
                </div>

                {/* Conversation Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white truncate text-sm">
                      {conversation.name}
                    </h3>
                    {conversation.lastSeen && (
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {conversation.lastSeen}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-slate-400 truncate">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unreadCount && conversation.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] text-center flex-shrink-0">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* New Chat Button */}
      <div className="flex-shrink-0 p-4 border-t border-white/10">
        <button className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
          <Plus className="h-4 w-4" />
          <span className="text-sm">New Chat</span>
        </button>
      </div>
    </div>
  );
};

export default ContactsSidebar;