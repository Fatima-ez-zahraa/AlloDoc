"use client";

import Link from "next/link";
import { Activity, CalendarDays, MessageCircle, ArrowRight, ShieldCheck, PlayCircle, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-80px)] flex-col items-center pt-20 pb-16 px-4">
      {/* Dark theme background glows */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-teal/5 blur-[120px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 -z-10 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full bg-brand-teal/5 blur-[100px]" />
      
      <div className="flex w-full max-w-5xl flex-col items-center text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-teal/30 bg-brand-card px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-teal">
          <Zap className="h-4 w-4" />
          Intelligence Artificielle Médicale
        </span>
        
        <h1 className="text-5xl font-black tracking-tight text-white md:text-7xl lg:text-[5.5rem] leading-tight">
          OÙ L'INNOVATION<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-teal-200">RENCONTRE LA SANTÉ</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg font-medium text-slate-400 md:text-xl">
          AlloDoc automatise la prise de rendez-vous et réduit l'absentéisme grâce à un assistant virtuel 24/7. Simple. Rapide. Efficace.
        </p>

        <div className="mt-10 flex w-full flex-col gap-4 sm:flex-row sm:justify-center items-center">
          <Link 
            href="/chat" 
            className="group flex h-14 w-full items-center justify-center gap-3 rounded-full bg-brand-teal px-8 text-base font-bold text-brand-dark shadow-[0_0_20px_rgba(22,163,181,0.3)] transition-all hover:bg-teal-400 hover:shadow-[0_0_30px_rgba(22,163,181,0.5)] sm:w-auto"
          >
            <MessageCircle className="h-5 w-5" />
            Essayer l'Assistant
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          
          <Link 
            href="/admin/dashboard" 
            className="flex h-14 w-full items-center justify-center gap-3 rounded-full border border-slate-600 bg-transparent px-8 text-base font-bold text-white transition-all hover:border-brand-teal hover:bg-brand-card hover:text-brand-teal sm:w-auto"
          >
            <PlayCircle className="h-5 w-5" />
            Espace Praticien
          </Link>
        </div>

        {/* Feature Cards Grid (Inspired by the dark theme image) */}
        <div className="mt-24 grid w-full grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group flex flex-col rounded-[2rem] bg-brand-card p-8 shadow-xl transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-teal/10 border border-white/5">
            <div className="mb-6 inline-flex rounded-2xl bg-brand-dark p-4 text-brand-teal shadow-inner border border-white/5">
              <MessageCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 text-left">Chat Patient IA</h3>
            <p className="text-slate-400 text-sm text-left leading-relaxed">
              Support multilingue (Français, Arabe, Darija) instantané pour filtrer et répondre aux requêtes de vos patients.
            </p>
          </div>
          
          <div className="group flex flex-col rounded-[2rem] bg-brand-card p-8 shadow-xl transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-teal/10 border border-white/5">
            <div className="mb-6 inline-flex rounded-2xl bg-brand-dark p-4 text-brand-teal shadow-inner border border-white/5">
              <CalendarDays className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 text-left">Gestion Optimisée</h3>
            <p className="text-slate-400 text-sm text-left leading-relaxed">
              Synchronisation calendrier, relances automatiques et remplissage intelligent de la liste d'attente.
            </p>
          </div>

          <div className="group flex flex-col rounded-[2rem] bg-brand-card p-8 shadow-xl transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-teal/10 border border-white/5">
            <div className="mb-6 inline-flex rounded-2xl bg-brand-dark p-4 text-brand-teal shadow-inner border border-white/5">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 text-left">Prédiction No-Show</h3>
            <p className="text-slate-400 text-sm text-left leading-relaxed">
              Modèle ML prédictif pour identifier les patients à risque d'absence et déclencher des workflows préventifs.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
