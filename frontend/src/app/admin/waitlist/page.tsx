"use client";

import { useEffect, useState } from "react";
import { Users, Clock, Trash2, Calendar } from "lucide-react";
import { apiFetch } from "@/lib/api";

type WaitlistEntry = {
  id: string;
  patient: string;
  doctor: string;
  date: string;
};

export default function WaitlistPage() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [error, setError] = useState("");

  const fetchWaitlist = () => {
    apiFetch<{ data: WaitlistEntry[] }>("/api/v1/waitlist")
      .then((res) => {
        setWaitlist(res.data);
      })
      .catch(() => {
        setError("Impossible de charger la liste d'attente.");
      });
  };

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/v1/waitlist/${id}`, { method: "DELETE" });
      fetchWaitlist();
    } catch {
      setError("Erreur lors de la suppression de la liste d'attente.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">File d'attente intelligente</h1>
        <p className="text-sm text-slate-400">Patients en attente de créneaux libérés suite à une annulation</p>
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
                <th className="px-6 py-4 font-medium">Médecin souhaité</th>
                <th className="px-6 py-4 font-medium">Date demandée</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {waitlist.map((w) => (
                <tr key={w.id} className="transition-colors hover:bg-white/5">
                  <td className="px-6 py-4 font-medium text-white">{w.patient}</td>
                  <td className="px-6 py-4 text-slate-400">{w.doctor}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-brand-teal" />
                      {w.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(w.id)}
                      className="text-red-400 hover:text-red-300 font-medium transition-colors p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl"
                      title="Retirer de la file d'attente"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {waitlist.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    Aucun patient en file d'attente.
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
