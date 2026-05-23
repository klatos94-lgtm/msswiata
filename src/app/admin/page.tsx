"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import type { Match } from "@/types/match";


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

    const { data: adminData } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", userData.user.id)
      .single();

    if (adminData) {
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

    await supabase.rpc("calculate_match_points", {
      match_id: matchId,
      home_score: homeScore,
      away_score: awayScore,
    });

    loadMatches();
  };

  if (!isAdmin) return null;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4 text-slate-800">Panel Admina</h1>

      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-medium shadow-sm transition text-sm"
      >
        {showAddForm ? "Anuluj" : "+ Dodaj mecz"}
      </button>

      {showAddForm && (
        <form
          onSubmit={handleAddMatch}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm my-3 grid gap-2 max-w-md"
        >
          <input
            type="text"
            placeholder="Drużyna gospodarzy"
            value={homeTeam}
            onChange={(e) => setHomeTeam(e.target.value)}
            required
            className="bg-slate-50 text-slate-800 rounded-lg px-3 py-1.5 border border-slate-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:outline-none transition text-sm"
          />
          <input
            type="text"
            placeholder="Drużyna gości"
            value={awayTeam}
            onChange={(e) => setAwayTeam(e.target.value)}
            required
            className="bg-slate-50 text-slate-800 rounded-lg px-3 py-1.5 border border-slate-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:outline-none transition text-sm"
          />
          <input
            type="datetime-local"
            value={matchDate}
            onChange={(e) => setMatchDate(e.target.value)}
            required
            className="bg-slate-50 text-slate-800 rounded-lg px-3 py-1.5 border border-slate-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:outline-none transition text-sm"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg font-medium shadow-sm transition text-sm"
          >
            Zapisz mecz
          </button>
        </form>
      )}

      <div className="grid gap-2 mt-4">
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
    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-slate-800 text-sm font-semibold">{match.home_team}</p>
        </div>
        <div className="flex items-center gap-1.5 mx-3">
          <input
            type="number"
            min="0"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            disabled={match.finished}
            className="w-12 bg-slate-50 text-slate-800 text-center rounded-lg px-1 py-1 border border-slate-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none transition text-sm"
          />
          <span className="text-slate-400 font-medium">:</span>
          <input
            type="number"
            min="0"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            disabled={match.finished}
            className="w-12 bg-slate-50 text-slate-800 text-center rounded-lg px-1 py-1 border border-slate-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none transition text-sm"
          />
        </div>
        <div className="flex-1 text-right">
          <p className="text-slate-800 text-sm font-semibold">{match.away_team}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
        <span>
          {new Date(match.match_date).toLocaleDateString("pl-PL")}
        </span>
        {!match.finished ? (
          <button
            onClick={() =>
              onFinish(match.id, parseInt(homeScore) || 0, parseInt(awayScore) || 0)
            }
            disabled={!homeScore || !awayScore}
            className="bg-amber-100 hover:bg-amber-200 disabled:bg-slate-100 text-amber-700 disabled:text-slate-400 px-2.5 py-0.5 rounded-lg font-medium transition text-xs"
          >
            Zakończ mecz
          </button>
        ) : (
          <span className="text-emerald-600 font-medium text-xs">✓ Zakończony</span>
        )}
      </div>
    </div>
  );
}
