"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 30000;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const attempts = useRef(0);
  const lastAttempt = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const updateCooldown = () => {
    const remaining = COOLDOWN_MS - (Date.now() - lastAttempt.current);
    if (remaining > 0) {
      setCooldown(Math.ceil(remaining / 1000));
    } else {
      setCooldown(0);
      attempts.current = 0;
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cooldown > 0) return;

    if (Date.now() - lastAttempt.current > 60000) {
      attempts.current = 0;
    }

    if (attempts.current >= MAX_ATTEMPTS) {
      lastAttempt.current = Date.now();
      setCooldown(Math.ceil(COOLDOWN_MS / 1000));
      timerRef.current = setInterval(updateCooldown, 1000);
      return;
    }

    setLoading(true);
    setError("");
    const supabase = getSupabaseClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        attempts.current++;
        lastAttempt.current = Date.now();
        setError("Nieprawidłowy email lub hasło");
      } else {
        attempts.current = 0;
        router.push("/dashboard");
      }
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        attempts.current++;
        lastAttempt.current = Date.now();
        setError("Rejestracja nie powiodła się — spróbuj ponownie");
      } else {
        attempts.current = 0;
        if (data.user && nickname) {
          await supabase.from("users").update({ nickname }).eq("id", data.user.id);
        }
        router.push("/dashboard");
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg w-full max-w-sm animate-fade-in">
        <div className="text-center mb-5">
          <img src="/fifa-logo.png" alt="FIFA" className="h-8 w-auto mx-auto" />
          <h2 className="text-xl font-bold text-slate-800 mt-2">
            {mode === "login" ? "Zaloguj się" : "Zarejestruj się"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-slate-50 text-slate-800 rounded-lg px-3 py-2.5 border border-slate-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:outline-none transition text-sm"
          />

          {mode === "register" && (
            <input
              type="text"
              placeholder="Nick (opcjonalnie)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="bg-slate-50 text-slate-800 rounded-lg px-3 py-2.5 border border-slate-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:outline-none transition text-sm"
            />
          )}

          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="bg-slate-50 text-slate-800 rounded-lg px-3 py-2.5 border border-slate-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:outline-none transition text-sm"
          />

          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading || cooldown > 0}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:bg-emerald-300 text-white rounded-lg px-4 py-2.5 font-semibold shadow-sm transition-all duration-200 text-sm"
          >
            {loading
              ? "Proszę czekać..."
              : cooldown > 0
              ? `Odczekaj ${cooldown}s`
              : mode === "login"
              ? "Zaloguj"
              : "Zarejestruj"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          {mode === "login" ? (
            <>
              Nie masz konta?{" "}
              <button
                onClick={() => setMode("register")}
                className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
              >
                Zarejestruj się
              </button>
            </>
          ) : (
            <>
              Masz już konto?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
              >
                Zaloguj się
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
