"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, AlertCircle, CheckCircle, Search, X } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Appointment = {
  id: string;
  patient: string;
  doctor: string;
  time: string;
  date: string;
  status: string;
  risk: string;
  risk_score: number;
  type: string;
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  const fetchAppointments = () => {
    apiFetch<{ data: Appointment[] }>("/api/v1/appointments")
      .then((res) => {
        setAppointments(res.data);
        setError("");
      })
      .catch(() => {
        setError("Impossible de charger les rendez-vous.");
      });
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id: string) => {
    try {
      await apiFetch(`/api/v1/appointments/${id}/cancel`, { method: "DELETE" });
      fetchAppointments();
    } catch {
      setError("Erreur lors de l'annulation.");
    }
  };

  const filteredAppointments = appointments.filter((apt) =>
    apt.patient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion des Rendez-vous</h1>
          <p className="text-sm text-slate-400">Vue réceptionniste - Plannings du jour</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Rechercher un patient..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-brand-dark/50 py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal sm:w-64"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-[2rem] border border-white/5 bg-brand-card shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-white/5 bg-white/5 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Patient</th>
                <th className="px-6 py-4 font-medium">Médecin</th>
                <th className="px-6 py-4 font-medium">Heure / Date</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium">Risque No-Show (IA)</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAppointments.map((apt) => (
                <tr key={apt.id} className="transition-colors hover:bg-white/5">
                  <td className="px-6 py-4 font-medium text-white">{apt.patient}</td>
                  <td className="px-6 py-4 text-slate-400">{apt.doctor}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-brand-teal" />
                        {apt.time}
                      </div>
                      <span className="text-[10px] text-slate-500 ml-6">{apt.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{apt.type}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      apt.status.includes("Confirmé") ? "bg-teal-500/10 text-brand-teal border border-teal-500/20" :
                      apt.status.includes("Annulé") ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                      "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      apt.risk === "Low" ? "bg-emerald-500/10 text-emerald-400" :
                      apt.risk === "High" ? "bg-red-500/10 text-red-400 animate-pulse" :
                      "bg-amber-500/10 text-amber-400"
                    }`}>
                      {apt.risk === "High" && <AlertCircle className="h-3 w-3" />}
                      {apt.risk === "Low" && <CheckCircle className="h-3 w-3" />}
                      {apt.risk} ({Math.round(apt.risk_score * 100)}%)
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {apt.status !== "Annulé par IA" && (
                      <button 
                        onClick={() => handleCancel(apt.id)}
                        className="text-red-400 hover:text-red-300 font-medium transition-colors text-xs border border-red-500/20 bg-red-500/5 px-3 py-1.5 rounded-xl hover:bg-red-500/10"
                      >
                        Annuler
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredAppointments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Aucun rendez-vous trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
