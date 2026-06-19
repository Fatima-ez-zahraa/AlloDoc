"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { apiFetch } from "@/lib/api";

type Message = {
  role: "assistant" | "user";
  content: string;
};

type ChatResponse = {
  status: string;
  reply: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Bonjour ! Je suis l'assistant virtuel AlloDoc. Comment puis-je vous aider aujourd'hui ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();

    if (!message || isSending) {
      return;
    }

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
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setError("Impossible de joindre le backend. Vérifiez que FastAPI tourne sur le port 8000.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <ArrowLeft className="h-5 w-5 text-slate-500" />
            <BrandLogo size="sm" />
          </Link>
          <Link href="/admin/dashboard" className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            Admin
          </Link>
        </div>
      </header>

      <section className="mx-auto flex max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-teal-700 p-5 sm:p-6 text-white">
            <h1 className="text-xl font-bold">Assistant AlloDoc</h1>
          </div>
          <div className="min-h-[60vh] space-y-4 overflow-y-auto bg-slate-50 p-5 sm:p-6">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={
                  message.role === "user"
                    ? "ml-auto max-w-[88%] rounded-3xl rounded-tr-none bg-teal-700 p-4 text-white shadow-sm sm:max-w-[70%]"
                    : "max-w-[88%] rounded-3xl rounded-tl-none bg-white p-4 text-slate-800 shadow-sm sm:max-w-[70%]"
                }
              >
                {message.content}
              </div>
            ))}
            {error ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t border-slate-100 bg-white p-4 sm:flex-row sm:p-5">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Écrivez votre message..."
              className="min-w-0 rounded-3xl border border-slate-200 p-3 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              disabled={isSending}
              className="inline-flex h-12 items-center justify-center rounded-3xl bg-teal-700 px-6 text-white transition hover:bg-teal-800 disabled:opacity-50"
              aria-label="Envoyer"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
