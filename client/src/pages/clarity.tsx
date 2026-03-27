import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import * as api from "@/lib/api";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatMessage } from "@shared/schema";

const SUGGESTION_CHIPS = [
  "Can I take ibuprofen?",
  "Side effects of my meds",
  "What does my A1C mean?",
  "Is it safe to skip a dose?",
  "Best time to take vitamins",
  "Food interactions to know",
];

/* ─── Custom SVGs ─── */
function SparkleIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 L13.5 8.5 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 8.5 Z" />
      <path d="M19 2 L19.8 4.2 L22 5 L19.8 5.8 L19 8 L18.2 5.8 L16 5 L18.2 4.2 Z" strokeWidth="1.4" />
    </svg>
  );
}
function SendIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2 L11 13" />
      <path d="M22 2 L15 22 L11 13 L2 9 Z" />
    </svg>
  );
}
function ThumbUpIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14Z" />
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}
function ThumbDownIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10Z" />
      <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
    </svg>
  );
}
function TrashIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
  );
}
function DotsIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}
function BubbleHeartIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5 H20 C20.55 5 21 5.45 21 6 V15 C21 15.55 20.55 16 20 16 H8 L4 20 V6 C4 5.45 4.45 5 5 5 H4 Z" />
      <path d="M12 13 C12 13 9 11 9 9.5 C9 8.5 9.8 8 10.5 8 C11 8 11.6 8.3 12 8.8 C12.4 8.3 13 8 13.5 8 C14.2 8 15 8.5 15 9.5 C15 11 12 13 12 13 Z" fill="currentColor" fillOpacity="0.4" />
    </svg>
  );
}

/* ─── Chat Bubble ─── */
function ChatBubble({ message, onFeedback }: { message: ChatMessage; onFeedback: (id: number, fb: string) => void }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      data-testid={`chat-message-${message.id}`}
    >
      <div className={`max-w-[85%] ${isUser ? "order-last" : ""}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <SparkleIcon size={12} />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground tracking-wide">CLARITY</span>
          </div>
        )}

        <div className={`px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
            : "bg-card border border-border rounded-2xl rounded-bl-md text-foreground"
        }`}>
          {message.content.split("\n").map((line, i) => {
            if (line.startsWith("---")) return <hr key={i} className="my-2 border-border opacity-30" />;
            if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold mt-1">{line.replace(/\*\*/g, "")}</p>;
            if (line.startsWith("•") || line.startsWith("- ")) return <p key={i} className="ml-2 mt-0.5">{line}</p>;
            if (line.startsWith("*") && line.endsWith("*")) return <p key={i} className="text-xs opacity-70 italic mt-2">{line.replace(/\*/g, "")}</p>;
            const parts = line.split(/\*\*(.*?)\*\*/g);
            if (parts.length > 1) return (
              <p key={i} className={i > 0 ? "mt-1" : ""}>
                {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
              </p>
            );
            return line ? <p key={i} className={i > 0 ? "mt-1" : ""}>{line}</p> : <br key={i} />;
          })}
        </div>

        {!isUser && (
          <div className="flex items-center gap-2 mt-1.5 ml-1">
            <button
              onClick={() => onFeedback(message.id, "thumbs_up")}
              className={`p-1 rounded-lg transition-colors ${message.feedback === "thumbs_up" ? "text-primary bg-primary/10" : "text-muted-foreground/40 hover:text-primary"}`}
              data-testid={`thumbs-up-${message.id}`}
            >
              <ThumbUpIcon size={13} />
            </button>
            <button
              onClick={() => onFeedback(message.id, "thumbs_down")}
              className={`p-1 rounded-lg transition-colors ${message.feedback === "thumbs_down" ? "text-destructive bg-destructive/10" : "text-muted-foreground/40 hover:text-destructive"}`}
              data-testid={`thumbs-down-${message.id}`}
            >
              <ThumbDownIcon size={13} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Clarity Page ─── */
export default function ClarityPage() {
  const [input, setInput] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["chat"],
    queryFn: () => api.getChatMessages(),
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => api.sendChatMessage(content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat"] });
      setInput("");
    },
  });

  const sendFeedback = useMutation({
    mutationFn: async ({ id, feedback }: { id: number; feedback: string }) => {
      await api.updateChatFeedback(id, feedback);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chat"] }),
  });

  const clearChatMut = useMutation({
    mutationFn: async () => { await api.clearChat(); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat"] });
      setShowMenu(false);
    },
  });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
  };

  const handleSubmit = () => {
    if (!input.trim() || sendMessage.isPending) return;
    sendMessage.mutate(input.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const today = new Date().toISOString().split("T")[0];
  const questionsToday = messages.filter(m => m.role === "user" && m.created_at.startsWith(today)).length;
  const freeLimit = 1;
  const isLimitReached = questionsToday >= freeLimit;
  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 7.5rem)" }}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <h1 className="text-lg font-bold text-foreground" style={{ letterSpacing: "-0.02em" }} data-testid="clarity-title">Clarity</h1>
          <p className="text-[11px] text-muted-foreground font-medium">Your health intelligence assistant</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-9 h-9 rounded-full hover:bg-secondary transition-colors flex items-center justify-center text-muted-foreground"
            data-testid="clarity-menu"
          >
            <DotsIcon size={16} />
          </button>
          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute right-0 top-11 z-50 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
                >
                  <button
                    onClick={() => clearChatMut.mutate()}
                    className="w-full px-4 py-3 text-left text-sm flex items-center gap-2.5 text-destructive hover:bg-destructive/10 transition-colors"
                    data-testid="clear-chat-btn"
                  >
                    <TrashIcon size={14} /> Clear conversation
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Messages ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center"
            data-testid="clarity-empty"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
              <BubbleHeartIcon size={30} />
            </div>
            <h2 className="text-base font-bold mb-1 text-foreground">Ask me anything</h2>
            <p className="text-xs text-muted-foreground mb-6 max-w-[260px] leading-relaxed">
              I know your medications and give personalized, honest health answers.
            </p>

            <div className="flex flex-wrap gap-2 justify-center max-w-sm">
              {SUGGESTION_CHIPS.map((chip) => (
                <motion.button
                  key={chip}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => sendMessage.mutate(chip)}
                  className="px-3 py-2 bg-card border border-border text-secondary-foreground rounded-xl text-xs font-medium hover:bg-secondary hover:border-primary/30 transition-all"
                  data-testid={`chip-${chip.slice(0, 10).replace(/\s/g, "-")}`}
                >
                  {chip}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              onFeedback={(id, fb) => sendFeedback.mutate({ id, feedback: fb })}
            />
          ))
        )}

        {sendMessage.isPending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <SparkleIcon size={11} />
            </div>
            <div className="flex gap-1.5 items-center">
              {[0, 150, 300].map((delay, i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: delay / 1000 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Daily limit ── */}
      <div className="px-4 py-1">
        <p className="text-[10px] text-center text-muted-foreground" data-testid="daily-limit">
          {isLimitReached ? "Daily limit reached · Upgrade for unlimited" : `${freeLimit - questionsToday} free question${freeLimit - questionsToday !== 1 ? "s" : ""} remaining today`}
        </p>
      </div>

      {/* ── Input bar ── */}
      <div className="border-t border-border px-4 py-3 bg-card/95 backdrop-blur-sm">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={isLimitReached ? "Daily limit reached" : "Ask about your health..."}
            disabled={isLimitReached}
            rows={1}
            className="flex-1 resize-none py-2.5 px-4 rounded-2xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-40 max-h-24 leading-relaxed"
            style={{ minHeight: "44px" }}
            data-testid="clarity-input"
          />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleSubmit}
            disabled={!input.trim() || sendMessage.isPending || isLimitReached}
            className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 transition-opacity flex-shrink-0"
            data-testid="clarity-send"
          >
            <SendIcon size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
