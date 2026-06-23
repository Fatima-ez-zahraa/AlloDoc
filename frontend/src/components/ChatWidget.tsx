// src/components/ChatWidget.tsx
"use client";

import { useState } from "react";
import N8NClient from "@/lib/n8n-client";

export default function ChatWidget() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError("Message vide");
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Méthode 1 : Via le backend FastAPI (recommandé)
      const result = await N8NClient.sendChatMessage({
        message: message.trim(),
        user_id: "web-user-123", // remplacer par l'ID utilisateur réel
      });

      // Ou Méthode 2 : Directement au webhook N8N
      // const result = await N8NClient.sendChatMessageDirect(
      //   message.trim(),
      //   "web-user-123"
      // );

      setResponse(JSON.stringify(result, null, 2));
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 border rounded-lg">
      <h2 className="text-lg font-bold mb-4">Chat AlloDoc</h2>
      
      <form onSubmit={handleSendMessage} className="space-y-4">
        <div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tapez votre message..."
            disabled={loading}
            className="w-full p-2 border rounded-lg"
            rows={4}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded-lg disabled:bg-gray-400"
        >
          {loading ? "Envoi en cours..." : "Envoyer"}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          Erreur: {error}
        </div>
      )}

      {response && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">
          <pre className="text-xs overflow-auto">{response}</pre>
        </div>
      )}
    </div>
  );
}
