"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-slate-200/60 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-emerald-700">
            ⚽ World Cup Betting
          </Link>

          <div className="flex items-center gap-4 text-sm">
            {user ? (
              <>
                <Link href="/dashboard" className="text-slate-600 hover:text-emerald-700 font-medium transition">
                  Dashboard
                </Link>
                <Link href="/matches" className="text-slate-600 hover:text-emerald-700 font-medium transition">
                  Mecze
                </Link>
                <Link href="/leaderboard" className="text-slate-600 hover:text-emerald-700 font-medium transition">
                  Ranking
                </Link>
                <Link href="/admin" className="text-slate-600 hover:text-emerald-700 font-medium transition">
                  Admin
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium transition"
                >
                  Wyloguj
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition"
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
