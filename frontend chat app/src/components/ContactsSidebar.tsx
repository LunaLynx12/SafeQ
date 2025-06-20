import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Settings, LogOut, User, Users } from "lucide-react";

interface Conversation {
  id: number;
  name: string;
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
}

const ContactsSidebar: React.FC<ContactsSidebarProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  user,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [profileUsername, setProfileUsername] = useState<string>("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const [users, setUsers] = useState<Conversation[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  // Fetch username from profile endpoint

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:4000/auth/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const profileData = await response.json();
          setProfileUsername(profileData.username || profileData.name || "");
        } else {
          console.error("Failed to fetch profile:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const handleNewChatClick = async () => {
    setIsUserListOpen(true);
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("http://localhost:4000/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleStartChat = async (userId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(
        "http://localhost:4000/ de completat aici endpoint",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (!res.ok) throw new Error("Failed to create conversation");

      const newConversation = await res.json();
      // Call a prop to update the parent with the new conversation
      onSelectConversation(newConversation.id);
      setIsUserListOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Determine what to display as the user identifier
  const displayName = profileUsername || user.username || user.email;
  const displayStatus = isLoadingProfile ? "Loading..." : "Online";

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
          {conversations.map((conversation) => (
            <motion.div
              key={conversation.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectConversation(conversation.id)}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 mb-1 ${
                selectedConversationId === conversation.id
                  ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30"
                  : "hover:bg-white/5"
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>

                  {/* Optional: Static status dot */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 bg-green-500" />
                </div>

                {/* Contact Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white truncate text-sm">
                      {conversation.name}
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

      {/* New Chat Button */}
      <div className="flex-shrink-0 p-4 border-t border-white/10">
        <button
          onClick={handleNewChatClick}
          className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm">New Chat</span>
        </button>
        {isUserListOpen && (
          <div className="absolute z-50 bottom-16 left-4 right-4 bg-white rounded-lg shadow-xl p-4 space-y-2">
            <h3 className="text-sm font-semibold text-black">
              Start a new chat
            </h3>
            {loadingUsers ? (
              <p className="text-sm text-gray-500">Loading users...</p>
            ) : (
              <ul className="max-h-60 overflow-y-auto">
                {users.map((user) => (
                  <li
                    key={user.id}
                    onClick={() => handleStartChat(user.id)}
                    className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                      <User className="w-4 h-4 text-white mx-auto my-auto" />
                    </div>
                    <span className="text-sm text-black">{user.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsSidebar;
