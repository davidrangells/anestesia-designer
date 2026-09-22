export type Role = "admin" | "aprovador" | "produtor";
export type Status = "rascunho" | "revisao" | "ajustar" | "aprovado" | "publicado";
export type Kind = "carrossel" | "post" | "reel" | "story";
export type Family = "D" | "L" | "G";

export type Slide = { name: string; path: string; url: string };

export type Post = {
  id: string;
  title: string;
  series: string;
  kind: Kind;
  family: Family;
  caption: string;
  status: Status;
  scheduledAt: string | null; // YYYY-MM-DD
  order: number;
  slides: Slide[];
  video: Slide | null;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  reviewedBy?: string | null;
  reviewedAt?: number | null;
};

export type Comment = {
  id: string;
  text: string;
  slide: number | null;
  authorEmail: string;
  authorName: string;
  createdAt: number;
  resolved: boolean;
};

export type Member = { email: string; name: string; role: Role };

export const STATUS_LABEL: Record<Status, string> = {
  rascunho: "Rascunho",
  revisao: "Em revisão",
  ajustar: "Ajustar",
  aprovado: "Aprovado",
  publicado: "Publicado",
};

export const STATUS_COLOR: Record<Status, string> = {
  rascunho: "bg-white/10 text-soft",
  revisao: "bg-brand-400/15 text-brand-400",
  ajustar: "bg-red-500/15 text-red-400",
  aprovado: "bg-green-500/15 text-green-400",
  publicado: "bg-white/10 text-white",
};

export const KIND_LABEL: Record<Kind, string> = {
  carrossel: "Carrossel",
  post: "Post",
  reel: "Reel",
  story: "Story",
};

export const FAMILY_LABEL: Record<Family, string> = { D: "Escura", L: "Clara", G: "Gradiente" };

export const BOOTSTRAP_ADMINS = ["davidrangel01@gmail.com"];
