"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
      .maybeSingle();
    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setMobileOpen(false);
    router.push("/login");
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/matches", label: "Typy" },
    { href: "/leaderboard", label: "Ranking" },
    { href: "/tabela", label: "Tabela" },
    { href: "/grupy", label: "Grupy" },
    { href: "/regulamin", label: "Regulamin" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="text-lg font-bold text-emerald-700 hover:text-emerald-800 transition-colors tracking-tight">
            ⚽ <span className="hidden sm:inline">World Cup Betting</span><span className="sm:hidden">Typy</span>
          </Link>

          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-1 sm:gap-3 text-sm">
                {navLinks.map((link) => (
                  <NavLink key={link.href} href={link.href} pathname={pathname}>{link.label}</NavLink>
                ))}
                <button
                  onClick={handleLogout}
                  className="bg-red-50 hover:bg-red-100 active:scale-95 text-red-600 px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm"
                >
                  Wyloguj
                </button>
              </div>

              <button
                onClick={() => setMobileOpen(true)}
                className="sm:hidden p-2 text-slate-600 hover:text-emerald-700 transition-colors -mr-2"
                aria-label="Menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
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

      {mobileOpen && user && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between px-4 h-14 border-b border-slate-200">
              <span className="font-bold text-emerald-700">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-700 transition-colors"
                aria-label="Zamknij menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="py-2">
              {navLinks.map((link) => {
                const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 text-sm font-medium transition-colors ${
                      active
                        ? "text-emerald-700 bg-emerald-50 border-r-2 border-emerald-600"
                        : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 px-4 py-3 bg-white">
              <button
                onClick={handleLogout}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm text-center"
              >
                Wyloguj
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, pathname, children }: { href: string; pathname: string; children: React.ReactNode }) {
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`px-2.5 py-1.5 rounded-lg font-medium transition-all duration-200 ${
        active
          ? "text-emerald-700 bg-emerald-50 shadow-sm"
          : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
      }`}
    >
      {children}
    </Link>
  );
}
