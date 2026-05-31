"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import LeaderboardTable from "@/components/LeaderboardTable";
import type { LeaderboardEntry } from "@/types/user";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const supabase = getSupabaseClient();

    const { data: predictions } = await supabase
      .from("predictions")
      .select("user_id, points");

    if (!predictions) {
      setLoading(false);
      return;
    }

    const pointsMap = new Map<string, number>();
    for (const p of predictions) {
      pointsMap.set(p.user_id, (pointsMap.get(p.user_id) ?? 0) + (p.points ?? 0));
    }

    const userIds = Array.from(pointsMap.keys());
    if (userIds.length === 0) {
      setLoading(false);
      return;
    }

    const { data: users } = await supabase
      .from("users")
      .select("id, email, nickname")
      .in("id", userIds);

    if (users) {
      const result: LeaderboardEntry[] = users
        .map((u) => ({
          user_id: u.id,
          email: u.email,
          nickname: u.nickname,
          total_points: pointsMap.get(u.id) ?? 0,
        }))
        .sort((a, b) => b.total_points - a.total_points);

      setEntries(result);
    }

    setLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-[#001e28] rounded-xl overflow-hidden shadow-lg mb-6">
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <span className="text-xl">🏆</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Ranking</h1>
            <p className="text-emerald-400 text-[11px] font-medium">Klasyfikacja graczy</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-8 text-slate-400">Ładowanie...</div>
        ) : (
          <LeaderboardTable entries={entries} />
        )}
      </div>
    </div>
  );
}
