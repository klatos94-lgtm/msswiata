import type { LeaderboardEntry } from "@/types/user";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

const medals = ["🥇", "🥈", "🥉"];

export default function LeaderboardTable({ entries }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        Brak danych w rankingu.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
            <th className="pb-3 pr-4">#</th>
            <th className="pb-3 pr-4">Użytkownik</th>
            <th className="pb-3 text-right">Punkty</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={entry.user_id} className="border-b border-slate-100 hover:bg-emerald-50/50 transition">
              <td className="py-3.5 pr-4">
                {index < 3 ? (
                  <span className="text-xl">{medals[index]}</span>
                ) : (
                  <span className="text-slate-400 font-medium">{index + 1}</span>
                )}
              </td>
              <td className="py-3.5 pr-4">
                <span className="text-slate-800 font-medium">
                  {entry.nickname || entry.email}
                </span>
              </td>
              <td className="py-3.5 text-right">
                <span className="text-amber-600 font-bold text-xl">
                  {entry.total_points}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
