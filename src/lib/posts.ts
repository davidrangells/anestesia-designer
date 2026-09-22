import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp,
  updateDoc, getDocs, setDoc,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "./firebase";
import { Comment, Family, Kind, Member, Post, Slide, Status } from "./types";

const toPost = (id: string, d: Record<string, unknown>): Post => ({
  id,
  title: (d.title as string) || "",
  series: (d.series as string) || "",
  kind: (d.kind as Kind) || "post",
  family: (d.family as Family) || "D",
  caption: (d.caption as string) || "",
  status: (d.status as Status) || "rascunho",
  scheduledAt: (d.scheduledAt as string) || null,
  order: (d.order as number) || 0,
  slides: (d.slides as Slide[]) || [],
  video: (d.video as Slide) || null,
  createdBy: (d.createdBy as string) || "",
  createdAt: (d.createdAt as number) || 0,
  updatedAt: (d.updatedAt as number) || 0,
  reviewedBy: (d.reviewedBy as string) || null,
  reviewedAt: (d.reviewedAt as number) || null,
});

export function watchPosts(cb: (posts: Post[]) => void) {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => toPost(d.id, d.data()))));
}

export function watchPost(id: string, cb: (post: Post | null) => void) {
  return onSnapshot(doc(db, "posts", id), (snap) => cb(snap.exists() ? toPost(snap.id, snap.data()) : null));
}

export function watchComments(postId: string, cb: (c: Comment[]) => void) {
  const q = query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Comment, "id">) }))));
}

export async function createPost(data: Omit<Post, "id" | "createdAt" | "updatedAt">) {
  const now = Date.now();
  const refDoc = await addDoc(collection(db, "posts"), { ...data, createdAt: now, updatedAt: now, _ts: serverTimestamp() });
  return refDoc.id;
}

export async function updatePost(id: string, data: Partial<Post>) {
  await updateDoc(doc(db, "posts", id), { ...data, updatedAt: Date.now() });
}

export async function setStatus(id: string, status: Status, by: string) {
  await updateDoc(doc(db, "posts", id), { status, updatedAt: Date.now(), reviewedBy: by, reviewedAt: Date.now() });
}

export async function deletePost(post: Post) {
  await Promise.allSettled([...post.slides, ...(post.video ? [post.video] : [])].map((s) => deleteObject(ref(storage, s.path))));
  await deleteDoc(doc(db, "posts", post.id));
}

export async function uploadFile(postId: string, file: File): Promise<Slide> {
  const safe = file.name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `posts/${postId}/${Date.now()}-${safe}`;
  const r = ref(storage, path);
  await uploadBytes(r, file, { contentType: file.type });
  const url = await getDownloadURL(r);
  return { name: file.name, path, url };
}

export async function addComment(postId: string, c: Omit<Comment, "id" | "createdAt" | "resolved">) {
  await addDoc(collection(db, "posts", postId, "comments"), { ...c, createdAt: Date.now(), resolved: false });
}

export async function toggleComment(postId: string, id: string, resolved: boolean) {
  await updateDoc(doc(db, "posts", postId, "comments", id), { resolved });
}

export async function listMembers(): Promise<Member[]> {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ email: d.id, ...(d.data() as Omit<Member, "email">) }));
}

export async function saveMember(m: Member) {
  await setDoc(doc(db, "users", m.email.toLowerCase()), { name: m.name, role: m.role });
}

export async function removeMember(email: string) {
  await deleteDoc(doc(db, "users", email));
}

/** Ordem do feed do Instagram: o mais recente à esquerda. */
export function feedOrder(posts: Post[]) {
  return [...posts].sort((a, b) => {
    const da = a.scheduledAt || "9999-99-99";
    const dbb = b.scheduledAt || "9999-99-99";
    if (da !== dbb) return dbb.localeCompare(da);
    return b.order - a.order;
  });
}
