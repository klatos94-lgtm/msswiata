"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { Match } from "@/types/match";
import type { Prediction } from "@/types/prediction";

const flags: Record<string, string> = {
  "Polska": "🇵🇱", "Argentyna": "🇦🇷", "Niemcy": "🇩🇪", "Brazylia": "🇧🇷",
  "Francja": "🇫🇷", "Anglia": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Hiszpania": "🇪🇸", "Holandia": "🇳🇱",
  "Portugalia": "🇵🇹", "Belgia": "🇧🇪", "Chorwacja": "🇭🇷",
  "Meksyk": "🇲🇽", "Republika Południowej Afryki": "🇿🇦",
  "Korea Południowa": "🇰🇷", "Czechy": "🇨🇿",
  "Kanada": "🇨🇦", "Bośnia i Hercegowina": "🇧🇦",
  "USA": "🇺🇸", "Paragwaj": "🇵🇾",
  "Haiti": "🇭🇹", "Szkocja": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Australia": "🇦🇺", "Turcja": "🇹🇷",
  "Maroko": "🇲🇦", "Katar": "🇶🇦", "Szwajcaria": "🇨🇭",
  "Wybrzeże Kości Słoniowej": "🇨🇮", "Ekwador": "🇪🇨",
  "Curaçao": "🇨🇼", "Curacao": "🇨🇼", "Japonia": "🇯🇵",
  "Szwecja": "🇸🇪", "Tunezja": "🇹🇳",
  "Egipt": "🇪🇬", "Iran": "🇮🇷", "Nowa Zelandia": "🇳🇿",
  "Arabia Saudyjska": "🇸🇦", "Urugwaj": "🇺🇾",
  "Senegal": "🇸🇳", "Irak": "🇮🇶", "Norwegia": "🇳🇴",
  "Algieria": "🇩🇿", "Austria": "🇦🇹", "Jordania": "🇯🇴",
  "DR Konga": "🇨🇩", "Ghana": "🇬🇭", "Panama": "🇵🇦",
  "Uzbekistan": "🇺🇿", "Kolumbia": "🇨🇴",
  "Republika Zielonego Przylądka": "🇨🇻",
};

function getFlag(team: string): string {
  return flags[team] || "🏳️";
}

interface UserRow {
  id: string;
  nickname: string;
  email: string;
}

export default function TabelaPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = getSupabaseClient();

    const { data: usersData } = await supabase
      .from("users")
      .select("id, nickname, email");
    if (usersData) setUsers(usersData);

    const { data: matchesData } = await supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: true });
    if (matchesData) setMatches(matchesData);

    const { data: predictionsData } = await supabase
      .from("predictions")
      .select("*");
    if (predictionsData) setPredictions(predictionsData);

    setLoading(false);
  };

  const predictionMap = new Map<string, Prediction>();
  for (const p of predictions) {
    predictionMap.set(`${p.user_id}_${p.match_id}`, p);
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-[#001e28] rounded-xl overflow-hidden shadow-lg mb-6">
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <span className="text-xl">📊</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Tabela Kartezjańska</h1>
            <p className="text-emerald-400 text-[11px] font-medium">Wszystkie typy &middot; {users.length} graczy &middot; {matches.length} meczów</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-400 bg-white rounded-xl border border-slate-200 shadow-sm">
          Ładowanie...
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="sticky left-0 bg-white z-10 px-2 py-1.5 text-slate-500 font-semibold uppercase tracking-wider min-w-[120px] border-r border-slate-100">
                    Gracz
                  </th>
                  {matches.map((match) => {
                    const d = new Date(match.match_date);
                    const day = `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.`;
                    return (
                      <th key={match.id} className="px-1.5 py-1 text-center text-slate-500 font-medium min-w-[64px] max-w-[80px] border-r border-slate-100 last:border-r-0">
                        <div className="text-[9px] text-slate-400">{day}</div>
                        <div className="text-[10px] leading-tight truncate">
                          {getFlag(match.home_team)} {match.home_team.split(" ").pop()}
                        </div>
                        <div className="text-[9px] text-slate-400">-</div>
                        <div className="text-[10px] leading-tight truncate">
                          {getFlag(match.away_team)} {match.away_team.split(" ").pop()}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-emerald-50/30 transition-colors">
                    <td className="sticky left-0 bg-white z-10 px-2 py-1.5 font-medium text-slate-700 truncate max-w-[120px] border-r border-slate-100">
                      {user.nickname || user.email?.split("@")[0]}
                    </td>
                    {matches.map((match) => {
                      const key = `${user.id}_${match.id}`;
                      const pred = predictionMap.get(key);
                      const matchDate = new Date(match.match_date);
                      const isPast = matchDate < new Date();
                      const isFinished = match.finished;
                      return (
                        <td key={match.id} className="px-1.5 py-1 text-center border-r border-slate-100 last:border-r-0">
                          {pred ? (
                            <span className={`text-[11px] font-semibold tabular-nums ${
                              isFinished && pred.points && pred.points > 0
                                ? "text-emerald-600"
                                : isPast
                                ? "text-red-400"
                                : "text-amber-600"
                            }`}>
                              {pred.predicted_home}:{pred.predicted_away}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
