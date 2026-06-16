import type { LeaderboardEntry } from "@/types/user";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  onSelect?: (userId: string) => void;
}

const medals = ["🥇", "🥈", "🥉"];
const rankStyles: Record<number, { row: string; num: string; name: string; pts: string; ptsLabel: string }> = {
  1: {
    row: "bg-gradient-to-r from-amber-100/90 to-amber-50/60 border-b border-amber-200 hover:bg-amber-200/70",
    num: "text-lg",
    name: "text-amber-900",
    pts: "text-amber-600",
    ptsLabel: "text-amber-400",
  },
  2: {
    row: "bg-gradient-to-r from-slate-100/90 to-slate-50/60 border-b border-slate-200 hover:bg-slate-200/70",
    num: "text-lg",
    name: "text-slate-800",
    pts: "text-slate-600",
    ptsLabel: "text-slate-400",
  },
  3: {
    row: "bg-gradient-to-r from-orange-100/80 to-orange-50/50 border-b border-orange-200 hover:bg-orange-200/60",
    num: "text-lg",
    name: "text-orange-900",
    pts: "text-orange-600",
    ptsLabel: "text-orange-400",
  },
};

export default function LeaderboardTable({ entries, onSelect }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        Brak danych w rankingu.
      </div>
    );
  }

  let currentRank = 0;
  let previousPoints: number | null = null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase tracking-wider">
            <th className="pb-3 pt-4 pl-4 sm:pl-5 w-10">#</th>
            <th className="pb-3 pt-4 pr-4">Użytkownik</th>
            <th className="pb-3 pt-4 pr-4 sm:pr-5 text-right">Punkty</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => {
            if (entry.total_points !== previousPoints) {
              currentRank = index + 1;
            }
            previousPoints = entry.total_points;

            const podium = rankStyles[currentRank];
            const isPodium = currentRank <= 3;

            const rowClass = isPodium
              ? podium.row
              : "border-b border-slate-100 hover:bg-emerald-50/50";

            return (
              <tr key={entry.user_id} onClick={() => onSelect?.(entry.user_id)} className={`cursor-pointer transition-all duration-150 ${rowClass}`}>
                <td className="pl-4 sm:pl-5 pr-3 py-2.5 text-center align-middle">
                  {isPodium ? (
                    <span className={podium.num}>{medals[currentRank - 1]}</span>
                  ) : (
                    <span className="text-slate-400 font-semibold text-sm">{currentRank}</span>
                  )}
                </td>
                <td className="pr-4 py-2.5 align-middle">
                  <span className={`font-semibold text-sm ${isPodium ? podium.name : "text-slate-800"}`}>
                    {entry.nickname}
                  </span>
                </td>
                <td className="pr-4 sm:pr-5 py-2.5 text-right align-middle">
                  <span className={`font-extrabold text-xl tabular-nums ${isPodium ? podium.pts : "text-amber-600"}`}>
                    {entry.total_points}
                  </span>
                  <span className={`text-[10px] font-medium ml-0.5 ${isPodium ? podium.ptsLabel : "text-amber-400"}`}>pkt</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
