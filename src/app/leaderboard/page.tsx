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
    <div>
      <h1 className="text-2xl font-bold mb-6">Ranking</h1>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Ładowanie...</div>
        ) : (
          <LeaderboardTable entries={entries} />
        )}
      </div>
    </div>
  );
}
