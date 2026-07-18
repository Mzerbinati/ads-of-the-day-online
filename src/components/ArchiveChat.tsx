"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

function ChatMark({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        className="archive-chat-icon"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <path
          d="M7 7l10 10M17 7L7 17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      className="archive-chat-icon"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
    >
      <path
        d="M8.5 22.5V12.8c0-2.4 1.9-4.3 4.3-4.3h6.4c2.4 0 4.3 1.9 4.3 4.3v5.2c0 2.4-1.9 4.3-4.3 4.3H12.2L8.5 25.2v-2.7z"
        fill="currentColor"
        fillOpacity="0.92"
      />
      <circle cx="22.8" cy="9.2" r="2.1" fill="currentColor" />
      <circle cx="26.2" cy="13.4" r="1.35" fill="currentColor" fillOpacity="0.75" />
      <circle cx="20.2" cy="6.4" r="1.1" fill="currentColor" fillOpacity="0.55" />
    </svg>
  );
}

export function ArchiveChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Ciao — posso aiutarti a ricordare le campagne già viste, i preferiti e a cercare brand o temi. Cosa ti serve?",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages, loading]);

  async function send(event?: FormEvent) {
    event?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: Message[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.filter(
            (m, i) => !(i === 0 && m.role === "assistant")
          ),
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        throw new Error(data.error || "Errore di risposta");
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply! },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore chat");
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <div className="archive-chat">
      {open && (
        <div
          className="archive-chat-panel glass-panel"
          role="dialog"
          aria-label="Chat archivio"
        >
          <div className="archive-chat-header">
            <div className="archive-chat-brand">
              <span className="archive-chat-brand-mark" aria-hidden>
                <ChatMark open={false} />
              </span>
              <div>
                <p className="label mb-1">Assistente locale</p>
                <p className="text-[14px] font-semibold text-text">
                  Archivio ADS
                </p>
              </div>
            </div>
            <button
              type="button"
              className="archive-chat-close"
              onClick={() => setOpen(false)}
              aria-label="Chiudi chat"
            >
              <ChatMark open />
            </button>
          </div>

          <div className="archive-chat-messages">
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className={
                  m.role === "user"
                    ? "archive-chat-bubble archive-chat-bubble-user"
                    : "archive-chat-bubble archive-chat-bubble-bot"
                }
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="archive-chat-bubble archive-chat-bubble-bot archive-chat-typing">
                Sto pensando…
              </div>
            )}
            {error && <div className="archive-chat-error">{error}</div>}
            <div ref={bottomRef} />
          </div>

          <form className="archive-chat-form" onSubmit={send}>
            <textarea
              ref={inputRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Es. cosa mi è piaciuto di Uber? oppure cerca Heineken…"
              className="glass-input archive-chat-input"
              disabled={loading}
            />
            <button
              type="submit"
              className="btn-glass archive-chat-send"
              disabled={loading || !input.trim()}
            >
              Invia
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className={`archive-chat-fab${open ? " is-open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Chiudi chat" : "Apri chat archivio"}
      >
        <span className="archive-chat-fab-glow" aria-hidden />
        <ChatMark open={open} />
      </button>
    </div>
  );
}
