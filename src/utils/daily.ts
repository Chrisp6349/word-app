import { wordBank } from '../data/wordBank';
import { DailyPuzzle, WordEntry } from '../types';

// Fixed epoch the daily rotation counts from, so the same calendar date
// always maps to the same puzzle regardless of when the app was installed.
const EPOCH = new Date(2024, 0, 1);

export function getDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPreviousDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  return getDateKey(date);
}

function dayIndexForDate(date: Date): number {
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = Math.round((startOfDay.getTime() - EPOCH.getTime()) / msPerDay);
  return ((diff % wordBank.length) + wordBank.length) % wordBank.length;
}

// Small deterministic string hash -> seeded PRNG, so a given puzzle's
// letters are shuffled the same way every time it's loaded on its day.
function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  let state = h >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  const result = [...items];
  const random = seededRandom(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function getEntryForDate(date: Date = new Date()): WordEntry {
  return wordBank[dayIndexForDate(date)];
}

export function getTodaysPuzzle(date: Date = new Date()): DailyPuzzle {
  const dateKey = getDateKey(date);
  const entry = getEntryForDate(date);
  const letters = seededShuffle(entry.word.split(''), `${dateKey}-${entry.id}`);
  return { dateKey, entry, letters };
}
