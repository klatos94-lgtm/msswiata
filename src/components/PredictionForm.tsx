"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

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

  const started = new Date() >= new Date(matchDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (new Date() >= new Date(matchDate)) {
      setMessage("Mecz już się rozpoczął — nie można zmienić typu");
      setSaving(false);
      return;
    }

    setSaving(true);
    setMessage("");
    const supabase = getSupabaseClient();

    const homeScore = parseInt(home, 10);
    const awayScore = parseInt(away, 10);

    if (isNaN(homeScore) || isNaN(awayScore)) {
      setMessage("Wprowadź poprawne wyniki");
      setSaving(false);
      return;
    }

    if (existingPrediction) {
      const { error } = await supabase
        .from("predictions")
        .update({ predicted_home: homeScore, predicted_away: awayScore })
        .eq("match_id", matchId)
        .eq("user_id", userId);

      if (error) {
        setMessage("Błąd zapisu: " + error.message);
      } else {
        setMessage("Zaktualizowano!");
        onSave?.();
      }
    } else {
      const { error } = await supabase.from("predictions").insert([
        {
          match_id: matchId,
          user_id: userId,
          predicted_home: homeScore,
          predicted_away: awayScore,
        },
      ]);

      if (error) {
        setMessage("Błąd zapisu: " + error.message);
      } else {
        setMessage("Zapisano!");
        onSave?.();
      }
    }

    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-1 mt-1">
      <div className="flex items-center gap-1">
        <input
          type="number"
          min="0"
          max="20"
          value={home}
          disabled={started}
          onChange={(e) => setHome(e.target.value)}
          className="w-10 bg-white text-slate-800 text-center rounded-md px-0.5 py-1 border border-slate-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:outline-none transition text-[11px] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
          placeholder="0"
        />
        <span className="text-slate-400 text-[11px] font-semibold">:</span>
        <input
          type="number"
          min="0"
          max="20"
          value={away}
          disabled={started}
          onChange={(e) => setAway(e.target.value)}
          className="w-10 bg-white text-slate-800 text-center rounded-md px-0.5 py-1 border border-slate-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:outline-none transition text-[11px] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
          placeholder="0"
        />
      </div>

      {started ? (
        <span className="text-[10px] text-red-500 font-medium">Mecz już się rozpoczął</span>
      ) : (
        <button
          type="submit"
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:bg-emerald-300 text-white px-4 py-1 rounded-md text-[11px] font-semibold shadow-sm transition-all duration-200"
        >
          {saving ? "..." : existingPrediction ? "Zmień typ" : "Obstaw"}
        </button>
      )}

      {message && <p className="text-[10px] text-emerald-600 font-medium animate-fade-in">{message}</p>}
    </form>
  );
}
