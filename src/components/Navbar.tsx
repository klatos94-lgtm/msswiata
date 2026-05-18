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
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-white">
            World Cup Betting
          </Link>

          <div className="flex items-center gap-4 text-sm">
            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition">
                  Dashboard
                </Link>
                <Link href="/matches" className="text-gray-300 hover:text-white transition">
                  Mecze
                </Link>
                <Link href="/leaderboard" className="text-gray-300 hover:text-white transition">
                  Ranking
                </Link>
                <Link href="/admin" className="text-gray-300 hover:text-white transition">
                  Admin
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                >
                  Wyloguj
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded transition"
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
