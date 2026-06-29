"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useAuthStore } from "@/store/authStore";
import { projectsAPI } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

interface Message {
  id: number;
  content: string;
  sender_id: number;
  sender: { username: string; avatar_url: string | null };
  created_at: string;
  message_type: string;
}

export function ProjectChat({ projectId }: { projectId: number }) {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Fetch message history
  const { data, isLoading } = useQuery({
    queryKey: ["messages", projectId],
    queryFn: () => projectsAPI.getMessages(projectId).then((r) => r.data as Message[]),
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => projectsAPI.sendMessage(projectId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", projectId] });
    },
  });

  // Socket.io setup
  useEffect(() => {
    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.emit("join_project", { project_id: projectId });

    socket.on("new_message", () => {
      queryClient.invalidateQueries({ queryKey: ["messages", projectId] });
    });

    return () => { socket.disconnect(); };
  }, [projectId, token, queryClient]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data]);

  function handleSend() {
    const content = input.trim();
    if (!content) return;

    // Optimistic: emit via socket for real-time
    socketRef.current?.emit("send_message", {
      project_id: projectId,
      message: { content, sender_id: user?.id },
    });

    sendMutation.mutate(content);
    setInput("");
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <h3 className="text-sm font-semibold">Real-time Chat</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-muted/10">
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-muted-foreground" size={20} />
          </div>
        )}

        <AnimatePresence initial={false}>
          {data?.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900 dark:to-brand-800 flex items-center justify-center text-xs font-bold text-brand-700 dark:text-brand-300 shrink-0 shadow-sm">
                  {msg.sender?.username?.[0]?.toUpperCase()}
                </div>
                <div className={`max-w-[75%] space-y-1 ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      isMe
                        ? "bg-brand-600 text-white rounded-tr-sm"
                        : "bg-secondary text-foreground rounded-tl-sm border"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground px-1 font-medium">
                    {format(new Date(msg.created_at), "HH:mm")}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-card border-t">
        <div className="flex gap-2 bg-muted/30 p-1.5 rounded-xl border focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-transparent px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sendMutation.isPending}
            className="btn-primary px-4 py-1.5 rounded-lg h-9"
          >
            {sendMutation.isPending
              ? <Loader2 size={16} className="animate-spin" />
              : <Send size={16} />
            }
          </button>
        </div>
      </div>
    </div>
  );
}
