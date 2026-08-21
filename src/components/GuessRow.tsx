import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { GuessSlot } from '../utils/puzzleLogic';

interface Props {
  slots: GuessSlot[];
  onRemoveLast: () => void;
}

export function GuessRow({ slots, onRemoveLast }: Props) {
  return (
    <Pressable onPress={onRemoveLast} accessibilityRole="button" accessibilityLabel="Remove last letter">
      <View style={styles.row}>
        {slots.map((slot, index) => (
          <View
            key={index}
            style={[
              styles.slot,
              slot.letter && styles.slotFilled,
              slot.hinted && styles.slotHinted,
            ]}
          >
            <Text style={styles.slotText}>{slot.letter ?? ''}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  slot: {
    width: 34,
    height: 42,
    borderBottomWidth: 3,
    borderBottomColor: colors.slotBorder,
    marginHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotFilled: {
    borderBottomColor: colors.blue,
  },
  slotHinted: {
    borderBottomColor: colors.hint,
  },
  slotText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
});
