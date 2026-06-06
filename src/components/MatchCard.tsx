"use client";

import type { Match } from "@/types/match";
import PredictionForm from "./PredictionForm";
import Flag from "@/components/Flag";

interface MatchCardProps {
  match: Match;
  userPrediction?: { predicted_home: number; predicted_away: number; points?: number | null } | null;
  userId?: string;
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
    <div className="bg-white rounded-lg border-l-4 border-l-emerald-500 border border-slate-200 p-2.5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusBadge}`}>
          {statusText}
        </span>
        <span className="text-[10px] text-slate-400">
          {matchDate.toLocaleDateString("pl-PL", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <div className="flex items-center justify-between mb-1">
        <div className="flex-1 text-center">
          <p className="text-lg leading-none"><Flag team={match.home_team} /></p>
          <p className="text-xs text-slate-800 font-semibold mt-0.5">{match.home_team}</p>
        </div>

        <div className="flex items-center gap-2 mx-2">
          {isFinished && match.home_score !== null ? (
            <span className="text-xl font-bold text-slate-800 tabular-nums">
              {match.home_score} : {match.away_score}
            </span>
          ) : userPrediction ? (
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              {userPrediction.predicted_home}:{userPrediction.predicted_away}
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">VS</span>
          )}
        </div>

        <div className="flex-1 text-center">
          <p className="text-lg leading-none"><Flag team={match.away_team} /></p>
          <p className="text-xs text-slate-800 font-semibold mt-0.5">{match.away_team}</p>
        </div>
      </div>

      {!isFinished && !isPast && userId && (
        <PredictionForm matchId={match.id} userId={userId} matchDate={match.match_date} existingPrediction={userPrediction} />
      )}

      {userPrediction && isFinished && (
        <div className="text-center text-[10px] mt-0.5">
          <span className="text-slate-500">Punkty: </span>
          <span className="text-amber-600 font-bold">
            {userPrediction.points != null ? userPrediction.points : "-"}
          </span>
        </div>
      )}
    </div>
  );
}
