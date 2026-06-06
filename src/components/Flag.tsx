import { getFlagUrl } from "@/lib/flags";

export default function Flag({ team, className = "" }: { team: string; className?: string }) {
  const url = getFlagUrl(team);
  if (!url) return null;
  return (
    <img
      src={url}
      alt=""
      className={`inline-block align-middle w-4 h-4 ${className}`}
      loading="lazy"
    />
  );
}
