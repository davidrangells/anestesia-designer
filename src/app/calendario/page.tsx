"use client";
import { useEffect, useMemo, useState } from "react";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { updatePost, watchPosts } from "@/lib/posts";
import { Post, STATUS_COLOR } from "@/lib/types";
import Link from "next/link";

export default function CalendarPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [drag, setDrag] = useState<string | null>(null);
  useEffect(() => watchPosts(setPosts), []);

  const days = useMemo(() => eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 0 }),
  }), [month]);

  const byDay = useMemo(() => {
    const m: Record<string, Post[]> = {};
    posts.forEach((p) => { if (p.scheduledAt) (m[p.scheduledAt] ||= []).push(p); });
    Object.values(m).forEach((l) => l.sort((a, b) => a.order - b.order));
    return m;
  }, [posts]);
  const unscheduled = posts.filter((p) => !p.scheduledAt);

  async function drop(day: string | null) {
    if (!drag) return;
    await updatePost(drag, { scheduledAt: day });
    setDrag(null);
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-end justify-between">
        <div>
          <div className="eyebrow">Planejamento</div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1 capitalize">{format(month, "MMMM yyyy", { locale: ptBR })}</h1>
          <p className="text-mute text-sm mt-1">Arraste um post para outro dia para reagendar.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={() => setMonth(addMonths(month, -1))}><ChevronLeft size={16} /></button>
          <button className="btn btn-ghost" onClick={() => setMonth(startOfMonth(new Date()))}>Hoje</button>
          <button className="btn btn-ghost" onClick={() => setMonth(addMonths(month, 1))}><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-white/8 rounded-2xl overflow-hidden mt-6 border border-white/8">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
          <div key={d} className="bg-ink-700 text-[11px] tracking-widest uppercase text-mute p-2 text-center">{d}</div>
        ))}
        {days.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const list = byDay[key] || [];
          return (
            <div key={key} onDragOver={(e) => e.preventDefault()} onDrop={() => drop(key)}
              className={`min-h-28 p-2 bg-ink-800 ${isSameMonth(d, month) ? "" : "opacity-40"}`}>
              <div className="text-xs text-mute">{format(d, "d")}</div>
              <div className="flex flex-col gap-1 mt-1">
                {list.map((p) => (
                  <Link key={p.id} href={`/posts/${p.id}`} draggable onDragStart={() => setDrag(p.id)}
                    className={`flex items-center gap-2 rounded-lg p-1 text-[11px] font-medium border border-white/8 hover:border-brand-400 ${STATUS_COLOR[p.status]}`}>
                    {p.slides[0] && <img src={p.slides[0].url} alt="" className="w-6 h-7 object-cover rounded" />}
                    <span className="truncate">{p.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="text-lg font-bold mt-8">Sem data <span className="text-mute font-normal text-sm">({unscheduled.length})</span></h2>
      <div onDragOver={(e) => e.preventDefault()} onDrop={() => drop(null)} className="card p-3 mt-3 flex gap-2 flex-wrap min-h-16">
        {unscheduled.map((p) => (
          <Link key={p.id} href={`/posts/${p.id}`} draggable onDragStart={() => setDrag(p.id)}
            className={`flex items-center gap-2 rounded-lg p-1 pr-3 text-xs font-medium border border-white/8 hover:border-brand-400 ${STATUS_COLOR[p.status]}`}>
            {p.slides[0] && <img src={p.slides[0].url} alt="" className="w-7 h-8 object-cover rounded" />}
            {p.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
