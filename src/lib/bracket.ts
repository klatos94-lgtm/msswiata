export interface BracketSlot {
  targetBracketOrder: number;
  slot: "home" | "away";
  teamType: "winner" | "loser";
}

export const bracketAdvanceMap: Record<number, BracketSlot[]> = {
  1:  [{ targetBracketOrder: 17, slot: "home", teamType: "winner" }],
  4:  [{ targetBracketOrder: 17, slot: "away", teamType: "winner" }],
  3:  [{ targetBracketOrder: 18, slot: "home", teamType: "winner" }],
  6:  [{ targetBracketOrder: 18, slot: "away", teamType: "winner" }],
  2:  [{ targetBracketOrder: 19, slot: "home", teamType: "winner" }],
  5:  [{ targetBracketOrder: 19, slot: "away", teamType: "winner" }],
  7:  [{ targetBracketOrder: 20, slot: "home", teamType: "winner" }],
  8:  [{ targetBracketOrder: 20, slot: "away", teamType: "winner" }],
  12: [{ targetBracketOrder: 21, slot: "home", teamType: "winner" }],
  11: [{ targetBracketOrder: 21, slot: "away", teamType: "winner" }],
  10: [{ targetBracketOrder: 22, slot: "home", teamType: "winner" }],
  9:  [{ targetBracketOrder: 22, slot: "away", teamType: "winner" }],
  15: [{ targetBracketOrder: 23, slot: "home", teamType: "winner" }],
  14: [{ targetBracketOrder: 23, slot: "away", teamType: "winner" }],
  13: [{ targetBracketOrder: 24, slot: "home", teamType: "winner" }],
  16: [{ targetBracketOrder: 24, slot: "away", teamType: "winner" }],

  17: [{ targetBracketOrder: 25, slot: "home", teamType: "winner" }],
  18: [{ targetBracketOrder: 25, slot: "away", teamType: "winner" }],
  21: [{ targetBracketOrder: 26, slot: "home", teamType: "winner" }],
  22: [{ targetBracketOrder: 26, slot: "away", teamType: "winner" }],
  19: [{ targetBracketOrder: 27, slot: "home", teamType: "winner" }],
  20: [{ targetBracketOrder: 27, slot: "away", teamType: "winner" }],
  23: [{ targetBracketOrder: 28, slot: "home", teamType: "winner" }],
  24: [{ targetBracketOrder: 28, slot: "away", teamType: "winner" }],

  25: [{ targetBracketOrder: 29, slot: "home", teamType: "winner" }],
  26: [{ targetBracketOrder: 29, slot: "away", teamType: "winner" }],
  27: [{ targetBracketOrder: 30, slot: "home", teamType: "winner" }],
  28: [{ targetBracketOrder: 30, slot: "away", teamType: "winner" }],

  29: [
    { targetBracketOrder: 32, slot: "home", teamType: "winner" },
    { targetBracketOrder: 31, slot: "home", teamType: "loser" },
  ],
  30: [
    { targetBracketOrder: 32, slot: "away", teamType: "winner" },
    { targetBracketOrder: 31, slot: "away", teamType: "loser" },
  ],
};

export interface BracketMatch {
  bracketOrder: number;
  round: number;
  roundLabel: string;
  matchDate: string;
}

export const roundLabels: Record<number, { label: string; short: string }> = {
  4: { label: "1/16 finału", short: "1/16" },
  5: { label: "1/8 finału", short: "1/8" },
  6: { label: "Ćwierćfinał", short: "QF" },
  7: { label: "Półfinał", short: "SF" },
  8: { label: "Finał", short: "F" },
};

export function getRoundLabel(round: number): string {
  return roundLabels[round]?.label ?? `Runda ${round}`;
}

export function getBracketRound(order: number): number {
  if (order >= 1 && order <= 16) return 4;
  if (order >= 17 && order <= 24) return 5;
  if (order >= 25 && order <= 28) return 6;
  if (order >= 29 && order <= 30) return 7;
  if (order >= 31 && order <= 32) return 8;
  return 0;
}

export function getRoundMatches(
  bracketOrder: number[],
  round: number
): number[] {
  const ranges: Record<number, [number, number]> = {
    4: [1, 16],
    5: [17, 24],
    6: [25, 28],
    7: [29, 30],
    8: [31, 32],
  };
  const [lo, hi] = ranges[round] || [0, 0];
  return bracketOrder.filter((o) => o >= lo && o <= hi);
}
