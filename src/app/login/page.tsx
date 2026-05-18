"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = getSupabaseClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard");
      }
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
      } else if (data.user) {
        const { error: profileError } = await supabase.from("users").insert([
          { id: data.user.id, email, nickname: nickname || email.split("@")[0] },
        ]);
        if (profileError) {
          setError(profileError.message);
        } else {
          router.push("/dashboard");
        }
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {mode === "login" ? "Zaloguj się" : "Zarejestruj się"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-gray-700 text-white rounded px-4 py-2 border border-gray-600"
          />

          {mode === "register" && (
            <input
              type="text"
              placeholder="Nick (opcjonalnie)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="bg-gray-700 text-white rounded px-4 py-2 border border-gray-600"
            />
          )}

          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="bg-gray-700 text-white rounded px-4 py-2 border border-gray-600"
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-green-700 hover:bg-green-600 disabled:bg-green-900 text-white rounded px-4 py-2 font-medium transition"
          >
            {loading
              ? "Proszę czekać..."
              : mode === "login"
              ? "Zaloguj"
              : "Zarejestruj"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          {mode === "login" ? (
            <>
              Nie masz konta?{" "}
              <button
                onClick={() => setMode("register")}
                className="text-blue-400 hover:underline"
              >
                Zarejestruj się
              </button>
            </>
          ) : (
            <>
              Masz już konto?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-blue-400 hover:underline"
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
