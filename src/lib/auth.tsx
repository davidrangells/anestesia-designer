"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";
import { BOOTSTRAP_ADMINS, Member, Role } from "./types";

type Ctx = {
  user: User | null;
  member: Member | null;
  loading: boolean;
  denied: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthCtx = createContext<Ctx>({
  user: null, member: null, loading: true, denied: false, error: null,
  login: async () => {}, logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setMember(null);
      setDenied(false);
      if (u?.email) {
        const email = u.email.toLowerCase();
        try {
          const snap = await getDoc(doc(db, "users", email));
          if (snap.exists()) {
            const d = snap.data();
            setMember({ email, name: d.name || u.displayName || email, role: d.role as Role });
          } else if (BOOTSTRAP_ADMINS.includes(email)) {
            setMember({ email, name: u.displayName || email, role: "admin" });
          } else {
            setDenied(true);
          }
        } catch (e) {
          setError(`Falha ao verificar acesso: ${(e as Error).message}`);
          setDenied(true);
        }
      }
      setLoading(false);
    });
  }, []);

  return (
    <AuthCtx.Provider value={{
      user, member, loading, denied, error,
      login: async () => {
        setError(null);
        try {
          await signInWithPopup(auth, googleProvider);
        } catch (e) {
          const err = e as { code?: string; message?: string };
          setError(`${err.code || "erro"}: ${err.message || ""}`);
        }
      },
      logout: async () => { await signOut(auth); },
    }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
