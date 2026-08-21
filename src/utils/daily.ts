import { wordBank } from '../data/wordBank';
import { DailyPuzzle, WordEntry } from '../types';

// Fixed epoch the fallback rotation counts from, so the same calendar date
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

// Entries with no fixed `date` form the rotation buffer, picked in id order.
// Entries with a `date` are reserved for that exact day and excluded from
// the rotation so they don't get skipped over or double-used.
function rotationPool(): WordEntry[] {
  return wordBank.filter((entry) => !entry.date);
}

function dayIndexForDate(date: Date, poolLength: number): number {
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = Math.round((startOfDay.getTime() - EPOCH.getTime()) / msPerDay);
  return ((diff % poolLength) + poolLength) % poolLength;
}

export function getEntryForDate(date: Date = new Date()): WordEntry {
  const dateKey = getDateKey(date);
  const scheduled = wordBank.find((entry) => entry.date === dateKey);
  if (scheduled) return scheduled;

  const pool = rotationPool();
  return pool[dayIndexForDate(date, pool.length)];
}

export function getTodaysPuzzle(date: Date = new Date()): DailyPuzzle {
  const dateKey = getDateKey(date);
  const entry = getEntryForDate(date);
  return { dateKey, entry, letters: entry.letters.split('') };
}
