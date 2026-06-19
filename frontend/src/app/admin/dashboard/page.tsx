"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CalendarCheck, TrendingDown } from "lucide-react";
import { apiFetch } from "@/lib/api";

type DashboardResponse = {
  status: string;
  data: {
    absence_rate: number;
    appointments_today: number;
    high_risk_count: number;
    summary: string;
  };
};

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse["data"] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<DashboardResponse>("/api/v1/dashboard")
      .then((response) => {
        setDashboard(response.data);
        setError("");
      })
      .catch(() => {
        setError("Backend indisponible. Lancez FastAPI sur le port 8000.");
      });
  }, []);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-700">AlloDoc Admin</p>
        <h1 className="text-3xl font-bold text-slate-800">Tableau de bord</h1>
        <p className="text-slate-500">Vue synthétique des rendez-vous, risques et performances opérationnelles.</p>
      </div>

      {error ? (
        <div className="mb-6 rounded-lg border border-red-100 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
          <TrendingDown className="mb-4 h-6 w-6 text-teal-700" />
          <h2 className="text-sm font-medium text-slate-500">Taux d&apos;absence</h2>
          <p className="mt-2 text-4xl font-bold text-teal-600">
            {dashboard ? `${dashboard.absence_rate}%` : "..."}
          </p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
          <CalendarCheck className="mb-4 h-6 w-6 text-teal-700" />
          <h2 className="text-sm font-medium text-slate-500">Rendez-vous aujourd&apos;hui</h2>
          <p className="mt-2 text-4xl font-bold text-slate-800">
            {dashboard ? dashboard.appointments_today : "..."}
          </p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
          <AlertTriangle className="mb-4 h-6 w-6 text-red-500" />
          <h2 className="text-sm font-medium text-slate-500">Risque élevé détecté</h2>
          <p className="mt-2 text-4xl font-bold text-red-500">
            {dashboard ? dashboard.high_risk_count : "..."}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-slate-100 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Statistiques récentes</h2>
        <p className="mt-3 text-slate-600">
          {dashboard ? dashboard.summary : "Chargement des données depuis le backend..."}
        </p>
      </div>
    </div>
  );
}
