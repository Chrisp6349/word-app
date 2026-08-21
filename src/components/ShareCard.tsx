import React, { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ViewShot, { ViewShotRef } from 'react-native-view-shot';
import { colors } from '../theme/colors';
import { formatTime } from '../utils/formatTime';

interface Props {
  puzzleId: number;
  dateKey: string;
  timeSeconds: number;
  hintedPositions: boolean[];
  streak: number;
}

export const ShareCard = forwardRef<ViewShotRef, Props>(
  ({ puzzleId, dateKey, timeSeconds, hintedPositions, streak }, ref) => {
    return (
      <ViewShot ref={ref} options={{ format: 'png', quality: 1 }}>
        <View style={styles.card}>
          <View style={styles.stripe} />
          <Text style={styles.title}>DAILY CONUNDRUM</Text>
          <Text style={styles.subtitle}>
            Puzzle #{puzzleId} · {dateKey}
          </Text>

          <View style={styles.squareRow}>
            {hintedPositions.map((hinted, i) => (
              <View key={i} style={[styles.square, hinted ? styles.squareHollow : styles.squareFilled]} />
            ))}
          </View>

          <Text style={styles.time}>Solved in {formatTime(timeSeconds)}</Text>
          <Text style={styles.streak}>Current streak: {streak} 🔥</Text>

          <View style={[styles.stripe, styles.stripeBottom]} />
        </View>
      </ViewShot>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    width: 320,
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    borderRadius: 16,
    overflow: 'hidden',
  },
  stripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: colors.blue,
  },
  stripeBottom: {
    top: undefined,
    bottom: 0,
    backgroundColor: colors.red,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.blue,
    letterSpacing: 1,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 20,
  },
  squareRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  square: {
    width: 24,
    height: 24,
    borderRadius: 5,
    marginHorizontal: 3,
    borderWidth: 2,
    borderColor: colors.red,
  },
  squareFilled: {
    backgroundColor: colors.red,
  },
  squareHollow: {
    backgroundColor: 'transparent',
  },
  time: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  streak: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 6,
  },
});
