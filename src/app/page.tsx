import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="text-4xl sm:text-5xl font-bold mb-4">
        World Cup <span className="text-yellow-400">Betting</span>
      </h1>
      <p className="text-gray-400 text-lg mb-8 max-w-md">
        Obstawiaj wyniki meczów Mistrzostw Świata, zbieraj punkty i rywalizuj
        z innymi!
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="bg-green-700 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          Zaloguj się
        </Link>
        <Link
          href="/leaderboard"
          className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium border border-gray-700 transition"
        >
          Ranking
        </Link>
      </div>
    </div>
  );
}
