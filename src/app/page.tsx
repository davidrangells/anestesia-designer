"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { feedOrder, watchPosts } from "@/lib/posts";
import { Post, Status, STATUS_LABEL } from "@/lib/types";
import PostThumb from "@/components/PostThumb";

const FILTERS: (Status | "todos")[] = ["todos", "revisao", "ajustar", "aprovado", "rascunho", "publicado"];

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<Status | "todos">("todos");
  useEffect(() => watchPosts(setPosts), []);

  const feed = useMemo(() => feedOrder(posts.filter((p) => filter === "todos" || p.status === filter)), [posts, filter]);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    posts.forEach((p) => { c[p.status] = (c[p.status] || 0) + 1; });
    return c;
  }, [posts]);

  return (
    <div className="max-w-6xl">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="eyebrow">Instagram · @anestesiaquestoes</div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">Feed planejado</h1>
          <p className="text-mute text-sm mt-1">Como a grade vai ficar. O post mais recente aparece à esquerda, igual ao Instagram.</p>
        </div>
        <Link href="/posts/novo" className="btn btn-primary"><Plus size={16} /> Novo post</Link>
      </div>

      <div className="flex gap-2 mt-6 flex-wrap">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`pill cursor-pointer border ${filter === f ? "border-brand-400 text-brand-400 bg-brand-400/10" : "border-white/12 text-mute hover:text-white"}`}>
            {f === "todos" ? "Todos" : STATUS_LABEL[f]} <span className="opacity-60">{f === "todos" ? posts.length : counts[f] || 0}</span>
          </button>
        ))}
      </div>

      {feed.length === 0 ? (
        <div className="card p-10 mt-8 text-center text-mute text-sm">
          Nenhum post ainda. <Link href="/importar" className="text-brand-400 underline">Importe uma pasta</Link> ou crie um novo post.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 mt-6 max-w-3xl">
          {feed.map((p) => <PostThumb key={p.id} post={p} compact />)}
        </div>
      )}

      <h2 className="text-lg font-bold mt-10">Lista</h2>
      <div className="grid grid-cols-4 gap-4 mt-4">
        {feed.map((p) => <PostThumb key={p.id} post={p} />)}
      </div>
    </div>
  );
}
