"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, CalendarDays, Upload, Users, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import Login from "./Login";

const NAV = [
  { href: "/", label: "Feed", icon: LayoutGrid },
  { href: "/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/importar", label: "Importar", icon: Upload },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const { user, member, loading, denied, logout } = useAuth();
  const path = usePathname();

  if (loading) return <div className="min-h-screen grid place-items-center text-mute">Carregando…</div>;
  if (!user || !member) return <Login denied={denied} />;

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 border-r border-white/8 p-5 flex flex-col gap-6 sticky top-0 h-screen">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo-mark.png" alt="" className="h-9 w-9 object-contain" />
          <div className="leading-tight">
            <div className="font-extrabold text-[15px]">Anestesia <span className="font-normal">Questões</span></div>
            <div className="eyebrow mt-0.5">Designer</div>
          </div>
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${active ? "bg-white/8 text-white" : "text-mute hover:text-white hover:bg-white/5"}`}>
                <Icon size={18} /> {label}
              </Link>
            );
          })}
          {member.role === "admin" && (
            <Link href="/equipe" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${path.startsWith("/equipe") ? "bg-white/8 text-white" : "text-mute hover:text-white hover:bg-white/5"}`}>
              <Users size={18} /> Equipe
            </Link>
          )}
        </nav>
        <div className="mt-auto card p-3 text-xs">
          <div className="font-semibold truncate">{member.name}</div>
          <div className="text-mute truncate">{member.email}</div>
          <div className="pill mt-2 bg-brand-400/15 text-brand-400 capitalize">{member.role}</div>
          <button onClick={logout} className="btn btn-ghost mt-3 w-full justify-center text-xs py-2"><LogOut size={14} /> Sair</button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-8">{children}</main>
    </div>
  );
}
