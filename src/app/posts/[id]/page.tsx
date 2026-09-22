"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check, CircleAlert, Send, Trash2, Upload, Copy, Eye } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { addComment, createPost, deletePost, setStatus, toggleComment, updatePost, uploadFile, watchComments, watchPost } from "@/lib/posts";
import { Comment, Family, FAMILY_LABEL, Kind, KIND_LABEL, Post, Status, STATUS_LABEL } from "@/lib/types";
import StatusPill from "@/components/StatusPill";

const EMPTY: Omit<Post, "id" | "createdAt" | "updatedAt"> = {
  title: "", series: "", kind: "carrossel", family: "D", caption: "", status: "rascunho",
  scheduledAt: null, order: 0, slides: [], video: null, createdBy: "",
};

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "novo";
  const router = useRouter();
  const { member } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [comments, setComments] = useState<Comment[]>([]);
  const [slide, setSlide] = useState(0);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNew) return;
    const u1 = watchPost(id, (p) => { setPost(p); if (p) setForm({ ...p }); });
    const u2 = watchComments(id, setComments);
    return () => { u1(); u2(); };
  }, [id, isNew]);

  const canApprove = member?.role === "admin" || member?.role === "aprovador";
  const dirty = post ? JSON.stringify({ ...post, updatedAt: 0 }) !== JSON.stringify({ ...form, id: post.id, createdAt: post.createdAt, updatedAt: 0 }) : true;

  async function save() {
    if (!member) return;
    setSaving(true);
    try {
      if (isNew) {
        const newId = await createPost({ ...form, createdBy: member.email });
        router.replace(`/posts/${newId}`);
      } else {
        const { id: _i, createdAt: _c, updatedAt: _u, ...data } = form as Post; void _i; void _c; void _u;
        await updatePost(id, data);
      }
    } finally { setSaving(false); }
  }

  async function onFiles(files: FileList | null) {
    if (!files || !post) return;
    setUploading(true);
    try {
      const list = Array.from(files).sort((a, b) => a.name.localeCompare(b.name));
      const slides = [...post.slides];
      let video = post.video;
      for (const f of list) {
        const s = await uploadFile(post.id, f);
        if (f.type.startsWith("video/")) video = s; else slides.push(s);
      }
      await updatePost(post.id, { slides, video });
    } finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  }

  async function removeSlide(i: number) {
    if (!post) return;
    const slides = post.slides.filter((_, k) => k !== i);
    await updatePost(post.id, { slides });
    setSlide(Math.max(0, Math.min(slide, slides.length - 1)));
  }

  async function moveSlide(i: number, dir: -1 | 1) {
    if (!post) return;
    const s = [...post.slides]; const j = i + dir;
    if (j < 0 || j >= s.length) return;
    [s[i], s[j]] = [s[j], s[i]];
    await updatePost(post.id, { slides: s });
    setSlide(j);
  }

  async function decide(status: Status) {
    if (!post || !member) return;
    if (status === "ajustar" && !text.trim()) { alert("Escreva no comentário o que precisa ser ajustado."); return; }
    if (text.trim()) await sendComment();
    await setStatus(post.id, status, member.email);
  }

  async function sendComment() {
    if (!post || !member || !text.trim()) return;
    await addComment(post.id, { text: text.trim(), slide: form.kind === "carrossel" ? slide : null, authorEmail: member.email, authorName: member.name });
    setText("");
  }

  if (!isNew && !post) return <div className="text-mute">Carregando…</div>;
  const slides = form.slides;
  const current = slides[slide];

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="eyebrow">{form.series || "Sem série"} · {KIND_LABEL[form.kind]}</div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">{form.title || "Novo post"}</h1>
        </div>
        <div className="flex items-center gap-2">
          {post && <StatusPill status={post.status} />}
          <button className="btn btn-primary" onClick={save} disabled={saving || !dirty}>{saving ? "Salvando…" : isNew ? "Criar post" : "Salvar"}</button>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-8 mt-6">
        {/* ARTE */}
        <div>
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">Arte {slides.length > 0 && <span className="text-mute font-normal">· slide {slide + 1} de {slides.length}</span>}</div>
              <div className="flex gap-2">
                {post && <button className="btn btn-ghost text-xs py-1.5" onClick={() => setPreview(true)} disabled={!current}><Eye size={14} /> Ver como no Instagram</button>}
                {post && <button className="btn btn-ghost text-xs py-1.5" onClick={() => fileRef.current?.click()} disabled={uploading}><Upload size={14} /> {uploading ? "Enviando…" : "Enviar arquivos"}</button>}
                <input ref={fileRef} type="file" multiple accept="image/*,video/mp4" className="hidden" onChange={(e) => onFiles(e.target.files)} />
              </div>
            </div>
            {current ? (
              <div className="relative bg-ink-900 rounded-xl overflow-hidden grid place-items-center">
                <img src={current.url} alt="" className="max-h-[640px] object-contain" />
                {slides.length > 1 && (
                  <>
                    <button className="absolute left-2 top-1/2 -translate-y-1/2 btn btn-ghost bg-black/50 p-2" onClick={() => setSlide((slide - 1 + slides.length) % slides.length)}><ChevronLeft size={18} /></button>
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost bg-black/50 p-2" onClick={() => setSlide((slide + 1) % slides.length)}><ChevronRight size={18} /></button>
                  </>
                )}
              </div>
            ) : (
              <div className="h-64 grid place-items-center text-mute text-sm rounded-xl border border-dashed border-white/15">
                {isNew ? "Crie o post para enviar as artes." : "Nenhuma arte. Envie os slides (PNG) e, se houver, o vídeo (MP4)."}
              </div>
            )}
            {slides.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {slides.map((s, i) => (
                  <div key={s.path} className="shrink-0 group relative">
                    <img src={s.url} alt="" onClick={() => setSlide(i)}
                      className={`w-16 h-20 object-cover rounded-lg cursor-pointer border-2 ${i === slide ? "border-brand-400" : "border-transparent opacity-70"}`} />
                    <div className="absolute inset-x-0 -bottom-1 hidden group-hover:flex justify-center gap-0.5">
                      <button onClick={() => moveSlide(i, -1)} className="bg-black/70 rounded px-1 text-[10px]">←</button>
                      <button onClick={() => removeSlide(i)} className="bg-black/70 rounded px-1 text-[10px] text-red-300"><Trash2 size={10} /></button>
                      <button onClick={() => moveSlide(i, 1)} className="bg-black/70 rounded px-1 text-[10px]">→</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {form.video && (
              <div className="mt-3">
                <div className="text-xs text-mute mb-1">Vídeo</div>
                <video src={form.video.url} controls className="max-h-96 rounded-xl bg-black" />
              </div>
            )}
          </div>

          {/* LEGENDA */}
          <div className="card p-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold">Legenda</div>
              <button className="btn btn-ghost text-xs py-1.5" onClick={() => navigator.clipboard.writeText(form.caption)}><Copy size={14} /> Copiar</button>
            </div>
            <textarea className="input min-h-56 font-sans text-[13px] leading-relaxed" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} placeholder="Texto da legenda, com hashtags." />
            <div className="text-xs text-mute mt-1">{form.caption.length} caracteres · limite do Instagram: 2.200</div>
          </div>
        </div>

        {/* LATERAL */}
        <div className="flex flex-col gap-4">
          <div className="card p-4 flex flex-col gap-3">
            <div className="text-sm font-semibold">Dados</div>
            <label className="text-xs text-mute">Título<input className="input mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label className="text-xs text-mute">Série<input className="input mt-1" value={form.series} onChange={(e) => setForm({ ...form, series: e.target.value })} placeholder="Você acertaria? · Questão do dia…" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-mute">Formato
                <select className="input mt-1" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as Kind })}>
                  {Object.entries(KIND_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </label>
              <label className="text-xs text-mute">Família da capa
                <select className="input mt-1" value={form.family} onChange={(e) => setForm({ ...form, family: e.target.value as Family })}>
                  {Object.entries(FAMILY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-mute">Data planejada<input type="date" className="input mt-1" value={form.scheduledAt || ""} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value || null })} /></label>
              <label className="text-xs text-mute">Ordem no dia<input type="number" className="input mt-1" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></label>
            </div>
            {post && (
              <label className="text-xs text-mute">Status
                <select className="input mt-1" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Status })}>
                  {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k} disabled={!canApprove && ["aprovado", "publicado"].includes(k)}>{v}</option>)}
                </select>
              </label>
            )}
          </div>

          {post && (
            <div className="card p-4">
              <div className="text-sm font-semibold">Revisão</div>
              <p className="text-xs text-mute mt-1">
                {canApprove ? "Aprove ou peça ajuste. Ao pedir ajuste, o comentário abaixo é obrigatório." : "Só aprovadores decidem. Deixe seu comentário e envie para revisão."}
              </p>
              <textarea className="input mt-3 min-h-24 text-[13px]" placeholder={form.kind === "carrossel" ? `Comentário sobre o slide ${slide + 1}…` : "Comentário…"} value={text} onChange={(e) => setText(e.target.value)} />
              <div className="flex gap-2 mt-3 flex-wrap">
                <button className="btn btn-ghost text-xs" onClick={sendComment} disabled={!text.trim()}><Send size={14} /> Comentar</button>
                {canApprove ? (
                  <>
                    <button className="btn btn-ok text-xs" onClick={() => decide("aprovado")}><Check size={14} /> Aprovar</button>
                    <button className="btn btn-danger text-xs" onClick={() => decide("ajustar")}><CircleAlert size={14} /> Pedir ajuste</button>
                  </>
                ) : (
                  post.status !== "revisao" && <button className="btn btn-primary text-xs" onClick={() => decide("revisao")}>Enviar para revisão</button>
                )}
              </div>
              {post.reviewedBy && <div className="text-[11px] text-mute mt-3">Última decisão: {post.reviewedBy} · {post.reviewedAt ? new Date(post.reviewedAt).toLocaleString("pt-BR") : ""}</div>}
            </div>
          )}

          {post && (
            <div className="card p-4">
              <div className="text-sm font-semibold mb-2">Comentários <span className="text-mute font-normal">({comments.length})</span></div>
              <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                {comments.length === 0 && <div className="text-xs text-mute">Nenhum comentário.</div>}
                {comments.map((c) => (
                  <div key={c.id} className={`rounded-xl border border-white/8 p-3 text-[13px] ${c.resolved ? "opacity-50" : ""}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-xs">{c.authorName} {c.slide !== null && <button onClick={() => setSlide(c.slide!)} className="pill bg-brand-400/15 text-brand-400 ml-1">slide {c.slide + 1}</button>}</div>
                      <div className="text-[10px] text-mute">{new Date(c.createdAt).toLocaleString("pt-BR")}</div>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap">{c.text}</p>
                    <button className="text-[11px] text-brand-400 mt-1 underline" onClick={() => toggleComment(post.id, c.id, !c.resolved)}>{c.resolved ? "Reabrir" : "Marcar resolvido"}</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {post && member?.role === "admin" && (
            <button className="btn btn-danger text-xs self-start" onClick={async () => { if (confirm("Excluir este post e suas artes?")) { await deletePost(post); router.push("/"); } }}><Trash2 size={14} /> Excluir post</button>
          )}
        </div>
      </div>

      {preview && current && (
        <div className="fixed inset-0 bg-black/80 grid place-items-center z-50" onClick={() => setPreview(false)}>
          <div className="w-[390px] bg-black rounded-[32px] border border-white/15 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 p-3 text-xs"><img src="/logo-mark.png" className="w-7 h-7 rounded-full bg-ink-700 object-contain" alt="" /><b>anestesiaquestoes</b></div>
            <div className="relative aspect-[4/5] bg-ink-900">
              <img src={current.url} alt="" className="w-full h-full object-contain" />
              {slides.length > 1 && <div className="absolute top-2 right-2 pill bg-black/60 text-white">{slide + 1}/{slides.length}</div>}
            </div>
            <div className="p-3 text-xs">
              <div className="flex gap-3 text-white/80 mb-2">♡ ◯ ⇗</div>
              <p className="whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto"><b>anestesiaquestoes</b> {form.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
