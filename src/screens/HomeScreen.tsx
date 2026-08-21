import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import { ViewShotRef } from 'react-native-view-shot';

import { colors } from '../theme/colors';
import { getTodaysPuzzle } from '../utils/daily';
import { formatTime } from '../utils/formatTime';
import { getResult, getStreak, recordSolveStreak, saveResult } from '../utils/storage';
import {
  applyHint,
  countHintedSlots,
  createEmptySlots,
  createTiles,
  guessWord,
  isRowFull,
  placeTile,
  removeLastTile,
  Tile,
  GuessSlot,
} from '../utils/puzzleLogic';
import { DailyResult, StreakData } from '../types';
import { LetterTile } from '../components/LetterTile';
import { GuessRow } from '../components/GuessRow';
import { ShareCard } from '../components/ShareCard';

const HINT_PENALTY_SECONDS = 15;

type Phase = 'loading' | 'playing' | 'solved';

export function HomeScreen() {
  const [puzzle] = useState(() => getTodaysPuzzle());
  const [tiles, setTiles] = useState<Tile[]>(() => createTiles(puzzle.letters));
  const [slots, setSlots] = useState<GuessSlot[]>(() =>
    createEmptySlots(puzzle.entry.answer.length)
  );
  const [phase, setPhase] = useState<Phase>('loading');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [streak, setStreak] = useState<StreakData>({
    current: 0,
    longest: 0,
    lastSolvedDateKey: null,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [alreadySolvedToday, setAlreadySolvedToday] = useState(false);
  const [savedResult, setSavedResult] = useState<DailyResult | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const penaltySecondsRef = useRef(0);
  const shareCardRef = useRef<ViewShotRef>(null);

  useEffect(() => {
    (async () => {
      const [result, streakData] = await Promise.all([
        getResult(puzzle.dateKey),
        getStreak(),
      ]);
      setStreak(streakData);
      if (result?.solved) {
        setSavedResult(result);
        setHintsUsed(result.hintsUsed);
        setElapsedSeconds(result.timeSeconds);
        setAlreadySolvedToday(true);
        setPhase('solved');
      } else {
        startTimeRef.current = Date.now();
        setPhase('playing');
      }
    })();
  }, [puzzle.dateKey]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const interval = setInterval(() => {
      if (startTimeRef.current === null) return;
      const secondsElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedSeconds(secondsElapsed + penaltySecondsRef.current);
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  function handleTilePress(tileIndex: number) {
    if (phase !== 'playing') return;
    const result = placeTile(tiles, slots, tileIndex);
    if (!result) return;
    setTiles(result.tiles);
    setSlots(result.slots);
    setErrorMessage(null);
  }

  function handleRemoveLast() {
    if (phase !== 'playing') return;
    const result = removeLastTile(tiles, slots);
    if (!result) return;
    setTiles(result.tiles);
    setSlots(result.slots);
    setErrorMessage(null);
  }

  function handleHint() {
    if (phase !== 'playing') return;
    const result = applyHint(tiles, slots, puzzle.entry.answer);
    if (!result) return;
    setTiles(result.tiles);
    setSlots(result.slots);
    setHintsUsed((h) => h + 1);
    penaltySecondsRef.current += HINT_PENALTY_SECONDS;
    if (startTimeRef.current !== null) {
      const secondsElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedSeconds(secondsElapsed + penaltySecondsRef.current);
    }
  }

  async function handleSubmit() {
    if (phase !== 'playing' || !isRowFull(slots)) return;
    const word = guessWord(slots);
    if (word !== puzzle.entry.answer) {
      setErrorMessage("Not quite right — keep trying!");
      return;
    }

    const finalTime = elapsedSeconds;
    setPhase('solved');
    const result: DailyResult = {
      dateKey: puzzle.dateKey,
      puzzleId: puzzle.entry.id,
      solved: true,
      timeSeconds: finalTime,
      hintsUsed,
    };
    await saveResult(result);
    const updatedStreak = await recordSolveStreak(puzzle.dateKey);
    setStreak(updatedStreak);
    setSavedResult(result);
  }

  async function handleShare() {
    try {
      const uri = await shareCardRef.current?.capture?.();
      if (!uri) return;
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png' });
      } else {
        Alert.alert('Sharing unavailable', 'Sharing is not supported on this device.');
      }
    } catch {
      Alert.alert('Could not share', 'Something went wrong generating the share image.');
    }
  }

  if (phase === 'loading') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.blue} />
        </View>
      </SafeAreaView>
    );
  }

  const hintedPositionsForShare = Array.from(
    { length: puzzle.entry.answer.length },
    (_, i) => i < hintsUsed
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>DAILY CONUNDRUM</Text>
          <View style={styles.streakBadge}>
            <Text style={styles.streakBadgeText}>🔥 {streak.current}</Text>
          </View>
        </View>

        {phase === 'playing' && (
          <>
            <Text style={styles.timer}>{formatTime(elapsedSeconds)}</Text>

            <View style={styles.clueRow}>
              <Text style={styles.clueText}>Clue: {puzzle.entry.definition}</Text>
              <Text style={styles.difficultyText}>{puzzle.entry.difficulty}</Text>
            </View>

            <GuessRow slots={slots} onRemoveLast={handleRemoveLast} />

            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

            <View style={styles.tileGrid}>
              {tiles.map((tile, index) => (
                <LetterTile
                  key={index}
                  letter={tile.letter}
                  disabled={tile.used}
                  onPress={() => handleTilePress(index)}
                />
              ))}
            </View>

            <View style={styles.actionsRow}>
              <Pressable style={styles.hintButton} onPress={handleHint}>
                <Text style={styles.hintButtonText}>Hint (+{HINT_PENALTY_SECONDS}s)</Text>
              </Pressable>
              <Pressable
                style={[styles.submitButton, !isRowFull(slots) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!isRowFull(slots)}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </Pressable>
            </View>

            <Text style={styles.hintsUsedLabel}>Hints used: {hintsUsed}</Text>
          </>
        )}

        {phase === 'solved' && savedResult && (
          <View style={styles.solvedContainer}>
            <Text style={styles.solvedHeading}>
              {alreadySolvedToday ? "You've already solved today's puzzle!" : 'Solved! 🎉'}
            </Text>

            <ShareCard
              ref={shareCardRef}
              puzzleId={savedResult.puzzleId}
              dateKey={savedResult.dateKey}
              timeSeconds={savedResult.timeSeconds}
              hintedPositions={hintedPositionsForShare}
              streak={streak.current}
            />

            <Pressable style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareButtonText}>Share result</Text>
            </Pressable>

            <Text style={styles.comeBackLabel}>Come back tomorrow for a new conundrum!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.blue,
    letterSpacing: 1,
  },
  streakBadge: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.red,
  },
  streakBadgeText: {
    fontWeight: '700',
    color: colors.text,
  },
  timer: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    fontVariant: ['tabular-nums'],
  },
  clueRow: {
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  clueText: {
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  difficultyText: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  error: {
    color: colors.error,
    marginTop: 10,
    fontWeight: '600',
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 220,
    marginTop: 24,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  hintButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.red,
    backgroundColor: colors.white,
  },
  hintButtonText: {
    color: colors.red,
    fontWeight: '700',
  },
  submitButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: colors.blue,
  },
  submitButtonDisabled: {
    backgroundColor: colors.tileUsed,
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
  hintsUsedLabel: {
    marginTop: 14,
    color: colors.textMuted,
  },
  solvedContainer: {
    alignItems: 'center',
    width: '100%',
  },
  solvedHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  shareButton: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: colors.red,
  },
  shareButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  comeBackLabel: {
    marginTop: 18,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
