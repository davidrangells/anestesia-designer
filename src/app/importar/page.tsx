"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { createPost, updatePost, uploadFile } from "@/lib/posts";
import { Family, Kind } from "@/lib/types";

type Group = { folder: string; images: File[]; videos: File[]; caption: string; captions: string[]; mode: "carrossel" | "posts" };

function guessFamily(name: string): Family {
  const n = name.toLowerCase();
  if (n.includes("dica") || n.includes("conceito") || n.includes("regra") || n.includes("reel")) return "G";
  if (n.includes("resposta")) return "L";
  return "D";
}

export default function ImportPage() {
  const { member } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [date, setDate] = useState("");

  async function pick(files: FileList | null) {
    if (!files) return;
    const map: Record<string, Group> = {};
    for (const f of Array.from(files)) {
      const rel = (f as File & { webkitRelativePath: string }).webkitRelativePath || f.name;
      const parts = rel.split("/");
      if (parts.some((p) => p.startsWith("_") || p.startsWith(".") || p === "frames" || p === "fonte")) continue;
      const folder = parts.length > 2 ? parts.slice(0, -1).join("/") : parts[0];
      const g = (map[folder] ||= { folder, images: [], videos: [], caption: "", captions: [], mode: "carrossel" });
      if (/\.(png|jpe?g|webp)$/i.test(f.name)) g.images.push(f);
      else if (/\.mp4$/i.test(f.name)) g.videos.push(f);
      else if (/^legenda\.txt$/i.test(f.name)) g.caption = await f.text();
      else if (/^legendas\.txt$/i.test(f.name)) { g.mode = "posts"; g.captions = (await f.text()).split(/═══+[^\n]*═══+/).map((s) => s.trim()).filter(Boolean); }
    }
    const list = Object.values(map).filter((g) => g.images.length || g.videos.length);
    list.forEach((g) => { g.images.sort((a, b) => a.name.localeCompare(b.name)); if (g.mode === "posts" && g.captions.length) g.captions = g.captions.slice(-g.images.length); });
    setGroups(list);
  }

  async function run() {
    if (!member) return;
    setBusy(true);
    const out: string[] = [];
    let order = 0;
    for (const g of groups) {
      const base = g.folder.split("/").pop()!.replace(/^\d+-/, "").replace(/-/g, " ");
      if (g.mode === "posts") {
        for (let i = 0; i < g.images.length; i++) {
          const img = g.images[i];
          const title = img.name.replace(/\.(png|jpe?g|webp)$/i, "").replace(/^\d+-/, "").replace(/-/g, " ");
          const id = await createPost({ title, series: base, kind: "post", family: guessFamily(img.name), caption: g.captions[i] || "", status: "revisao", scheduledAt: date || null, order: order++, slides: [], video: null, createdBy: member.email });
          const s = await uploadFile(id, img);
          await updatePost(id, { slides: [s] });
          out.push(`✓ ${title}`); setLog([...out]);
        }
      } else {
        const kind: Kind = g.videos.length ? "reel" : g.images.length > 1 ? "carrossel" : "post";
        const id = await createPost({ title: base, series: "", kind, family: guessFamily(base), caption: g.caption, status: "revisao", scheduledAt: date || null, order: order++, slides: [], video: null, createdBy: member.email });
        const slides = [];
        for (const img of g.images) slides.push(await uploadFile(id, img));
        const video = g.videos[0] ? await uploadFile(id, g.videos[0]) : null;
        await updatePost(id, { slides: kind === "reel" && g.images.length > 1 ? slides.filter((s) => /capa/i.test(s.name)).concat(slides.filter((s) => !/capa/i.test(s.name))) : slides, video });
        out.push(`✓ ${base} (${slides.length} arquivo${slides.length === 1 ? "" : "s"}${video ? " + vídeo" : ""})`); setLog([...out]);
      }
    }
    setBusy(false);
    setGroups([]);
    setTimeout(() => router.push("/"), 800);
  }

  return (
    <div className="max-w-3xl">
      <div className="eyebrow">Importação em lote</div>
      <h1 className="text-3xl font-extrabold tracking-tight mt-1">Importar pasta</h1>
      <p className="text-mute text-sm mt-1">
        Selecione uma pasta do iCloud (ex.: <code>lote-02</code> ou <code>trio-01</code>). Cada subpasta com <code>legenda.txt</code> vira um carrossel;
        uma pasta com <code>legendas.txt</code> vira um post por imagem. Tudo entra como <b>Em revisão</b>.
      </p>

      <div className="card p-6 mt-6 flex flex-col gap-4">
        <label className="btn btn-ghost w-fit cursor-pointer"><FolderOpen size={16} /> Escolher pasta
          {/* @ts-expect-error webkitdirectory não está na tipagem */}
          <input type="file" webkitdirectory="" directory="" multiple className="hidden" onChange={(e) => pick(e.target.files)} />
        </label>
        <label className="text-xs text-mute">Data planejada para todos (opcional)<input type="date" className="input mt-1 w-56" value={date} onChange={(e) => setDate(e.target.value)} /></label>

        {groups.length > 0 && (
          <div className="text-sm">
            <div className="font-semibold mb-2">{groups.length} item(ns) encontrado(s):</div>
            <ul className="flex flex-col gap-1">
              {groups.map((g) => (
                <li key={g.folder} className="flex justify-between border-b border-white/8 py-1.5">
                  <span>{g.folder}</span>
                  <span className="text-mute">{g.mode === "posts" ? `${g.images.length} posts` : `${g.images.length} slide(s)${g.videos.length ? " + vídeo" : ""}`}{g.caption || g.captions.length ? " · legenda ✓" : " · sem legenda"}</span>
                </li>
              ))}
            </ul>
            <button className="btn btn-primary mt-4" onClick={run} disabled={busy}>{busy ? "Importando…" : "Importar"}</button>
          </div>
        )}
        {log.length > 0 && <pre className="text-xs text-mute whitespace-pre-wrap">{log.join("\n")}</pre>}
      </div>
    </div>
  );
}
