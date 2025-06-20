import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Settings, LogOut, User, Check, X } from "lucide-react";

interface Conversation {
  user_id: number;
  username: string;
}

interface AvailableUser {
  id: number;
  username: string;
}

interface ContactsSidebarProps {
  conversations: Conversation[];
  selectedConversationId: number;
  onSelectConversation: (id: number) => void;
  user: {
    id: string;
    email: string;
    username?: string;
  };
  onLogout: () => void;
  // Add the new prop here
  onConversationsUpdated: () => void;
}

const ContactsSidebar: React.FC<ContactsSidebarProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  user,
  onLogout,
  // Destructure the new prop here
  onConversationsUpdated,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const [users, setUsers] = useState<AvailableUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AvailableUser | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");

  const displayName = user?.username || user?.email || "Unknown User";
  const displayStatus = "Online";

  const handleNewChatClick = async () => {
    if (selectedUser) {
      // Create chat with selected user
      await handleStartChat(selectedUser.id);
      setSelectedUser(null);
      setIsUserListOpen(false);
      return;
    }

    if (!user || !user.id) {
      console.warn("User ID is missing, cannot fetch available users");
      return;
    }

    setLoadingUsers(true);
    setIsUserListOpen(!isUserListOpen);

    if (!isUserListOpen) {
      try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch(
          `http://localhost:4000/messages/available_users/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users", err);
        setUsers([]);
      }
    }
    setLoadingUsers(false);
  };

  const handleStartChat = async (otherUserId: number) => {
    if (!otherUserId || typeof otherUserId !== "number") {
      console.error("Invalid otherUserId:", otherUserId);
      return;
    }
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(
        `http://localhost:4000/messages/start_conversation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            other_user_id: otherUserId,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to create conversation");

      const newConversation = await res.json();
      if (newConversation.receiver_id) {
        onSelectConversation(newConversation.receiver_id);
        onConversationsUpdated();
      } else {
        console.warn("No conversation ID received from backend");
      }

      setIsUserListOpen(false); // Close modal
    } catch (err) {
      console.error("Error starting chat:", err);
    }
  };

  const handleUserSelect = (user: AvailableUser) => {
    setSelectedUser(user);
    setIsUserListOpen(false);
  };

  const handleClearSelection = () => {
    setSelectedUser(null);
  };

  // Updated filtering to use username property
  const filteredUsers = users.filter((user) => {
    if (!user || !user.username) return false;
    return user.username.toLowerCase().includes(userSearchQuery.toLowerCase());
  });

  const filteredConversations = conversations.filter((conversation) => {
    if (!conversation || !conversation.username) return false;
    return conversation.username
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-black/20 border-r border-white/10 relative">
      {/* Header with User Info */}
      <div className="flex-shrink-0 bg-white/5 p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-sm">
                {displayName}
              </h2>
              <p className="text-xs text-slate-400">{displayStatus}</p>
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

        {/* Search Bar - Updated styling to match ChatArea */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-400 focus:bg-black/10 focus:border-blue-500 transition-colors text-sm"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {filteredConversations.map((conversation) => (
            <motion.div
              key={conversation.user_id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectConversation(conversation.user_id)}
              className={`p-3 rounded-2xl cursor-pointer transition-all duration-200 mb-1 shadow-sm ${
                selectedConversationId === conversation.user_id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "bg-white/10 hover:bg-white/15 border border-white/10"
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 bg-green-500" />
                </div>

                {/* Contact Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white truncate text-sm">
                      {conversation.username || "Unknown User"}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-slate-400 truncate">
                      No messages yet.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* User Selection Popup - Updated styling to match ChatArea */}
      <AnimatePresence>
        {isUserListOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-20 left-4 right-4 z-50"
          >
            <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-white/5 p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">
                    Start a new chat
                  </h3>
                  <button
                    onClick={() => setIsUserListOpen(false)}
                    className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Search Input - Updated styling to match ChatArea */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-400 focus:bg-black/10 focus:border-blue-500 transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Users List */}
              <div className="max-h-60 overflow-y-auto">
                {loadingUsers ? (
                  <div className="p-6 text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <p className="text-sm text-slate-400 mt-2">
                      Loading users...
                    </p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-slate-400">
                      {users.length === 0
                        ? "No users available"
                        : "No users found"}
                    </p>
                    {users.length > 0 && (
                      <p className="text-xs text-slate-500 mt-1">
                        Try adjusting your search
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {filteredUsers.map((user) => (
                      <motion.div
                        key={user.id}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleUserSelect(user)}
                        className="flex items-center space-x-3 p-3 rounded-2xl cursor-pointer bg-white/10 hover:bg-white/15 border border-white/10 transition-all duration-200 shadow-sm"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-white truncate block">
                            {user.username}
                          </span>
                          <span className="text-xs text-slate-400">
                            Available
                          </span>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected User Display - Updated styling to match ChatArea */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex-shrink-0 p-4 border-t border-white/10 bg-white/5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Selected User
              </span>
              <button
                onClick={handleClearSelection}
                className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-white/10 border border-white/10 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-white truncate">
                {selectedUser.username}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Chat Button - Updated styling to match ChatArea */}
      <div className="flex-shrink-0 bg-white/5 p-4 border-t border-white/10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNewChatClick}
          className={`w-full flex items-center justify-center space-x-2 py-3 font-semibold rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${
            selectedUser
              ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          }`}
        >
          {selectedUser ? (
            <>
              <Check className="h-4 w-4" />
              <span className="text-sm">Start Chat</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              <span className="text-sm">New Chat</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default ContactsSidebar;
