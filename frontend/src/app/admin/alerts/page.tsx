"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Phone, Check, X } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Alert = {
  id: string;
  patient: string;
  reason: string;
  time: string;
  action: string;
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState("");

  const fetchAlerts = () => {
    apiFetch<{ data: Alert[] }>("/api/v1/alerts")
      .then((res) => {
        setAlerts(res.data);
      })
      .catch(() => {
        setError("Impossible de charger les alertes.");
      });
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCancel = async (id: string) => {
    try {
      await apiFetch(`/api/v1/appointments/${id}/cancel`, { method: "DELETE" });
      fetchAlerts();
    } catch {
      setError("Erreur lors de l'annulation du rendez-vous.");
    }
  };

  const handleResolve = async (id: string) => {
    setAlerts((current) => current.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Alertes & No-Shows</h1>
        <p className="text-sm text-slate-400">Actions urgentes détectées par l'Intelligence Artificielle</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex flex-col gap-4 rounded-[2rem] border border-red-500/20 bg-red-500/5 p-6 shadow-xl sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white">{alert.patient} <span className="text-sm font-normal text-slate-400">({alert.time})</span></h3>
                <p className="mt-1 text-sm text-red-400">{alert.reason}</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                  Action recommandée : {alert.action}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <a 
                href={`tel:${alert.id}`} 
                className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-dark text-slate-400 transition hover:bg-white/5 hover:text-white" 
                title="Contacter"
              >
                <Phone className="h-4 w-4" />
              </a>
              {!alert.reason.includes("Annulation") && (
                <button 
                  onClick={() => handleCancel(alert.id)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-400 transition hover:bg-red-500/20" 
                  title="Annuler le RDV"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button 
                onClick={() => handleResolve(alert.id)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-teal text-brand-dark transition hover:bg-teal-400" 
                title="Résolu"
              >
                <Check className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="rounded-[2rem] border border-white/5 bg-brand-card p-12 text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-slate-500" />
            <h3 className="text-lg font-medium text-white">Aucune alerte</h3>
            <p className="text-slate-400">Le planning se déroule parfaitement.</p>
          </div>
        )}
      </div>
    </div>
  );
}
