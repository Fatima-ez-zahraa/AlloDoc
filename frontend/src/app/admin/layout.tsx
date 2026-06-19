import Link from "next/link";
import { Activity, CalendarDays, Clock, Home, Users } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-72 flex-col border-r border-teal-800 bg-teal-950 text-teal-50 md:flex">
        <Link href="/" className="flex items-center gap-3 border-b border-teal-800 px-5 py-5">
          <BrandLogo priority size="sm" tone="dark" />
          <span className="text-sm font-semibold uppercase tracking-wide text-teal-100">Admin</span>
        </Link>
        <nav className="flex-1 space-y-1 px-4 py-5">
          <Link href="/" className="flex items-center gap-3 rounded-lg px-4 py-3 text-teal-100 hover:bg-teal-900">
            <Home className="h-4 w-4" />
            Accueil
          </Link>
          <Link href="/admin/dashboard" className="flex items-center gap-3 rounded-lg bg-teal-800 px-4 py-3 font-medium text-white">
            <Activity className="h-4 w-4" />
            Tableau de bord
          </Link>
          <Link href="/admin/appointments" className="flex items-center gap-3 rounded-lg px-4 py-3 text-teal-100 hover:bg-teal-900">
            <CalendarDays className="h-4 w-4" />
            Rendez-vous
          </Link>
          <Link href="/admin/patients" className="flex items-center gap-3 rounded-lg px-4 py-3 text-teal-100 hover:bg-teal-900">
            <Users className="h-4 w-4" />
            Patients
          </Link>
          <Link href="/admin/waitlist" className="flex items-center gap-3 rounded-lg px-4 py-3 text-teal-100 hover:bg-teal-900">
            <Clock className="h-4 w-4" />
            File d&apos;attente
          </Link>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 overflow-y-auto p-5 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
