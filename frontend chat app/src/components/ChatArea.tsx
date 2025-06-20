import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Users,
  User,
} from "lucide-react";

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
}

interface Conversation {
  id: number;
  name: string;
}

interface ChatAreaProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (message: string) => void;
}

const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ChatArea: React.FC<ChatAreaProps> = ({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
}) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/20">
      {/* Chat Header */}
      <div className="flex-shrink-0 bg-white/5 p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            {/* Using Users icon as a placeholder since no avatar info */}
            <Users className="h-5 w-5 text-white" />
          </div>

          <div>
            <h2 className="font-semibold text-white">{conversation.name}</h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 text-white hover:text-slate-400 hover:bg-white/10 rounded-lg transition-colors">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-6">
          {messages.map((msg, index) => {
            const isMe = msg.sender_id.toString() === currentUserId.toString();

            // Show avatar if sender is different from previous message sender and not current user
            const showAvatar =
              !isMe &&
              (index === 0 || messages[index - 1].sender_id !== msg.sender_id);

            return (
              <motion.div
                key={msg.id}
                initial="hidden"
                animate="visible"
                variants={messageVariants}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex max-w-xs lg:max-w-md ${
                    isMe ? "flex-row-reverse" : "flex-row"
                  } items-end space-x-2`}
                >
                  {showAvatar && !isMe && (
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      {/* No avatar data in Message interface, fallback to icon */}
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}

                  <div className={`${showAvatar && !isMe ? "" : "ml-10"}`}>
                    {/* Removed sender name display (no group concept) */}

                    <div
                      className={`px-4 py-3 rounded-2xl shadow-sm ${
                        isMe
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-md"
                          : "bg-white/10 text-white rounded-bl-md border border-white/10"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>

                    <div
                      className={`flex items-center mt-1 space-x-1 ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span className="text-xs text-slate-400">
                        {msg.created_at}
                      </span>
                      {/* Removed msg.status logic because Message interface doesn't have it */}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 bg-white/5 p-4 border-t border-white/10">
        <div className="flex items-end space-x-3">
          <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <Paperclip className="h-5 w-5" />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={`Message ${conversation.name}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="w-full pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-400 focus:bg-black/10 focus:border-blue-500 transition-colors px-4"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
              <Smile className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
