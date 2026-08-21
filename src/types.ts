export type Difficulty = 'easy' | 'moderate' | 'hard';

export interface WordEntry {
  id: number;
  answer: string;
  letters: string;
  definition: string;
  difficulty: Difficulty;
  /** Optional fixed calendar date (YYYY-MM-DD) pinning this puzzle to a specific day. */
  date?: string;
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
