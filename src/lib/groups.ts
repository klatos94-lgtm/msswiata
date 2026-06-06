export interface GroupInfo {
  label: string;
  teams: string[];
}

export const GROUPS: GroupInfo[] = [
  {
    label: "A",
    teams: ["Meksyk", "Republika Południowej Afryki", "Korea Południowa", "Czechy"],
  },
  {
    label: "B",
    teams: ["Kanada", "Bośnia i Hercegowina", "Szwajcaria", "Katar"],
  },
  {
    label: "C",
    teams: ["USA", "Paragwaj", "Australia", "Turcja"],
  },
  {
    label: "D",
    teams: ["Haiti", "Szkocja", "Brazylia", "Maroko"],
  },
  {
    label: "E",
    teams: ["Niemcy", "Curacao", "Wybrzeże Kości Słoniowej", "Ekwador"],
  },
  {
    label: "F",
    teams: ["Holandia", "Japonia", "Szwecja", "Tunezja"],
  },
  {
    label: "G",
    teams: ["Hiszpania", "Republika Zielonego Przylądka", "Arabia Saudyjska", "Urugwaj"],
  },
  {
    label: "H",
    teams: ["Belgia", "Egipt", "Iran", "Nowa Zelandia"],
  },
  {
    label: "I",
    teams: ["Francja", "Senegal", "Irak", "Norwegia"],
  },
  {
    label: "J",
    teams: ["Argentyna", "Algieria", "Austria", "Jordania"],
  },
  {
    label: "K",
    teams: ["Portugalia", "DR Konga", "Uzbekistan", "Kolumbia"],
  },
  {
    label: "L",
    teams: ["Anglia", "Chorwacja", "Ghana", "Panama"],
  },
];

export function getGroupForTeam(team: string): string | null {
  for (const g of GROUPS) {
    if (g.teams.includes(team)) return g.label;
  }
  return null;
}
