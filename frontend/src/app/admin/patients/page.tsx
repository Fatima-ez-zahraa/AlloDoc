"use client";

import { useEffect, useState } from "react";
import { Search, User, Phone, FileText, Activity } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Patient = {
  id: string;
  name: string;
  phone: string;
  lastVisit: string;
  condition: string;
  status: string;
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<{ data: Patient[] }>("/api/v1/patients")
      .then((res) => {
        setPatients(res.data);
      })
      .catch(() => {
        setError("Impossible de charger les patients.");
      });
  }, []);

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Base Patients</h1>
          <p className="text-sm text-slate-400">Gestion des dossiers médicaux (Synchronisé Supabase)</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Nom ou numéro WhatsApp..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-brand-dark/50 py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal sm:w-72"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPatients.map((patient) => (
          <div key={patient.id} className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-brand-card p-6 shadow-xl transition-all hover:border-brand-teal/30 hover:shadow-brand-teal/10">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-dark text-slate-400">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{patient.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Phone className="h-3 w-3" />
                    {patient.phone}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-white/5 bg-brand-dark/30 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-400">
                  <Activity className="h-4 w-4" /> Condition
                </span>
                <span className="font-medium text-white">{patient.condition}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-400">
                  <FileText className="h-4 w-4" /> Dernier RDV
                </span>
                <span className="font-medium text-white">{patient.lastVisit}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                patient.status === "Actif" ? "bg-teal-500/10 text-brand-teal" : "bg-amber-500/10 text-amber-400"
              }`}>
                {patient.status}
              </span>
              <a 
                href={`/admin/historique?patient_id=${patient.id}`}
                className="text-sm font-medium text-brand-teal hover:text-teal-400 transition-colors"
              >
                Ouvrir dossier
              </a>
            </div>
          </div>
        ))}
        {filteredPatients.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            Aucun patient trouvé.
          </div>
        )}
      </div>
    </div>
  );
}
