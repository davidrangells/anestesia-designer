"use client";
import Link from "next/link";
import { Images, Film } from "lucide-react";
import { Post } from "@/lib/types";
import StatusPill from "./StatusPill";

export default function PostThumb({ post, compact = false }: { post: Post; compact?: boolean }) {
  const cover = post.slides[0]?.url;
  return (
    <Link href={`/posts/${post.id}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-ink-600 border border-white/8">
        {cover ? (
          <img src={cover} alt="" className="w-full h-full object-cover transition group-hover:scale-[1.02]" />
        ) : (
          <div className="w-full h-full grid place-items-center text-mute text-xs">Sem arte</div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          {post.kind === "carrossel" && <span className="pill bg-black/60 text-white"><Images size={12} /> {post.slides.length}</span>}
          {post.kind === "reel" && <span className="pill bg-black/60 text-white"><Film size={12} /></span>}
        </div>
        <div className="absolute bottom-2 left-2"><StatusPill status={post.status} /></div>
      </div>
      {!compact && (
        <div className="mt-2">
          <div className="text-sm font-semibold truncate">{post.title}</div>
          <div className="text-xs text-mute truncate">{post.series || "—"} · {post.scheduledAt ? post.scheduledAt.split("-").reverse().join("/") : "sem data"}</div>
        </div>
      )}
    </Link>
  );
}
