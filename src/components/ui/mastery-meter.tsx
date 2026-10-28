import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Colors, Fonts, Radius } from '@/constants/theme';
import { MasteryLabel, type MasteryLevel } from '@/state/review';

export const MasteryColor: Record<MasteryLevel, string> = {
  new: Colors.textMuted,
  learning: Colors.streak,
  firm: '#4DA8FF',
  mastered: Colors.correct,
};

const FILLED: Record<MasteryLevel, number> = { new: 0, learning: 1, firm: 2, mastered: 3 };

/** Tres segmentos que se llenan del color del nivel: aprendiendo, afianzando, dominado. */
export function MasteryMeter({ level }: { level: MasteryLevel }) {
  return (
    <View style={styles.meter}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={[styles.segment, { backgroundColor: i < FILLED[level] ? MasteryColor[level] : Colors.border }]}
        />
      ))}
    </View>
  );
}

export function MasteryPill({ level }: { level: MasteryLevel }) {
  return (
    <View style={[styles.pill, { borderColor: MasteryColor[level] }]}>
      <AppText style={styles.pillText} color={MasteryColor[level]}>
        {MasteryLabel[level]}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  meter: {
    flexDirection: 'row',
    gap: 3,
  },
  segment: {
    width: 14,
    height: 6,
    borderRadius: 3,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
  },
  pillText: {
    fontFamily: Fonts.extraBold,
    fontSize: 12,
  },
});
