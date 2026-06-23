"use client";

import { useEffect, useState } from "react";
import { Users, Clock, Zap, Star, DollarSign, TrendingDown, Brain, UserPlus } from "lucide-react";
import { apiFetch } from "@/lib/api";

type KpiData = {
  total_patients: number;
  new_patients_month: number;
  avg_wait_time_min: number;
  ai_response_time_ms: number;
  automation_rate: number;
  satisfaction_score: number;
  revenue_saved_monthly: number;
  no_show_reduction: number;
};

export default function KpiPage() {
  const [kpi, setKpi] = useState<KpiData | null>(null);

  useEffect(() => {
    apiFetch<{ data: KpiData }>("/api/v1/kpi")
      .then((r) => setKpi(r.data))
      .catch(() => {});
  }, []);

  if (!kpi) {
    return <div className="flex items-center justify-center p-20 text-slate-400">Chargement des KPI...</div>;
  }

  const kpis = [
    { icon: Users, label: "Patients totaux", value: kpi.total_patients.toLocaleString(), color: "text-brand-teal", bg: "bg-brand-teal/10" },
    { icon: UserPlus, label: "Nouveaux ce mois", value: `+${kpi.new_patients_month}`, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { icon: Clock, label: "Temps d'attente moy.", value: `${kpi.avg_wait_time_min} min`, color: "text-amber-400", bg: "bg-amber-500/10" },
    { icon: Brain, label: "Réponse IA", value: `${kpi.ai_response_time_ms} ms`, color: "text-purple-400", bg: "bg-purple-500/10" },
    { icon: Zap, label: "Taux d'automatisation", value: `${kpi.automation_rate}%`, color: "text-brand-teal", bg: "bg-brand-teal/10" },
    { icon: Star, label: "Satisfaction patient", value: `${kpi.satisfaction_score}/5`, color: "text-amber-400", bg: "bg-amber-500/10" },
    { icon: DollarSign, label: "Économie mensuelle", value: `${(kpi.revenue_saved_monthly / 1000).toFixed(1)}k MAD`, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { icon: TrendingDown, label: "Réduction No-Show", value: `−${kpi.no_show_reduction}%`, color: "text-red-400", bg: "bg-red-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Indicateurs Clés (KPI)</h1>
        <p className="text-sm text-slate-400">Performance globale de la plateforme AlloDoc</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-brand-card p-6 shadow-xl transition-all hover:border-brand-teal/20 hover:shadow-brand-teal/5">
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg}`}>
                <Icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <p className="text-sm font-medium text-slate-400">{item.label}</p>
              <p className={`mt-1 text-3xl font-bold ${item.color}`}>{item.value}</p>
              
              {/* Decorative gradient */}
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-brand-teal/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          );
        })}
      </div>

      {/* Automation highlight */}
      <div className="rounded-[2rem] border border-brand-teal/20 bg-brand-teal/5 p-6 shadow-xl sm:p-8">
        <h2 className="mb-4 text-lg font-bold text-white">Impact de l'Automatisation IA + n8n</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-white/5 bg-brand-dark/50 p-4 text-center">
            <p className="text-3xl font-bold text-brand-teal">{kpi.automation_rate}%</p>
            <p className="mt-1 text-xs text-slate-400">des RDV gérés sans intervention humaine</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-brand-dark/50 p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">{(kpi.revenue_saved_monthly / 1000).toFixed(1)}k MAD</p>
            <p className="mt-1 text-xs text-slate-400">économisés par mois (temps + personnel)</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-brand-dark/50 p-4 text-center">
            <p className="text-3xl font-bold text-red-400">−{kpi.no_show_reduction}%</p>
            <p className="mt-1 text-xs text-slate-400">de réduction des absences non justifiées</p>
          </div>
        </div>
      </div>
    </div>
  );
}
