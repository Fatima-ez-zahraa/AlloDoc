"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("userName", data.user.name);
        router.push("/admin/dashboard");
      } else {
        setError(data.detail || "Identifiants invalides");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-dark px-4">
      <div className="w-full max-w-md rounded-[2rem] border border-white/5 bg-brand-card p-8 shadow-2xl">
        <div className="mb-8 flex flex-col items-center">
          <BrandLogo size="sm" />
          <h1 className="mt-6 text-2xl font-bold text-white">Espace Professionnel</h1>
          <p className="mt-2 text-sm text-slate-400">Connectez-vous pour accéder à votre espace</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-sm font-medium text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Identifiant</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-brand-dark/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 transition focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                placeholder="réception, médecin ou admin"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-brand-dark/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 transition focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center rounded-full bg-brand-teal py-3.5 font-bold text-brand-dark transition-all hover:bg-teal-400 disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>Comptes de démonstration (identifiant = mot de passe) :</p>
          <p className="mt-1 font-mono text-slate-400">réception · médecin · admin</p>
        </div>
      </div>
    </div>
  );
}
