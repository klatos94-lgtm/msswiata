import type { LeaderboardEntry } from "@/types/user";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export default function LeaderboardTable({ entries }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        Brak danych w rankingu.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-700 text-gray-400 text-sm uppercase">
            <th className="pb-3 pr-4">#</th>
            <th className="pb-3 pr-4">Użytkownik</th>
            <th className="pb-3 text-right">Punkty</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={entry.user_id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
              <td className="py-3 pr-4 text-gray-400">{index + 1}</td>
              <td className="py-3 pr-4">
                <span className="text-white font-medium">
                  {entry.nickname || entry.email}
                </span>
              </td>
              <td className="py-3 text-right">
                <span className="text-yellow-400 font-bold text-lg">
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
