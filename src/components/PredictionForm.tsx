"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

interface PredictionFormProps {
  matchId: string;
  userId: string;
  existingPrediction?: { predicted_home: number; predicted_away: number } | null;
}

export default function PredictionForm({
  matchId,
  userId,
  existingPrediction,
}: PredictionFormProps) {
  const [home, setHome] = useState(existingPrediction?.predicted_home?.toString() ?? "");
  const [away, setAway] = useState(existingPrediction?.predicted_away?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      }
    }

    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min="0"
          max="20"
          value={home}
          onChange={(e) => setHome(e.target.value)}
          className="w-14 bg-white text-slate-800 text-center rounded-lg px-1 py-1 border border-slate-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:outline-none transition text-sm"
          placeholder="0"
        />
        <span className="text-slate-400 font-medium">:</span>
        <input
          type="number"
          min="0"
          max="20"
          value={away}
          onChange={(e) => setAway(e.target.value)}
          className="w-14 bg-white text-slate-800 text-center rounded-lg px-1 py-1 border border-slate-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:outline-none transition text-sm"
          placeholder="0"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-4 py-1 rounded-lg text-xs font-medium shadow-sm transition"
      >
        {saving ? "Zapisywanie..." : existingPrediction ? "Zmień typ" : "Obstaw"}
      </button>

      {message && <p className="text-xs text-emerald-600 font-medium">{message}</p>}
    </form>
  );
}
