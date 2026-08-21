import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  letter: string;
  disabled: boolean;
  onPress: () => void;
}

export function LetterTile({ letter, disabled, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.tile,
        disabled && styles.tileDisabled,
        pressed && !disabled && styles.tilePressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Letter ${letter}`}
      accessibilityState={{ disabled }}
    >
      <Text style={[styles.letter, disabled && styles.letterDisabled]}>{letter}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: colors.tileBackground,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 6,
  },
  tilePressed: {
    opacity: 0.75,
  },
  tileDisabled: {
    backgroundColor: colors.tileUsed,
  },
  letter: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.tileText,
  },
  letterDisabled: {
    color: colors.textMuted,
  },
});
