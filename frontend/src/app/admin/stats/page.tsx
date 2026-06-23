"use client";

import { useEffect, useState } from "react";
import { BarChart3, Globe, MessageSquare, Zap, TrendingDown } from "lucide-react";
import { apiFetch } from "@/lib/api";

type StatsData = {
  weekly_appointments: number[];
  labels: string[];
  channels: Record<string, number>;
  languages: Record<string, number>;
  intents: Record<string, number>;
  no_show_trend: number[];
  no_show_labels: string[];
};

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    apiFetch<{ data: StatsData }>("/api/v1/stats")
      .then((r) => setStats(r.data))
      .catch(() => {});
  }, []);

  const maxAppointments = stats ? Math.max(...stats.weekly_appointments) : 1;
  const maxNoShow = stats ? Math.max(...stats.no_show_trend) : 1;

  const channelColors: Record<string, string> = { whatsapp: "bg-emerald-500", web: "bg-brand-teal", phone: "bg-purple-500" };
  const langLabels: Record<string, string> = { fr: "Français", darija: "Darija", ar: "Arabe", en: "Anglais" };
  const intentLabels: Record<string, string> = { BOOK_APPOINTMENT: "Prise RDV", CANCEL_APPOINTMENT: "Annulation", GENERAL_QUESTION: "Question", UNKNOWN: "Autre" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Statistiques</h1>
        <p className="text-sm text-slate-400">Analyse des données collectées par l'IA et les automatisations n8n</p>
      </div>

      {!stats ? (
        <div className="flex items-center justify-center p-20 text-slate-400">Chargement...</div>
      ) : (
        <>
          {/* Weekly Appointments Bar Chart */}
          <div className="rounded-[2rem] border border-white/5 bg-brand-card p-6 shadow-xl sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-brand-teal" />
              <h2 className="text-lg font-bold text-white">Rendez-vous cette semaine</h2>
            </div>
            <div className="flex items-end justify-between gap-3 h-48">
              {stats.weekly_appointments.map((val, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-bold text-brand-teal">{val}</span>
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-brand-teal/80 to-brand-teal transition-all duration-700"
                    style={{ height: `${(val / maxAppointments) * 100}%`, minHeight: 8 }}
                  />
                  <span className="text-xs text-slate-500">{stats.labels[i]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Channels Distribution */}
            <div className="rounded-[2rem] border border-white/5 bg-brand-card p-6 shadow-xl">
              <div className="mb-5 flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-brand-teal" />
                <h2 className="text-lg font-bold text-white">Canaux de réservation</h2>
              </div>
              <div className="space-y-4">
                {Object.entries(stats.channels).map(([channel, pct]) => (
                  <div key={channel} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize text-slate-300">{channel === "whatsapp" ? "WhatsApp" : channel === "web" ? "Chat Web" : "Téléphone"}</span>
                      <span className="font-bold text-white">{pct}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-brand-dark">
                      <div className={`h-full rounded-full ${channelColors[channel]} transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Language Distribution */}
            <div className="rounded-[2rem] border border-white/5 bg-brand-card p-6 shadow-xl">
              <div className="mb-5 flex items-center gap-3">
                <Globe className="h-5 w-5 text-brand-teal" />
                <h2 className="text-lg font-bold text-white">Langues détectées (NLP)</h2>
              </div>
              <div className="space-y-4">
                {Object.entries(stats.languages).map(([lang, pct]) => (
                  <div key={lang} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-300">{langLabels[lang] || lang}</span>
                      <span className="font-bold text-white">{pct}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-brand-dark">
                      <div className="h-full rounded-full bg-brand-teal transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Intent Classification */}
            <div className="rounded-[2rem] border border-white/5 bg-brand-card p-6 shadow-xl">
              <div className="mb-5 flex items-center gap-3">
                <Zap className="h-5 w-5 text-brand-teal" />
                <h2 className="text-lg font-bold text-white">Classification d'intention (IA)</h2>
              </div>
              <div className="space-y-4">
                {Object.entries(stats.intents).map(([intent, pct]) => (
                  <div key={intent} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-300">{intentLabels[intent] || intent}</span>
                      <span className="font-bold text-white">{pct}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-brand-dark">
                      <div className="h-full rounded-full bg-cyan-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* No-Show Trend */}
            <div className="rounded-[2rem] border border-white/5 bg-brand-card p-6 shadow-xl">
              <div className="mb-5 flex items-center gap-3">
                <TrendingDown className="h-5 w-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Tendance No-Show (%)</h2>
              </div>
              <div className="flex items-end justify-between gap-3 h-36">
                {stats.no_show_trend.map((val, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-bold text-red-400">{val}%</span>
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-red-500/60 to-red-400 transition-all duration-700"
                      style={{ height: `${(val / maxNoShow) * 100}%`, minHeight: 8 }}
                    />
                    <span className="text-xs text-slate-500">{stats.no_show_labels[i]}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-xs text-emerald-400">↓ Réduction de 33% depuis le déploiement de l'IA</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
