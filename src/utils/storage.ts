import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyResult, StreakData } from '../types';
import { getPreviousDateKey } from './daily';

const RESULT_KEY_PREFIX = 'daily-conundrum:result:';
const STREAK_KEY = 'daily-conundrum:streak';

export async function getResult(dateKey: string): Promise<DailyResult | null> {
  const raw = await AsyncStorage.getItem(RESULT_KEY_PREFIX + dateKey);
  return raw ? JSON.parse(raw) : null;
}

export async function saveResult(result: DailyResult): Promise<void> {
  await AsyncStorage.setItem(
    RESULT_KEY_PREFIX + result.dateKey,
    JSON.stringify(result)
  );
}

export async function getStreak(): Promise<StreakData> {
  const raw = await AsyncStorage.getItem(STREAK_KEY);
  return raw ? JSON.parse(raw) : { current: 0, longest: 0, lastSolvedDateKey: null };
}

async function saveStreak(streak: StreakData): Promise<void> {
  await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(streak));
}

// Records a solve for `dateKey` and returns the updated streak, extending it
// if the previous solve was yesterday, or restarting it otherwise.
export async function recordSolveStreak(dateKey: string): Promise<StreakData> {
  const streak = await getStreak();
  const yesterday = getPreviousDateKey(dateKey);

  let current: number;
  if (streak.lastSolvedDateKey === dateKey) {
    current = streak.current;
  } else if (streak.lastSolvedDateKey === yesterday) {
    current = streak.current + 1;
  } else {
    current = 1;
  }

  const updated: StreakData = {
    current,
    longest: Math.max(streak.longest, current),
    lastSolvedDateKey: dateKey,
  };
  await saveStreak(updated);
  return updated;
}
