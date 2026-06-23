"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, User, ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api";

type ScheduleSlot = {
  time: string;
  patient: string;
  type: string;
  status: string;
};

export default function PlanningPage() {
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<{ data: ScheduleSlot[] }>("/api/v1/planning")
      .then((res) => {
        setSchedule(res.data);
      })
      .catch(() => {
        setError("Impossible de charger le planning.");
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mon Planning</h1>
          <p className="text-sm text-slate-400">Dr. AlloDoc - Synchronisé avec Google Calendar via n8n</p>
        </div>
        
        <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-brand-dark/50 p-1">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-white">Aujourd'hui, 24 Oct</span>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-[2rem] border border-white/5 bg-brand-card shadow-2xl">
        <div className="divide-y divide-white/5">
          {schedule.map((slot, i) => (
            <div key={i} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-6 transition-colors hover:bg-white/5">
              <div className="flex items-center gap-3 sm:w-32">
                <Clock className="h-5 w-5 text-brand-teal" />
                <span className="font-bold text-white">{slot.time}</span>
              </div>
              
              <div className="flex-1">
                {slot.status === "Libre" ? (
                  <div className="rounded-xl border border-dashed border-white/10 bg-brand-dark/30 p-4 text-center text-sm text-slate-500">
                    Créneau disponible
                  </div>
                ) : slot.status === "Indisponible" ? (
                  <div className="rounded-xl border border-white/5 bg-slate-800/50 p-4 text-center text-sm text-slate-500">
                    {slot.patient}
                  </div>
                ) : (
                  <div className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                    slot.status === "Confirmé" ? "border-brand-teal/20 bg-brand-teal/5" :
                    slot.status === "Annulé" ? "border-red-500/20 bg-red-500/5" :
                    "border-amber-500/20 bg-amber-500/5"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-dark text-slate-400">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{slot.patient}</h3>
                        <p className="text-xs text-slate-400">{slot.type}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        slot.status === "Confirmé" ? "bg-teal-500/10 text-brand-teal" :
                        slot.status === "Annulé" ? "bg-red-500/10 text-red-400" :
                        "bg-amber-500/10 text-amber-400"
                      }`}>
                        {slot.status}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
