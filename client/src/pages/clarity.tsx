import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Send, ThumbsUp, ThumbsDown, Sparkles, MoreVertical, Trash2, MessageCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatMessage } from "@shared/schema";

const SUGGESTION_CHIPS = [
  "Can I take ibuprofen?",
  "Side effects of metformin",
  "What does my A1C mean?",
  "Is it safe to skip a dose?",
  "Best time to take vitamins",
  "What foods interact with my meds?",
];

function ChatBubble({ message, onFeedback }: { message: ChatMessage; onFeedback: (id: number, fb: string) => void }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      data-testid={`chat-message-${message.id}`}
    >
      <div className={`max-w-[85%] ${isUser ? "order-last" : ""}`}>
        {/* Avatar for assistant */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles size={12} className="text-primary" />
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground">Clarity</span>
          </div>
        )}

        <div className={`px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
            : "bg-card border border-border rounded-2xl rounded-bl-md"
        }`}>
          {/* Render markdown-like content */}
          {message.content.split("\n").map((line, i) => {
            if (line.startsWith("---")) return <hr key={i} className="my-2 border-border opacity-30" />;
            if (line.startsWith("**") && line.endsWith("**")) {
              return <p key={i} className="font-semibold mt-1">{line.replace(/\*\*/g, "")}</p>;
            }
            if (line.startsWith("•") || line.startsWith("- ")) {
              return <p key={i} className="ml-2">{line}</p>;
            }
            if (line.startsWith("*") && line.endsWith("*")) {
              return <p key={i} className="text-xs text-muted-foreground italic mt-2">{line.replace(/\*/g, "")}</p>;
            }
            // Handle inline bold
            const parts = line.split(/\*\*(.*?)\*\*/g);
            if (parts.length > 1) {
              return (
                <p key={i} className={i > 0 ? "mt-1" : ""}>
                  {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
                </p>
              );
            }
            return line ? <p key={i} className={i > 0 ? "mt-1" : ""}>{line}</p> : <br key={i} />;
          })}
        </div>

        {/* Feedback buttons for assistant messages */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-1.5 ml-1">
            <button
              onClick={() => onFeedback(message.id, "thumbs_up")}
              className={`p-1 rounded transition-colors ${
                message.feedback === "thumbs_up" ? "text-primary" : "text-muted-foreground/40 hover:text-primary"
              }`}
              data-testid={`thumbs-up-${message.id}`}
            >
              <ThumbsUp size={13} />
            </button>
            <button
              onClick={() => onFeedback(message.id, "thumbs_down")}
              className={`p-1 rounded transition-colors ${
                message.feedback === "thumbs_down" ? "text-destructive" : "text-muted-foreground/40 hover:text-destructive"
              }`}
              data-testid={`thumbs-down-${message.id}`}
            >
              <ThumbsDown size={13} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ClarityPage() {
  const [input, setInput] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat"],
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/chat", { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat"] });
      setInput("");
    },
  });

  const sendFeedback = useMutation({
    mutationFn: async ({ id, feedback }: { id: number; feedback: string }) => {
      await apiRequest("PATCH", `/api/chat/${id}/feedback`, { feedback });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat"] });
    },
  });

  const clearChat = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/chat");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat"] });
      setShowMenu(false);
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
  };

  const handleSubmit = () => {
    if (!input.trim() || sendMessage.isPending) return;
    sendMessage.mutate(input.trim());
  };

  const handleChip = (text: string) => {
    sendMessage.mutate(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Count questions sent today
  const today = new Date().toISOString().split("T")[0];
  const questionsToday = messages.filter(
    m => m.role === "user" && m.createdAt.startsWith(today)
  ).length;
  const freeLimit = 1;
  const isLimitReached = questionsToday >= freeLimit;

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 7.5rem)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <h1 className="text-lg font-bold" data-testid="clarity-title">Clarity</h1>
          <p className="text-[11px] text-muted-foreground">Your health intelligence assistant</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            data-testid="clarity-menu"
          >
            <MoreVertical size={16} />
          </button>
          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-10 z-50 w-44 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
                >
                  <button
                    onClick={() => clearChat.mutate()}
                    className="w-full px-3 py-2.5 text-left text-sm flex items-center gap-2 text-destructive hover:bg-destructive/10 transition-colors"
                    data-testid="clear-chat-btn"
                  >
                    <Trash2 size={14} /> Clear conversation
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center" data-testid="clarity-empty">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageCircle size={28} className="text-primary" />
            </div>
            <h2 className="text-base font-bold mb-1">Ask me anything</h2>
            <p className="text-xs text-muted-foreground mb-6 max-w-[260px]">
              I know your medications and can give personalized health answers.
            </p>

            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2 justify-center max-w-sm">
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleChip(chip)}
                  className="px-3 py-2 bg-secondary text-secondary-foreground rounded-xl text-xs font-medium hover:bg-accent transition-colors"
                  data-testid={`chip-${chip.slice(0, 10).replace(/\s/g, "-")}`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              onFeedback={(id, fb) => sendFeedback.mutate({ id, feedback: fb })}
            />
          ))
        )}

        {/* Loading indicator */}
        {sendMessage.isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles size={12} className="text-primary animate-pulse" />
            </div>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Daily limit indicator */}
      <div className="px-4 py-1">
        <p className="text-[10px] text-center text-muted-foreground" data-testid="daily-limit">
          {isLimitReached ? "Daily limit reached · Upgrade for unlimited" : `${freeLimit - questionsToday} free question${freeLimit - questionsToday !== 1 ? "s" : ""} remaining today`}
        </p>
      </div>

      {/* Input bar */}
      <div className="border-t border-border px-4 py-3 bg-card">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={isLimitReached ? "Daily limit reached" : "Ask about your health..."}
            disabled={isLimitReached}
            rows={1}
            className="flex-1 resize-none py-2.5 px-4 rounded-2xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-40 max-h-24"
            style={{ minHeight: "40px" }}
            data-testid="clarity-input"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || sendMessage.isPending || isLimitReached}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 transition-opacity flex-shrink-0"
            data-testid="clarity-send"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
