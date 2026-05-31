"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) checkAdmin(data.user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) checkAdmin(session.user.id);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const checkAdmin = async (userId: string) => {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", userId)
      .single();
    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="text-lg font-bold text-emerald-700 hover:text-emerald-800 transition-colors tracking-tight">
            ⚽ <span className="hidden sm:inline">World Cup Betting</span><span className="sm:hidden">Typy</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-3 text-sm">
            {user ? (
              <>
                <Link href="/dashboard" className="px-2.5 py-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-medium transition-all duration-200">
                  Dashboard
                </Link>
                <Link href="/matches" className="px-2.5 py-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-medium transition-all duration-200">
                  Mecze
                </Link>
                <Link href="/testowe" className="px-2.5 py-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-medium transition-all duration-200">
                  Testowe
                </Link>
                <Link href="/leaderboard" className="px-2.5 py-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-medium transition-all duration-200">
                  Ranking
                </Link>
                <Link href="/tabela" className="px-2.5 py-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-medium transition-all duration-200">
                  Tabela
                </Link>
                <Link href="/regulamin" className="px-2.5 py-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-medium transition-all duration-200">
                  Regulamin
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="px-2.5 py-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-medium transition-all duration-200">
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-50 hover:bg-red-100 active:scale-95 text-red-600 px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm"
                >
                  Wyloguj
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-1.5 rounded-lg font-medium shadow-sm transition-all duration-200"
              >
                Zaloguj
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
