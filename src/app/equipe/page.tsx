"use client";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { listMembers, removeMember, saveMember } from "@/lib/posts";
import { BOOTSTRAP_ADMINS, Member, Role } from "@/lib/types";

export default function TeamPage() {
  const { member } = useAuth();
  const [list, setList] = useState<Member[]>([]);
  const [form, setForm] = useState<Member>({ email: "", name: "", role: "produtor" });
  const load = () => listMembers().then(setList);
  useEffect(() => { load(); }, []);
  if (member?.role !== "admin") return <div className="text-mute">Somente administradores.</div>;

  return (
    <div className="max-w-3xl">
      <div className="eyebrow">Acesso</div>
      <h1 className="text-3xl font-extrabold tracking-tight mt-1">Equipe</h1>
      <p className="text-mute text-sm mt-1">Quem pode entrar e o que pode fazer. <b>Produtor</b> cria e envia para revisão. <b>Aprovador</b> aprova ou pede ajuste. <b>Admin</b> faz tudo e gerencia a equipe.</p>

      <div className="card p-4 mt-6 grid grid-cols-[1fr_1fr_140px_auto] gap-3 items-end">
        <label className="text-xs text-mute">E-mail Google<input className="input mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="pessoa@gmail.com" /></label>
        <label className="text-xs text-mute">Nome<input className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label className="text-xs text-mute">Papel
          <select className="input mt-1" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
            <option value="produtor">Produtor</option><option value="aprovador">Aprovador</option><option value="admin">Admin</option>
          </select>
        </label>
        <button className="btn btn-primary" disabled={!form.email.includes("@")} onClick={async () => { await saveMember({ ...form, email: form.email.trim().toLowerCase() }); setForm({ email: "", name: "", role: "produtor" }); load(); }}>Adicionar</button>
      </div>

      <div className="card mt-4 divide-y divide-white/8">
        {BOOTSTRAP_ADMINS.map((e) => (
          <div key={e} className="flex items-center justify-between p-3 text-sm"><div>{e} <span className="text-mute text-xs">· admin fixo (regras)</span></div></div>
        ))}
        {list.map((m) => (
          <div key={m.email} className="flex items-center justify-between p-3 text-sm">
            <div><b>{m.name || m.email}</b> <span className="text-mute">· {m.email}</span> <span className="pill bg-brand-400/15 text-brand-400 ml-2 capitalize">{m.role}</span></div>
            <button className="btn btn-danger text-xs py-1" onClick={async () => { if (confirm(`Remover ${m.email}?`)) { await removeMember(m.email); load(); } }}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
