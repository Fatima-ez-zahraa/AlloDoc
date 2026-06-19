"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, CalendarDays, MessageCircle, Users } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { apiFetch } from "@/lib/api";

type HealthResponse = {
  status: string;
  service: string;
};

export default function Home() {
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    apiFetch<HealthResponse>("/api/v1/health")
      .then(() => setApiStatus("online"))
      .catch(() => setApiStatus("offline"));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between md:py-5 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <BrandLogo priority size="md" />
          </Link>
          <nav className="flex flex-wrap items-center gap-2 justify-center md:justify-end">
            <Link href="/chat" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
              Chat
            </Link>
            <Link href="/admin/dashboard" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-teal-100 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
            <span
              className={
                apiStatus === "online"
                  ? "h-2.5 w-2.5 rounded-full bg-emerald-500"
                  : apiStatus === "offline"
                    ? "h-2.5 w-2.5 rounded-full bg-red-500"
                    : "h-2.5 w-2.5 rounded-full bg-amber-400"
              }
            />
            {/* Backend FastAPI : {apiStatus === "online" ? "connecté" : apiStatus === "offline" ? "hors ligne" : "vérification"} */}
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight text-teal-800 md:text-6xl">
            AlloDoc
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-600">
            Assistant médical intelligent pour les cabinets marocains : chat patient, suivi des rendez-vous
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/chat"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-teal-700 px-5 font-medium text-white shadow-sm transition hover:bg-teal-800"
            >
              <MessageCircle className="h-5 w-5" />
              Ouvrir le chat
            </Link>
            <Link
              href="/admin/dashboard"
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-teal-700 bg-white px-5 font-medium text-teal-700 transition hover:bg-teal-50"
            >
              <Activity className="h-5 w-5" />
              Voir le tableau de bord
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-lg border border-teal-100 bg-white p-5 shadow-sm">
            <BrandLogo priority size="lg" className="mx-auto border-0 shadow-none" imageClassName="p-0" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/chat" className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:bg-teal-50">
              <MessageCircle className="mb-3 h-5 w-5 text-teal-700" />
              <p className="font-semibold text-slate-900">Chat patient</p>
              <p className="mt-1 text-sm text-slate-500">Réponses via API</p>
            </Link>
            <Link href="/admin/appointments" className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:bg-teal-50">
              <CalendarDays className="mb-3 h-5 w-5 text-teal-700" />
              <p className="font-semibold text-slate-900">Rendez-vous</p>
              <p className="mt-1 text-sm text-slate-500">Suivi clinique</p>
            </Link>
            <Link href="/admin/patients" className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:bg-teal-50">
              <Users className="mb-3 h-5 w-5 text-teal-700" />
              <p className="font-semibold text-slate-900">Patients</p>
              <p className="mt-1 text-sm text-slate-500">Historique</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
