import type { LeaderboardEntry } from "@/types/user";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  onSelect?: (userId: string) => void;
}

const medals = ["🥇", "🥈", "🥉"];

export default function LeaderboardTable({ entries, onSelect }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        Brak danych w rankingu.
      </div>
    );
  }

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
            const isTop3 = index < 3;
            const rowClass = isTop3
              ? "bg-gradient-to-r from-amber-50/80 to-white border-b border-amber-100 hover:bg-amber-100/60"
              : "border-b border-slate-100 hover:bg-emerald-50/50";

            return (
              <tr key={entry.user_id} onClick={() => onSelect?.(entry.user_id)} className={`cursor-pointer transition-all duration-150 ${rowClass}`}>
                <td className="pl-4 sm:pl-5 pr-3 py-2.5 text-center align-middle">
                  {isTop3 ? (
                    <span className="text-lg">{medals[index]}</span>
                  ) : (
                    <span className="text-slate-400 font-semibold text-sm">{index + 1}</span>
                  )}
                </td>
                <td className="pr-4 py-2.5 align-middle">
                  <span className={`font-semibold text-sm ${isTop3 ? "text-amber-900" : "text-slate-800"}`}>
                    {entry.nickname}
                  </span>
                </td>
                <td className="pr-4 sm:pr-5 py-2.5 text-right align-middle">
                  <span className="font-extrabold text-xl tabular-nums text-amber-600">
                    {entry.total_points}
                  </span>
                  <span className="text-[10px] font-medium text-amber-400 ml-0.5">pkt</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
