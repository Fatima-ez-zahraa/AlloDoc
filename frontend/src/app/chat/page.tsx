"use client";

import Link from "next/link";
import { FormEvent, useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Sparkles, Globe, Target } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { apiFetch } from "@/lib/api";

type Message = {
  role: "assistant" | "user";
  content: string;
  metadata?: {
    language?: string;
    intent?: string;
    confidence?: number;
  };
};

type ChatResponse = {
  status: string;
  language: string;
  reply: string;
  ai_analysis: {
    intent: string;
    confidence: number;
  };
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Bonjour ! Je suis AlloDoc, votre assistant médical intelligent. Vous pouvez me parler en français, arabe, darija ou anglais. Comment puis-je vous aider ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();

    if (!message || isSending) return;

    setInput("");
    setError("");
    setIsSending(true);
    setMessages((current) => [...current, { role: "user", content: message }]);

    try {
      const data = await apiFetch<ChatResponse>("/api/v1/chat", {
        method: "POST",
        body: JSON.stringify({ message }),
      });

      setMessages((current) => [
        ...current,
        { 
          role: "assistant", 
          content: data.reply,
          metadata: {
            language: data.language,
            intent: data.ai_analysis?.intent,
            confidence: data.ai_analysis?.confidence
          }
        },
      ]);
    } catch {
      setError("Impossible de joindre le serveur. Vérifiez que FastAPI est lancé sur le port 8000.");
    } finally {
      setIsSending(false);
    }
  }

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case "fr": return "Français";
      case "ar": return "Arabe";
      case "darija": return "Darija";
      case "en": return "Anglais";
      default: return lang;
    }
  };

  const getIntentLabel = (intent: string) => {
    switch (intent) {
      case "BOOK_APPOINTMENT": return "Prise de RDV";
      case "CANCEL_APPOINTMENT": return "Annulation";
      case "GENERAL_QUESTION": return "Question";
      default: return "Inconnu";
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-brand-dark">
      <header className="sticky top-0 z-10 border-b border-white/5 bg-brand-dark/80 px-6 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-4 transition-transform hover:-translate-x-1">
            <ArrowLeft className="h-5 w-5 text-slate-400" />
            <BrandLogo className="h-14 w-auto" />
          </Link>
          <Link href="/admin/dashboard" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white">
            Espace Praticien
          </Link>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col p-4 sm:p-6 lg:p-8">
        <div className="flex min-h-[60vh] flex-1 flex-col overflow-hidden rounded-[2rem] border border-white/5 bg-brand-card shadow-2xl">
          <div className="flex items-center gap-3 border-b border-white/5 bg-white/5 p-5 sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-teal/20 text-brand-teal">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Assistant IA AlloDoc</h1>
              <p className="text-xs text-brand-teal">Assistant NLP multilingue</p>
            </div>
          </div>
          
          <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-3xl p-4 sm:max-w-[75%] ${
                    message.role === "user"
                      ? "rounded-tr-sm bg-brand-teal text-brand-dark shadow-lg shadow-brand-teal/20"
                      : "rounded-tl-sm border border-white/10 bg-brand-dark/50 text-slate-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
                
                {/* AI Metadata Badge (for demonstration purposes) */}
                {message.metadata && message.metadata.intent && (
                  <div className="mt-2 flex items-center gap-3 px-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3 text-slate-600" />
                      {getLanguageLabel(message.metadata.language || "")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3 text-slate-600" />
                      {getIntentLabel(message.metadata.intent)} 
                      {message.metadata.confidence && ` (${Math.round(message.metadata.confidence * 100)}%)`}
                    </span>
                  </div>
                )}
              </div>
            ))}
            {error ? (
              <div className="mx-auto w-fit rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-400">
                {error}
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-white/5 bg-white/5 p-4 sm:p-5">
            <div className="relative flex w-full items-center">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Tapez votre message (Darija, FR, AR, EN)..."
                className="w-full rounded-full border border-white/10 bg-brand-dark/50 py-4 pl-6 pr-16 text-white placeholder-slate-500 shadow-inner transition focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-teal text-brand-dark shadow-md transition hover:scale-105 hover:bg-teal-400 disabled:opacity-50 disabled:hover:scale-100"
                aria-label="Envoyer"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
