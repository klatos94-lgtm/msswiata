"use client";

import type { Match } from "@/types/match";
import PredictionForm from "./PredictionForm";

interface MatchCardProps {
  match: Match;
  userPrediction?: { predicted_home: number; predicted_away: number } | null;
  userId?: string;
}

export default function MatchCard({ match, userPrediction, userId }: MatchCardProps) {
  const matchDate = new Date(match.match_date);
  const isPast = matchDate < new Date();
  const isFinished = match.finished;

  const statusBadge = isFinished
    ? "bg-gray-600 text-white"
    : isPast
    ? "bg-yellow-700 text-yellow-200"
    : "bg-green-700 text-green-200";

  const statusText = isFinished ? "Zakończony" : isPast ? "W trakcie" : "Nadchodzący";

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs px-2 py-1 rounded ${statusBadge}`}>
          {statusText}
        </span>
        <span className="text-xs text-gray-400">
          {matchDate.toLocaleDateString("pl-PL", {
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 text-center">
          <p className="text-white font-semibold">{match.home_team}</p>
        </div>

        <div className="flex items-center gap-3 mx-4">
          {isFinished && match.home_score !== null ? (
            <span className="text-2xl font-bold text-white">
              {match.home_score} : {match.away_score}
            </span>
          ) : userPrediction ? (
            <span className="text-sm text-yellow-400">
              Twój typ: {userPrediction.predicted_home}:{userPrediction.predicted_away}
            </span>
          ) : (
            <span className="text-sm text-gray-500">vs</span>
          )}
        </div>

        <div className="flex-1 text-center">
          <p className="text-white font-semibold">{match.away_team}</p>
        </div>
      </div>

      {!isFinished && !isPast && userId && (
        <PredictionForm matchId={match.id} userId={userId} existingPrediction={userPrediction} />
      )}

      {userPrediction && isFinished && (
        <div className="text-center text-sm">
          <span className="text-gray-400">Zdobyte punkty: </span>
          <span className="text-yellow-400 font-bold">
            {userPrediction && "points" in userPrediction
              ? (userPrediction as unknown as { points: number }).points ?? "-"
              : "-"}
          </span>
        </div>
      )}
    </div>
  );
}
