"use client";

import type { Match } from "@/types/match";
import PredictionForm from "./PredictionForm";

interface MatchCardProps {
  match: Match;
  userPrediction?: { predicted_home: number; predicted_away: number } | null;
  userId?: string;
}

const flags: Record<string, string> = {
  "Polska": "🇵🇱", "Argentyna": "🇦🇷", "Niemcy": "🇩🇪", "Brazylia": "🇧🇷",
  "Francja": "🇫🇷", "Anglia": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Hiszpania": "🇪🇸", "Włochy": "🇮🇹",
  "Holandia": "🇳🇱", "Portugalia": "🇵🇹",
  "Meksyk": "🇲🇽", "Republika Południowej Afryki": "🇿🇦",
  "Korea Południowa": "🇰🇷", "Czechy": "🇨🇿",
  "Kanada": "🇨🇦", "Bośnia i Hercegowina": "🇧🇦",
  "USA": "🇺🇸", "Paragwaj": "🇵🇾",
  "Haiti": "🇭🇹", "Szkocja": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Australia": "🇦🇺", "Turcja": "🇹🇷",
  "Maroko": "🇲🇦", "Katar": "🇶🇦", "Szwajcaria": "🇨🇭",
  "Wybrzeże Kości Słoniowej": "🇨🇮", "Ekwador": "🇪🇨",
  "Curaçao": "🇨🇼", "Japonia": "🇯🇵",
  "Szwecja": "🇸🇪", "Tunezja": "🇹🇳",
};

function getFlag(team: string): string {
  return flags[team] || "";
}

export default function MatchCard({ match, userPrediction, userId }: MatchCardProps) {
  const matchDate = new Date(match.match_date);
  const isPast = matchDate < new Date();
  const isFinished = match.finished;

  const statusBadge = isFinished
    ? "bg-slate-100 text-slate-500"
    : isPast
    ? "bg-amber-100 text-amber-700"
    : "bg-emerald-100 text-emerald-700";

  const statusText = isFinished ? "Zakończony" : isPast ? "W trakcie" : "Nadchodzący";

  return (
    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge}`}>
          {statusText}
        </span>
        <span className="text-xs text-slate-400">
          {matchDate.toLocaleDateString("pl-PL", {
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 text-center">
          <p className="text-lg mb-0.5">{getFlag(match.home_team)}</p>
          <p className="text-sm text-slate-800 font-semibold">{match.home_team}</p>
        </div>

        <div className="flex items-center gap-2 mx-3">
          {isFinished && match.home_score !== null ? (
            <span className="text-2xl font-bold text-slate-800">
              {match.home_score} : {match.away_score}
            </span>
          ) : userPrediction ? (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Twój typ: {userPrediction.predicted_home}:{userPrediction.predicted_away}
            </span>
          ) : (
            <span className="text-xs text-slate-400 font-medium">vs</span>
          )}
        </div>

        <div className="flex-1 text-center">
          <p className="text-lg mb-0.5">{getFlag(match.away_team)}</p>
          <p className="text-sm text-slate-800 font-semibold">{match.away_team}</p>
        </div>
      </div>

      {!isFinished && !isPast && userId && (
        <PredictionForm matchId={match.id} userId={userId} existingPrediction={userPrediction} />
      )}

      {userPrediction && isFinished && (
        <div className="text-center text-xs">
          <span className="text-slate-500">Zdobyte punkty: </span>
          <span className="text-amber-600 font-bold">
            {userPrediction && "points" in userPrediction
              ? (userPrediction as unknown as { points: number }).points ?? "-"
              : "-"}
          </span>
        </div>
      )}
    </div>
  );
}
