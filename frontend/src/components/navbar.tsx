"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, Home, Menu, MessageCircle, ShieldCheck, X } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

const links = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/admin/dashboard", label: "Admin", icon: Activity },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-4 z-50 mx-auto px-4 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-brand-dark/90 px-6 py-3 shadow-2xl backdrop-blur-md transition-all duration-300">
        <Link href="/" className="flex items-center transition-transform hover:scale-105">
          <BrandLogo className="h-20 w-48" />
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/5 hover:text-white"
            >
              <Icon className="h-4 w-4 text-brand-teal/70 transition-colors group-hover:text-brand-teal" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center md:flex">
          <Link
            href="/chat"
            className="inline-flex h-10 items-center rounded-full bg-brand-teal px-6 text-sm font-semibold text-brand-dark shadow-lg shadow-brand-teal/20 transition-all hover:-translate-y-0.5 hover:bg-teal-400 hover:shadow-brand-teal/40"
          >
            Essayer maintenant
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white transition-colors hover:bg-white/10 md:hidden"
          aria-label="Ouvrir le menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="absolute inset-x-0 top-full border-b border-brand-teal/10 bg-brand-dark/95 px-6 pb-6 pt-4 shadow-xl backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-2">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="group inline-flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-brand-card hover:text-white"
              >
                <Icon className="h-5 w-5 text-brand-teal" />
                {label}
              </Link>
            ))}
            <div className="my-2 h-px w-full bg-brand-card" />
            <Link
              href="/chat"
              className="flex items-center justify-center rounded-2xl bg-brand-teal px-4 py-4 text-sm font-bold text-brand-dark shadow-lg shadow-brand-teal/20 transition hover:bg-teal-400"
            >
              Essayer maintenant
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
