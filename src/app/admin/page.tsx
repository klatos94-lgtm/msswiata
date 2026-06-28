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
  const [matchStage, setMatchStage] = useState(1);
  const [finishingId, setFinishingId] = useState<string | null>(null);
  const [recalculatingId, setRecalculatingId] = useState<string | null>(null);

  const checkAdmin = async (): Promise<boolean> => {
    const supabase = getSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.push("/login");
      return false;
    }

    const { data: { session } } = await supabase.auth.getSession();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const headers: Record<string, string> = {
      "Content-Type": "application/json", "apikey": anonKey,
    };
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/admins?select=user_id&user_id=eq.${userData.user.id}`,
      { headers }
    );
    const adminRows = await res.json();

    return Array.isArray(adminRows) && adminRows.length > 0;
  };

  const loadMatches = async (): Promise<Match[]> => {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: true });
    return data ?? [];
  };

  useEffect(() => {
    checkAdmin().then(isAdmin => {
      if (!isAdmin) router.push("/dashboard");
      else setIsAdmin(true);
    });
    loadMatches().then(setMatches);
  }, []);

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeam || !awayTeam || !matchDate) return;
    const supabase = getSupabaseClient();

    const { error } = await supabase.from("matches").insert([
      {
        home_team: homeTeam,
        away_team: awayTeam,
        match_date: new Date(matchDate).toISOString(),
        stage: matchStage,
      },
    ]);

    if (!error) {
      setHomeTeam("");
      setAwayTeam("");
      setMatchDate("");
      setMatchStage(1);
      setShowAddForm(false);
      loadMatches();
    }
  };

  const handleScoreUpdate = async (
    matchId: string,
    homeScore: number,
    awayScore: number
  ) => {
    setFinishingId(matchId);
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const headers: Record<string, string> = {
      "Content-Type": "application/json", "apikey": anonKey,
    };
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    await fetch(`${supabaseUrl}/rest/v1/rpc/calculate_match_points`, {
      method: "POST",
      headers,
      body: JSON.stringify({ p_match_id: matchId, p_home_score: homeScore, p_away_score: awayScore }),
    });

    setFinishingId(null);
    loadMatches();
  };

  const handleRecalculate = async (
    matchId: string,
    homeScore: number,
    awayScore: number
  ) => {
    setRecalculatingId(matchId);
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const headers: Record<string, string> = {
      "Content-Type": "application/json", "apikey": anonKey,
    };
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    await fetch(`${supabaseUrl}/rest/v1/rpc/recalculate_match_points`, {
      method: "POST",
      headers,
      body: JSON.stringify({ p_match_id: matchId, p_home_score: homeScore, p_away_score: awayScore }),
    });

    setRecalculatingId(null);
    loadMatches();
  };

  if (!isAdmin) return null;

  return (
    <div className="animate-fade-in">
      <div className="bg-[#001e28] rounded-xl overflow-hidden shadow-lg mb-6">
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <span className="text-xl">⚙️</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Panel Admina</h1>
            <p className="text-emerald-400 text-[11px] font-medium">Zarządzanie meczami</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition-all duration-200 text-sm"
        >
          {showAddForm ? "Anuluj" : "+ Dodaj mecz"}
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAddMatch}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm my-3 grid gap-2.5 max-w-md animate-slide-up"
        >
          <input
            type="text"
            placeholder="Drużyna gospodarzy"
            value={homeTeam}
            onChange={(e) => setHomeTeam(e.target.value)}
            required
            className="bg-slate-50 text-slate-800 rounded-lg px-3 py-2 border border-slate-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:outline-none transition text-sm"
          />
          <input
            type="text"
            placeholder="Drużyna gości"
            value={awayTeam}
            onChange={(e) => setAwayTeam(e.target.value)}
            required
            className="bg-slate-50 text-slate-800 rounded-lg px-3 py-2 border border-slate-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:outline-none transition text-sm"
          />
          <input
            type="datetime-local"
            value={matchDate}
            onChange={(e) => setMatchDate(e.target.value)}
            required
            className="bg-slate-50 text-slate-800 rounded-lg px-3 py-2 border border-slate-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:outline-none transition text-sm"
          />
          <select
            value={matchStage}
            onChange={(e) => setMatchStage(parseInt(e.target.value))}
            className="bg-slate-50 text-slate-800 rounded-lg px-3 py-2 border border-slate-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:outline-none transition text-sm"
          >
            <option value={1}>Stage 1 — grupowy (×1)</option>
            <option value={2}>Stage 2 — pucharowy (×2)</option>
          </select>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition-all duration-200 text-sm"
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
            onRecalculate={handleRecalculate}
            finishing={finishingId === match.id}
            recalculating={recalculatingId === match.id}
          />
        ))}
      </div>
    </div>
  );
}

function MatchAdminCard({
  match,
  onFinish,
  onRecalculate,
  finishing,
  recalculating,
}: {
  match: Match;
  onFinish: (id: string, home: number, away: number) => void;
  onRecalculate: (id: string, home: number, away: number) => void;
  finishing: boolean;
  recalculating: boolean;
}) {
  const [homeScore, setHomeScore] = useState(
    match.home_score?.toString() ?? ""
  );
  const [awayScore, setAwayScore] = useState(
    match.away_score?.toString() ?? ""
  );

  const scoreChanged =
    parseInt(homeScore) !== (match.home_score ?? 0) ||
    parseInt(awayScore) !== (match.away_score ?? 0);

  const handleSave = () => {
    if (match.finished) {
      onRecalculate(match.id, parseInt(homeScore) || 0, parseInt(awayScore) || 0);
    } else {
      onFinish(match.id, parseInt(homeScore) || 0, parseInt(awayScore) || 0);
    }
  };

  return (
    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
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
            className="w-12 bg-slate-50 text-slate-800 text-center rounded-lg px-1 py-1 border border-slate-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none transition text-sm"
          />
          <span className="text-slate-400 font-semibold">:</span>
          <input
            type="number"
            min="0"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            className="w-12 bg-slate-50 text-slate-800 text-center rounded-lg px-1 py-1 border border-slate-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none transition text-sm"
          />
        </div>
        <div className="flex-1 text-right">
          <p className="text-slate-800 text-sm font-semibold">{match.away_team}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
        <span className="flex items-center gap-2">
          {new Date(match.match_date).toLocaleDateString("pl-PL")}
          {match.bracket_order && (
            <span className="bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded text-[9px]">
              M{match.bracket_order}
            </span>
          )}
        </span>
        {match.finished ? (
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-semibold text-xs bg-emerald-50 px-2 py-0.5 rounded-full">✓ Zakończony</span>
            <button
              onClick={handleSave}
              disabled={!homeScore || !awayScore || !scoreChanged || recalculating}
              className="bg-amber-500 hover:bg-amber-600 active:scale-95 disabled:bg-slate-200 text-white disabled:text-slate-400 px-3 py-1 rounded-lg font-semibold transition-all duration-200 text-xs shadow-sm"
            >
              {recalculating ? "..." : "Zapisz wynik"}
            </button>
          </div>
        ) : (
          <button
            onClick={handleSave}
            disabled={!homeScore || !awayScore || finishing}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:bg-slate-200 text-white disabled:text-slate-400 px-3 py-1 rounded-lg font-semibold transition-all duration-200 text-xs shadow-sm"
          >
            {finishing ? "..." : "Zakończ mecz"}
          </button>
        )}
      </div>
    </div>
  );
}
