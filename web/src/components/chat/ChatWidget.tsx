"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage, DynamicToolUIPart } from "ai";
import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Sparkles, ExternalLink, AlertCircle, RefreshCw } from "lucide-react";
import { formatPrice } from "@/lib/data";

// ── Types ────────────────────────────────────────────────────────────────────

interface ServiceResult {
  id:         string;
  title:      string;
  base_price: number | null;
  location:   string | null;
  cover:      string | null;
  category:   { name: string; slug: string } | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const WELCOME_TEXT = "¡Hola! Soy Eva, tu asistente de Eventia 🎉\n¿Qué tipo de evento estás planeando?";

const WELCOME: UIMessage = {
  id:    "welcome",
  role:  "assistant",
  parts: [{ type: "text", text: WELCOME_TEXT }],
};

// ── Service mini-card ─────────────────────────────────────────────────────────

function ServiceCard({ s }: { s: ServiceResult }) {
  return (
    <a
      href={`/servicios/${s.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 hover:border-[#f39e10] hover:shadow-sm transition-all group"
    >
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {s.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.cover} alt={s.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">Sin foto</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-900 text-[13px] font-bold truncate leading-tight">{s.title}</p>
        {s.location && (
          <p className="text-gray-400 text-[11px] truncate mt-0.5">{s.location}</p>
        )}
        {s.category && (
          <p className="text-gray-500 text-[11px] mt-0.5">{s.category.name}</p>
        )}
        <p className="text-[#f39e10] text-[12px] font-black mt-1">
          {formatPrice(s.base_price)}
        </p>
      </div>
      <ExternalLink size={13} className="text-gray-300 group-hover:text-[#f39e10] shrink-0 transition-colors" />
    </a>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-end gap-1 px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-bl-sm w-fit">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: UIMessage }) {
  const isUser = msg.role === "user";

  const textParts = (msg.parts ?? []).filter(
    (p) => p.type === "text" && typeof (p as { text?: string }).text === "string"
  );

  const toolParts = (msg.parts ?? []).filter(
    (p): p is DynamicToolUIPart & { state: "output-available"; output: unknown } =>
      p.type === "dynamic-tool" &&
      (p as DynamicToolUIPart).toolName === "searchServices" &&
      (p as DynamicToolUIPart).state === "output-available"
  );

  if (textParts.length === 0 && toolParts.length === 0) return null;

  return (
    <div className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
      {textParts.map((part, i) => {
        const text = (part as { text: string }).text;
        if (!text.trim()) return null;
        return (
          <div
            key={i}
            className="max-w-[85%] px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap"
            style={{
              background:   isUser ? "#f39e10" : "#fff",
              color:        isUser ? "#fff" : "#1f2937",
              borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              border:       isUser ? "none" : "1px solid #e5e7eb",
            }}
          >
            {text}
          </div>
        );
      })}

      {toolParts.map((part, i) => {
        const result = (part.output as { services: ServiceResult[]; count: number } | undefined);
        const services = result?.services ?? [];
        return (
          <div key={`tool-${i}`} className="w-full flex flex-col gap-2 mt-1">
            {services.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-[12px] text-gray-500">
                No encontré servicios con esos criterios. ¿Quieres ampliar el presupuesto o cambiar de categoría?
              </div>
            ) : (
              services.map((s) => <ServiceCard key={s.id} s={s} />)
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status, setMessages, error } = useChat({
    messages: [WELCOME],
    onError: (err) => console.error("[Eva] chat error:", err),
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const handleReset = () => setMessages([WELCOME]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <>
      {/* ── Chat panel ──────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed bottom-[88px] right-6 z-[500] flex flex-col bg-white rounded-2xl overflow-hidden"
          style={{
            width: 360,
            height: 520,
            boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3.5 shrink-0"
            style={{ background: "linear-gradient(135deg, #f59e0b 0%, #e88e00 100%)" }}
          >
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles size={16} color="#fff" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-[14px] leading-tight">Eva</p>
              <p className="text-white/75 text-[11px]">Asistente de Eventia</p>
            </div>
            <button
              onClick={handleReset}
              title="Nueva conversación"
              className="text-white/60 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-1"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0.5"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-[#f8f9fb]">

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-3.5 py-3">
                <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-red-700 text-[12px] font-semibold">Eva no puede responder ahora</p>
                  <p className="text-red-500 text-[11px] mt-0.5">
                    {error.message.includes("503") || error.message.includes("GOOGLE")
                      ? "El chatbot no está configurado (falta GOOGLE_GENERATIVE_AI_API_KEY)."
                      : "Ocurrió un error. Intenta de nuevo."}
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {isLoading && (
              <div className="flex items-start">
                <TypingDots />
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2.5 px-3 py-3 border-t border-gray-100 bg-white shrink-0"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13px] outline-none transition-colors bg-[#f8f9fb]"
              style={{ fontFamily: "inherit" }}
              onFocus={(e)  => (e.target.style.borderColor = "#f39e10")}
              onBlur={(e)   => (e.target.style.borderColor = "#e5e7eb")}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center border-none cursor-pointer shrink-0 transition-all"
              style={{
                background: input.trim() && !isLoading ? "#f39e10" : "#f3f4f6",
                opacity:    isLoading ? 0.6 : 1,
              }}
            >
              <Send size={15} color={input.trim() && !isLoading ? "#fff" : "#9ca3af"} />
            </button>
          </form>
        </div>
      )}

      {/* ── Floating button ──────────────────────────────────────── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-[500] w-14 h-14 rounded-full flex items-center justify-center border-none cursor-pointer transition-all"
        style={{
          background: "linear-gradient(135deg, #f59e0b 0%, #e88e00 100%)",
          boxShadow:  "0 8px 24px rgba(243,158,16,0.5)",
        }}
        title="Hablar con Eva"
      >
        {open
          ? <X size={22} color="#fff" strokeWidth={2.5} />
          : <MessageCircle size={22} color="#fff" strokeWidth={2} />
        }
      </button>
    </>
  );
}
