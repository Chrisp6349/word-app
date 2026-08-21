export interface WordEntry {
  id: number;
  word: string;
}

export interface DailyPuzzle {
  dateKey: string;
  entry: WordEntry;
  letters: string[];
}

export interface DailyResult {
  dateKey: string;
  puzzleId: number;
  solved: boolean;
  timeSeconds: number;
  hintsUsed: number;
}

export interface StreakData {
  current: number;
  longest: number;
  lastSolvedDateKey: string | null;
}
