"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { useServerTime, getServerNow } from "@/lib/server-time";

interface PredictionFormProps {
  matchId: string;
  userId: string;
  matchDate: string;
  existingPrediction?: { predicted_home: number; predicted_away: number } | null;
  onSave?: () => void;
}

export default function PredictionForm({
  matchId,
  userId,
  matchDate,
  existingPrediction,
  onSave,
}: PredictionFormProps) {
  const [home, setHome] = useState(existingPrediction?.predicted_home?.toString() ?? "");
  const [away, setAway] = useState(existingPrediction?.predicted_away?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const { now } = useServerTime();
  const started = now >= new Date(matchDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (getServerNow() >= new Date(matchDate)) {
      setMessage("Mecz już się rozpoczął — nie można zmienić typu");
      setSaving(false);
      return;
    }

    setSaving(true);
    setMessage("");

    const homeScore = parseInt(home, 10);
    const awayScore = parseInt(away, 10);

    if (isNaN(homeScore) || isNaN(awayScore)) {
      setMessage("Wprowadź poprawne wyniki");
      setSaving(false);
      return;
    }

    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "apikey": anonKey,
    };
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    try {
      if (existingPrediction) {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/predictions?match_id=eq.${matchId}&user_id=eq.${userId}`,
          {
            method: "PATCH",
            headers,
            body: JSON.stringify({ predicted_home: homeScore, predicted_away: awayScore }),
          }
        );
        if (!res.ok) {
          setMessage("Błąd zapisu — spróbuj ponownie");
        } else {
          setMessage("Zaktualizowano!");
          onSave?.();
        }
      } else {
        const res = await fetch(`${supabaseUrl}/rest/v1/predictions`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            match_id: matchId,
            user_id: userId,
            predicted_home: homeScore,
            predicted_away: awayScore,
          }),
        });
        if (!res.ok) {
          setMessage("Błąd zapisu — spróbuj ponownie");
        } else {
          setMessage("Zapisano!");
          onSave?.();
        }
      }
    } catch {
      setMessage("Wystąpił nieoczekiwany błąd");
    }

    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center justify-end gap-0.5 sm:gap-1">
      <div className="flex items-center gap-px sm:gap-0.5">
        <input
          type="number"
          min="0"
          max="20"
          value={home}
          disabled={started}
          onChange={(e) => setHome(e.target.value)}
          className="w-7 sm:w-8 bg-white text-slate-800 text-center rounded border border-slate-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:outline-none transition text-[10px] sm:text-[11px] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
          placeholder="0"
        />
        <span className="text-slate-400 text-[10px] sm:text-[11px] font-semibold">:</span>
        <input
          type="number"
          min="0"
          max="20"
          value={away}
          disabled={started}
          onChange={(e) => setAway(e.target.value)}
          className="w-7 sm:w-8 bg-white text-slate-800 text-center rounded border border-slate-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:outline-none transition text-[10px] sm:text-[11px] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
          placeholder="0"
        />
      </div>
      {!started && (
        <button
          type="submit"
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:bg-emerald-300 text-white px-1.5 sm:px-2 py-1 rounded text-[10px] sm:text-[11px] font-semibold transition-all duration-200"
        >
          {saving ? "..." : "OK"}
        </button>
      )}
      {message && <span className="text-[9px] sm:text-[10px] text-emerald-600 font-medium animate-fade-in">{message}</span>}
    </form>
  );
}
