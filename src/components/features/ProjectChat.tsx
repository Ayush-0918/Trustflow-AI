"use client";

import { useEffect, useState, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Send, Activity, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { format } from "date-fns";

interface Message {
  id: string;
  text: string;
  sender_token?: string;
  timestamp: string;
  isMine: boolean;
}

export function ProjectChat({ projectId }: { projectId: number }) {
  const { socket, isConnected } = useSocket();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.emit("join_project", { project_id: projectId });

    socket.on("new_message", (data: any) => {
      const isMine = data.sender_token === useAuthStore.getState().token;
      setMessages((prev) => [...prev, { ...data, isMine, id: Math.random().toString(36).substr(2, 9) }]);
      scrollToBottom();
    });

    socket.on("user_typing", (data: any) => {
      if (data.token !== useAuthStore.getState().token) {
        setIsTyping(data.is_typing);
        if (data.is_typing) {
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
        }
      }
    });

    return () => {
      socket.emit("leave_project", { project_id: projectId });
      socket.off("new_message");
      socket.off("user_typing");
    };
  }, [socket, isConnected, projectId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socket) return;

    const newMsg = {
      id: Math.random().toString(36).substr(2, 9),
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
      isMine: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    socket.emit("send_message", { project_id: projectId, message: { text: newMsg.text } });
    setInputText("");
    scrollToBottom();
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (socket) {
      socket.emit("typing", { project_id: projectId, is_typing: true });
    }
  };

  return (
    <SpotlightCard className="flex flex-col h-[600px] border-white/[0.06] bg-black/40 backdrop-blur-3xl shadow-2xl rounded-3xl overflow-hidden relative">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
        <h2 className="text-sm font-cyber font-bold tracking-widest uppercase flex items-center gap-2 text-white/90">
          <Activity size={16} className={isConnected ? "text-emerald-400" : "text-gray-500"} />
          Secure Comms
        </h2>
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse shadow-[0_0_5px_#34d399]" : "bg-red-500"}`} />
           <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
             {isConnected ? "Connected" : "Disconnected"}
           </span>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-gray-500 font-mono text-xs uppercase tracking-widest opacity-50">
            End-to-End Encrypted Channel Established.<br/> Awaiting Transmissions.
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex flex-col ${msg.isMine ? "items-end" : "items-start"}`}
              >
                <div className="flex items-end gap-2 max-w-[80%]">
                  {!msg.isMine && (
                     <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 mb-1">
                       <User size={14} className="text-cyan-400" />
                     </div>
                  )}
                  <div>
                    <div className={`p-3 rounded-2xl text-sm font-mono backdrop-blur-md shadow-lg ${
                        msg.isMine 
                          ? "bg-purple-500/20 text-purple-100 border border-purple-500/30 rounded-br-sm" 
                          : "bg-cyan-500/10 text-cyan-100 border border-cyan-500/30 rounded-bl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className={`text-[9px] font-cyber text-gray-500 uppercase tracking-widest mt-1 block ${msg.isMine ? "text-right" : "text-left"}`}>
                      {format(new Date(msg.timestamp), "HH:mm")} {msg.isMine ? "• YOU" : ""}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-cyan-400/70">
             <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <User size={14} className="text-cyan-400" />
             </div>
             <div className="flex items-center gap-1 bg-cyan-500/10 p-3 rounded-2xl rounded-bl-sm border border-cyan-500/30">
               <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
               <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
               <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
             </div>
          </motion.div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white/[0.02] border-t border-white/[0.06] relative z-20">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={inputText}
            onChange={handleTyping}
            placeholder="Transmit secure message..."
            className="w-full bg-black/60 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
          <button 
            type="submit" 
            disabled={!inputText.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/40 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </SpotlightCard>
  );
}
