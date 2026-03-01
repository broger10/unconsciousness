"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { MarkdownText } from "@/components/markdown-text";

const premium = [0.16, 1, 0.3, 1] as const;

interface Message {
  id: string;
  userMessage: string | null;
  content: string;
  createdAt: string;
}

const suggestions = [
  { text: "Come sarà il mio mese?", icon: "&#9790;" },
  { text: "Perché mi sento così?", icon: "&#9670;" },
  { text: "Cosa non sto vedendo?", icon: "&#9681;" },
  { text: "Le mie sfide attuali", icon: "&#10038;" },
];

export default function ChiediPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((d) => {
        if (d.messages) setMessages(d.messages);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || sending) return;

    setInput("");
    setSending(true);

    // Optimistic: add user message immediately
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, userMessage: msg, content: "", createdAt: new Date().toISOString() },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();

      if (!res.ok) {
        const errorMsg = res.status === 402
          ? "Crediti esauriti. Passa a Premium dal tuo profilo per continuare."
          : data.error || "Errore nella risposta dell'oracolo.";
        setMessages((prev) =>
          prev.map((m) => m.id === tempId ? { ...m, content: errorMsg } : m)
        );
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? { ...m, id: data.id || tempId, content: data.response || "" }
              : m
          )
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? { ...m, content: "Errore di connessione. Riprova tra poco." }
            : m
        )
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: premium }}
        className="px-4 pt-6 pb-3"
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold font-display">L&apos;Oracolo</h1>
            <Link
              href="/visions"
              className="text-[10px] text-amber font-ui tracking-wide glass rounded-full px-3 py-1.5 hover:glow transition-all"
            >
              &#10038; Tre Visioni
            </Link>
          </div>
          <p className="text-text-muted text-xs font-ui">Le stelle ascoltano. Chiedi ci&ograve; che il cuore vuole sapere.</p>
        </div>
      </motion.div>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-2xl mx-auto">
          {/* Empty state with suggestions */}
          {messages.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ease: premium }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="text-5xl text-amber mb-6 breathe">&#10038;</div>
              <p className="text-text-secondary font-body italic text-lg text-center mb-8 max-w-xs">
                Ogni domanda che fai &egrave; un atto di coraggio cosmico.
              </p>
              <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                {suggestions.map((s) => (
                  <button
                    key={s.text}
                    onClick={() => send(s.text)}
                    className="glass rounded-xl p-3 text-left hover:glow hover:border-amber/10 transition-all duration-300 group"
                  >
                    <span className="text-amber text-sm group-hover:scale-110 inline-block transition-transform" dangerouslySetInnerHTML={{ __html: s.icon }} />
                    <p className="text-xs text-text-secondary font-ui mt-1">{s.text}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-4xl text-amber ember-pulse">&#10038;</div>
            </div>
          )}

          {/* Messages */}
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ease: premium }}
                className="mb-4"
              >
                {/* User message */}
                {msg.userMessage && (
                  <div className="flex justify-end mb-2">
                    <div className="max-w-[80%] glass rounded-2xl rounded-br-sm px-4 py-3 border border-amber/10">
                      <p className="text-sm text-text-primary font-body">{msg.userMessage}</p>
                    </div>
                  </div>
                )}
                {/* Oracle response */}
                {msg.content ? (
                  <div className="flex justify-start">
                    <div className="max-w-[85%]">
                      <div className="flex items-start gap-2">
                        <span className="text-amber text-sm shrink-0 mt-1">&#10038;</span>
                        <MarkdownText content={msg.content} className="text-sm text-text-secondary font-body italic leading-relaxed" />
                      </div>
                    </div>
                  </div>
                ) : sending && msg.id.startsWith("temp-") ? (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 py-2">
                      <span className="w-1.5 h-1.5 bg-amber/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-amber/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-amber/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      <span className="text-text-muted text-xs font-ui ml-1">L&apos;oracolo medita...</span>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Suggestion chips after messages exist */}
          {messages.length > 0 && !sending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mt-2"
            >
              {suggestions.map((s) => (
                <button
                  key={s.text}
                  onClick={() => send(s.text)}
                  className="shrink-0 glass rounded-full px-3 py-1.5 text-[10px] text-text-muted font-ui hover:text-amber hover:border-amber/10 transition-all"
                >
                  <span dangerouslySetInnerHTML={{ __html: s.icon }} /> {s.text}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Input area — fixed above tab bar */}
      <div className="sticky bottom-0 glass border-t border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Chiedi all'oracolo..."
            aria-label="Chiedi all'oracolo"
            rows={1}
            className="flex-1 bg-bg-surface rounded-xl px-4 py-3 text-sm text-text-primary font-body placeholder:text-text-muted resize-none border border-border/50 focus:border-amber/30 focus:outline-none transition-colors"
            style={{ maxHeight: "120px" }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || sending}
            className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              input.trim() && !sending
                ? "bg-amber text-bg-base dimensional"
                : "bg-bg-surface text-text-muted border border-border/50"
            }`}
          >
            <span className="text-sm">&#8593;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
