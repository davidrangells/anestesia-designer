"use client";
import { useAuth } from "@/lib/auth";

export default function Login({ denied }: { denied: boolean }) {
  const { login, logout, user, error } = useAuth();
  return (
    <div className="min-h-screen grid place-items-center grid-bg relative overflow-hidden">
      <div className="absolute -left-40 -top-40 w-[520px] h-[520px] rounded-full bg-brand-600 opacity-40 blur-[120px]" />
      <div className="card p-10 w-[420px] relative">
        <div className="flex items-center gap-3">
          <img src="/logo-mark.png" alt="" className="h-12 w-12 object-contain" />
          <div>
            <div className="font-extrabold text-xl">Anestesia <span className="font-normal">Questões</span></div>
            <div className="eyebrow">Designer · aprovação de conteúdo</div>
          </div>
        </div>
        <p className="text-mute text-sm mt-6">Área restrita à equipe de conteúdo. Entre com a conta Google autorizada.</p>
        {denied && (
          <div className="mt-4 text-sm rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-red-300">
            A conta <b>{user?.email}</b> não está na lista de acesso. Peça ao administrador para adicionar.
            <button onClick={logout} className="underline ml-2">Trocar de conta</button>
          </div>
        )}
        {error && (
          <div className="mt-4 text-xs rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-red-300 break-words font-mono">{error}</div>
        )}
        <button onClick={login} className="btn btn-primary w-full justify-center mt-6">Entrar com Google</button>
      </div>
    </div>
  );
}
