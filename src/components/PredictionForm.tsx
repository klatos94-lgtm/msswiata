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
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          max="20"
          value={home}
          onChange={(e) => setHome(e.target.value)}
          className="w-16 bg-gray-700 text-white text-center rounded px-2 py-1 border border-gray-600"
          placeholder="0"
        />
        <span className="text-gray-400">:</span>
        <input
          type="number"
          min="0"
          max="20"
          value={away}
          onChange={(e) => setAway(e.target.value)}
          className="w-16 bg-gray-700 text-white text-center rounded px-2 py-1 border border-gray-600"
          placeholder="0"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-blue-700 hover:bg-blue-600 disabled:bg-blue-900 text-white px-4 py-1 rounded text-sm transition"
      >
        {saving ? "Zapisywanie..." : existingPrediction ? "Zmień typ" : "Obstaw"}
      </button>

      {message && <p className="text-xs text-green-400">{message}</p>}
    </form>
  );
}
