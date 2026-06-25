"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Activity, CalendarDays, AlertTriangle, Home, Users, BarChart, LogOut, FileText, Bot } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    const name = localStorage.getItem("userName");

    if (!token || !userRole) {
      router.push("/login");
    } else {
      setRole(userRole);
      setUserName(name);
      setLoading(false);
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    router.push("/login");
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-brand-dark"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-teal border-t-transparent" /></div>;
  }

  // RBAC Link Generation
  const getLinks = () => {
    switch (role) {
      case "receptionniste":
        return [
          { href: "/admin/appointments", label: "Gestion des RDV", icon: CalendarDays },
          { href: "/admin/patients", label: "Liste patients", icon: Users },
          { href: "/admin/alerts", label: "Alertes no-show", icon: AlertTriangle },
        ];
      case "medecin":
        return [
          { href: "/admin/planning", label: "Mon Planning", icon: CalendarDays },
          { href: "/admin/historique", label: "Historique patient", icon: FileText },
        ];
      case "admin":
        return [
          { href: "/admin/dashboard", label: "Dashboard", icon: Activity },
          { href: "/admin/stats", label: "Statistiques", icon: BarChart },
          { href: "/admin/kpi", label: "KPI", icon: Activity },
          { href: "/admin/ai", label: "Assistant IA", icon: Bot },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <div className="flex min-h-screen bg-brand-dark">
      <aside className="hidden w-72 flex-col border-r border-white/5 bg-brand-card md:flex">
        <Link href="/" className="flex flex-col items-center gap-3 border-b border-white/5 px-5 py-6 transition-transform hover:scale-105">
          <BrandLogo size="sm" />
          <span className="text-xs font-bold uppercase tracking-widest text-brand-teal">Espace {userName}</span>
        </Link>
        <nav className="flex-1 space-y-2 px-4 py-6">
          <Link href="/" className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white">
            <Home className="h-5 w-5 text-slate-500 transition group-hover:text-brand-teal" />
            Retour au site
          </Link>
          
          <div className="my-4 h-px w-full bg-white/5" />
          <p className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Menu Principal</p>

          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  isActive 
                    ? "bg-brand-teal/10 text-brand-teal shadow-[inset_4px_0_0_0_rgba(22,163,181,1)]" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-brand-teal" : "text-slate-500 group-hover:text-brand-teal")} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/5 p-4">
          <button 
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-5 w-5 text-slate-500 transition group-hover:text-red-400" />
            Déconnexion
          </button>
        </div>
      </aside>
      
      <main className="min-w-0 flex-1 overflow-y-auto bg-brand-dark p-5 sm:p-6 md:p-8">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
