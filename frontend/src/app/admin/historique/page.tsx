"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FileText, Search, User, Clock, CheckCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

type PatientOption = {
  id: string;
  name: string;
};

type HistoryRecord = {
  id: string;
  date: string;
  type: string;
  note: string;
  prescription: string;
};

type HistoryResponse = {
  status: string;
  patient: {
    name: string;
    phone: string;
    id: string;
  };
  data: HistoryRecord[];
};

function HistoriqueContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams.get("patient_id");

  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [currentPatientName, setCurrentPatientName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<{ data: { id: string; name: string }[] }>("/api/v1/patients")
      .then((res) => {
        setPatients(res.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (patientId) {
      apiFetch<HistoryResponse>(`/api/v1/patients/${patientId}/history`)
        .then((res) => {
          setHistory(res.data);
          setCurrentPatientName(res.patient.name);
          setError("");
        })
        .catch(() => {
          setError("Impossible de charger l'historique.");
          setHistory([]);
          setCurrentPatientName("");
        });
    }
  }, [patientId]);

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Historique Patient</h1>
          <p className="text-sm text-slate-400">Vue Médecin - Dossiers médicaux et antécédents</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Patient Selection Sidebar */}
        <div className="w-full lg:w-1/3 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Rechercher un patient..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-brand-dark/50 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
            />
          </div>
          
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredPatients.map((p) => {
              const isSelected = p.id === patientId;
              return (
                <button
                  key={p.id}
                  onClick={() => router.push(`/admin/historique?patient_id=${p.id}`)}
                  className={`w-full text-left rounded-[2rem] border p-4 transition-all ${
                    isSelected 
                      ? "border-brand-teal/30 bg-brand-teal/5" 
                      : "border-white/5 bg-brand-card/50 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${isSelected ? "bg-brand-teal/20 text-brand-teal" : "bg-brand-dark text-slate-400"}`}>
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{p.name}</h3>
                      <p className="text-xs text-slate-400">Dossier #{p.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </button>
              );
            })}
            {filteredPatients.length === 0 && (
              <div className="text-center text-slate-500 text-sm py-4">Aucun patient.</div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 rounded-[2rem] border border-white/5 bg-brand-card p-6 shadow-xl sm:p-8">
          {patientId ? (
            <>
              <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">{currentPatientName}</h2>
                  <p className="text-sm text-slate-400">Historique des consultations</p>
                </div>
              </div>

              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                {history.map((record, index) => (
                  <div key={record.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-brand-card bg-brand-teal text-brand-dark shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] rounded-2xl border border-white/5 bg-brand-dark/50 p-5 shadow-xl transition-all hover:border-brand-teal/30">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-brand-teal">{record.type}</h3>
                        <time className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {record.date}
                        </time>
                      </div>
                      <p className="text-sm text-slate-300 mb-3">{record.note}</p>
                      <div className="text-xs font-medium text-slate-400 bg-black/20 rounded-lg p-2 border border-white/5">
                        <span className="text-slate-500">Prescription :</span> {record.prescription}
                      </div>
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="text-center text-slate-500 py-12">
                    Aucun antécédent trouvé pour ce patient.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center">
              <FileText className="h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Sélectionnez un patient</h3>
              <p>Choisissez un patient dans la liste de gauche pour consulter son dossier médical.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HistoriquePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-brand-dark"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-teal border-t-transparent" /></div>}>
      <HistoriqueContent />
    </Suspense>
  );
}
