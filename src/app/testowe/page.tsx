"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Match } from "@/types/match";
import type { Prediction } from "@/types/prediction";
import PredictionForm from "@/components/PredictionForm";

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

export default function TestowePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUser(data.user);
      loadData(data.user.id);
    });
  }, []);

  const loadData = async (userId: string) => {
    const supabase = getSupabaseClient();

    const { data: matchesData } = await supabase
      .from("matches")
      .select("*")
      .eq("round", 0)
      .order("match_date", { ascending: true });
    if (matchesData) setMatches(matchesData);

    const { data: predictionsData } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", userId);
    if (predictionsData) setPredictions(predictionsData);
  };

  if (!user) return null;

  return (
    <div className="animate-fade-in">
      <div className="bg-[#001e28] rounded-xl overflow-hidden shadow-lg mb-6">
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <span className="text-xl">🧪</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Mecze Testowe</h1>
            <p className="text-emerald-400 text-[11px] font-medium">31.05.2026 &middot; 3 mecze</p>
          </div>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center shadow-sm">
          <p className="text-slate-500 text-sm">
            Brak meczów testowych w bazie.{' '}
            <span className="text-emerald-600 font-medium">Kliknij "🧪 Dodaj testowe" w panelu admina.</span>
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {matches.map((match) => {
            const matchDate = new Date(match.match_date);
            const now = new Date();
            const isPast = matchDate < now;
            const isFinished = match.finished;
            const pred = predictions.find((p) => p.match_id === match.id) || null;

            const day = `${String(matchDate.getDate()).padStart(2, "0")}.${String(matchDate.getMonth() + 1).padStart(2, "0")}.`;
            const time = matchDate.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Warsaw" });

            return (
              <div key={match.id} className={`flex items-start px-3 py-2.5 gap-2 transition-colors ${
                pred ? "bg-emerald-50/40" : ""
              } ${
                isFinished ? "border-2 border-black rounded-lg" : isPast ? "border-2 border-red-400 rounded-lg" : "border-b border-slate-100"
              } ${isPast ? "mb-1" : ""} hover:bg-slate-50/60`}>
                <div className="w-14 flex-shrink-0 text-center pt-0.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase leading-tight">{day}</div>
                  <div className="text-[11px] font-bold text-slate-700 tabular-nums">{time}</div>
                </div>

                <div className="flex-1 flex items-center justify-end gap-1.5 min-w-0 pt-0.5">
                  <span className="text-[13px] font-semibold text-slate-700 truncate text-right max-w-[110px]">
                    {match.home_team}
                  </span>
                  <span className="text-sm flex-shrink-0">{getFlag(match.home_team)}</span>
                </div>

                <div className="flex-shrink-0 min-w-[76px] flex flex-col items-center gap-0.5">
                  {isFinished && match.home_score !== null ? (
                    <span className="text-sm font-extrabold text-slate-800 tabular-nums bg-slate-100 px-2 py-0.5 rounded-md">
                      {match.home_score}:{match.away_score}
                    </span>
                  ) : isPast ? (
                    <span className="text-[10px] font-bold text-red-500">🔒</span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-600">VS</span>
                  )}

                  {pred && (
                    <span className="text-[10px] font-semibold text-slate-600">
                      Twój typ: {pred.predicted_home}:{pred.predicted_away}
                    </span>
                  )}

                  {isFinished && isPast && pred && "points" in pred && (
                    <span className="text-[10px] font-bold text-emerald-600">
                      +{(pred as unknown as { points: number }).points ?? "—"}pkt
                    </span>
                  )}

                  {!isFinished && !isPast && (
                    <div className="mt-0.5">
                      <PredictionForm
                        matchId={match.id}
                        userId={user.id}
                        matchDate={match.match_date}
                        existingPrediction={pred}
                        onSave={() => loadData(user.id)}
                      />
                    </div>
                  )}
                </div>

                <div className="flex-1 flex items-center gap-1.5 min-w-0 pt-0.5">
                  <span className="text-sm flex-shrink-0">{getFlag(match.away_team)}</span>
                  <span className="text-[13px] font-semibold text-slate-700 truncate max-w-[110px]">
                    {match.away_team}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
