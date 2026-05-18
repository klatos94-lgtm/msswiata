"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import type { Match } from "@/types/match";
import { calculatePoints } from "@/lib/points";

export default function AdminPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [matchDate, setMatchDate] = useState("");

  useEffect(() => {
    checkAdmin();
    loadMatches();
  }, []);

  const checkAdmin = async () => {
    const supabase = getSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("users")
      .select("nickname")
      .eq("id", userData.user.id)
      .single();

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (userData.user.email === adminEmail) {
      setIsAdmin(true);
    } else {
      router.push("/dashboard");
    }
  };

  const loadMatches = async () => {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: true });
    if (data) setMatches(data);
  };

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeam || !awayTeam || !matchDate) return;
    const supabase = getSupabaseClient();

    const { error } = await supabase.from("matches").insert([
      {
        home_team: homeTeam,
        away_team: awayTeam,
        match_date: new Date(matchDate).toISOString(),
      },
    ]);

    if (!error) {
      setHomeTeam("");
      setAwayTeam("");
      setMatchDate("");
      setShowAddForm(false);
      loadMatches();
    }
  };

  const handleScoreUpdate = async (
    matchId: string,
    homeScore: number,
    awayScore: number
  ) => {
    const supabase = getSupabaseClient();
    await supabase
      .from("matches")
      .update({ home_score: homeScore, away_score: awayScore, finished: true })
      .eq("id", matchId);

    recalculatePoints(matchId, homeScore, awayScore);
    loadMatches();
  };

  const recalculatePoints = async (
    matchId: string,
    homeScore: number,
    awayScore: number
  ) => {
    const supabase = getSupabaseClient();
    const { data: predictions } = await supabase
      .from("predictions")
      .select("*")
      .eq("match_id", matchId);

    if (!predictions) return;

    for (const prediction of predictions) {
      const points = calculatePoints(
        prediction.predicted_home,
        prediction.predicted_away,
        homeScore,
        awayScore
      );

      await supabase
        .from("predictions")
        .update({ points })
        .eq("id", prediction.id);
    }
  };

  if (!isAdmin) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Panel Admina</h1>

      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded mb-6 transition"
      >
        {showAddForm ? "Anuluj" : "Dodaj mecz"}
      </button>

      {showAddForm && (
        <form
          onSubmit={handleAddMatch}
          className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6 grid gap-3 max-w-md"
        >
          <input
            type="text"
            placeholder="Drużyna gospodarzy"
            value={homeTeam}
            onChange={(e) => setHomeTeam(e.target.value)}
            required
            className="bg-gray-700 text-white rounded px-3 py-2 border border-gray-600"
          />
          <input
            type="text"
            placeholder="Drużyna gości"
            value={awayTeam}
            onChange={(e) => setAwayTeam(e.target.value)}
            required
            className="bg-gray-700 text-white rounded px-3 py-2 border border-gray-600"
          />
          <input
            type="datetime-local"
            value={matchDate}
            onChange={(e) => setMatchDate(e.target.value)}
            required
            className="bg-gray-700 text-white rounded px-3 py-2 border border-gray-600"
          />
          <button
            type="submit"
            className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded transition"
          >
            Zapisz mecz
          </button>
        </form>
      )}

      <div className="grid gap-3">
        {matches.map((match) => (
          <MatchAdminCard
            key={match.id}
            match={match}
            onFinish={handleScoreUpdate}
          />
        ))}
      </div>
    </div>
  );
}

function MatchAdminCard({
  match,
  onFinish,
}: {
  match: Match;
  onFinish: (id: string, home: number, away: number) => void;
}) {
  const [homeScore, setHomeScore] = useState(
    match.home_score?.toString() ?? ""
  );
  const [awayScore, setAwayScore] = useState(
    match.away_score?.toString() ?? ""
  );

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-white font-semibold">{match.home_team}</p>
        </div>
        <div className="flex items-center gap-2 mx-4">
          <input
            type="number"
            min="0"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            disabled={match.finished}
            className="w-14 bg-gray-700 text-white text-center rounded px-2 py-1 border border-gray-600"
          />
          <span className="text-gray-400">:</span>
          <input
            type="number"
            min="0"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            disabled={match.finished}
            className="w-14 bg-gray-700 text-white text-center rounded px-2 py-1 border border-gray-600"
          />
        </div>
        <div className="flex-1 text-right">
          <p className="text-white font-semibold">{match.away_team}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
        <span>
          {new Date(match.match_date).toLocaleDateString("pl-PL")}
        </span>
        {!match.finished ? (
          <button
            onClick={() =>
              onFinish(match.id, parseInt(homeScore) || 0, parseInt(awayScore) || 0)
            }
            disabled={!homeScore || !awayScore}
            className="bg-yellow-700 hover:bg-yellow-600 disabled:bg-gray-700 text-white px-3 py-1 rounded transition"
          >
            Zakończ mecz
          </button>
        ) : (
          <span className="text-green-400">Zakończony</span>
        )}
      </div>
    </div>
  );
}
