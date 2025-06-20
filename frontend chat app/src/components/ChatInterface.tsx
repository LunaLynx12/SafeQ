import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ContactsSidebar from "@/components/ContactsSidebar";
import ChatArea from "@/components/ChatArea";
import AnimatedBackground from "@/components/AnimatedBackground";

interface ChatInterfaceProps {
  user: {
    id: string;
    email: string;
    username?: string;
    token?: string;
  };
  onLogout: () => void;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
}

interface Conversation {
  user_id: number;
  username: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, onLogout }) => {
  const [selectedConversationId, setSelectedConversationId] =
    useState<number>(-1);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const selectedConversation =
    conversations.find((c) => c.user_id === selectedConversationId) ?? null;

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.warn("No auth token found");
        return;
      }

      const response = await fetch(
        `http://localhost:4000/messages/conversations/${user.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setConversations(data);

      const response2 = await fetch(
        `http://localhost:4000/messages/conversation_with/${user.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data2 = await response2.json();
      alert(JSON.stringify(data2["quantum_key_data"], null, 2));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchContacts();
  }, [user.id]);

  useEffect(() => {
    if (selectedConversationId < 0) return;

    async function fetchMessages() {
      try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch(
          `http://localhost:4000/messages/messages_with/${selectedConversationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch messages");

        const data: Message[] = await res.json();
        setMessages(data);
      } catch (error) {
        console.error(error);
        setMessages([]);
      }
    }
    fetchMessages();
  }, [selectedConversationId]);

  async function handleSendMessage(content: string) {
    if (!content.trim()) return;

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("No auth token");

      // Build message object to POST
      const newMessage = {
        receiver_id: selectedConversationId,
        content: content,
      };

      const res = await fetch(`http://localhost:4000/messages/send_message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newMessage),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const savedMessage = await res.json(); // backend should return saved message with id and timestamp

      // Update messages state locally with the new message
      setMessages((prev) => [...prev, savedMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  return (
    <div className="relative flex h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
      <AnimatedBackground />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex w-full h-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
      >
        {/* Contacts Sidebar - Fixed width */}
        <div className="w-80 flex-shrink-0 h-full">
          <ContactsSidebar
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
            user={user}
            onLogout={onLogout}
            onConversationsUpdated={fetchContacts}
          />
        </div>

        {/* Chat Area - Takes remaining space */}
        <div className="flex-1 h-full">
          {selectedConversation ? (
            <ChatArea
              messages={messages}
              currentUserId={user.id}
              conversation={selectedConversation}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ChatInterface;
