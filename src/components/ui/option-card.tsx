import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Colors, Fonts, Radius } from '@/constants/theme';

export type OptionState = 'idle' | 'selected' | 'correct' | 'wrong' | 'dimmed';

type Props = {
  text: string;
  /** Atajo que se muestra a la izquierda (1, 2, 3…). */
  badge?: string;
  isCode?: boolean;
  state?: OptionState;
  disabled?: boolean;
  onPress?: () => void;
  compact?: boolean;
};

const palette: Record<OptionState, { border: string; shadow: string; bg: string; text: string }> = {
  idle: { border: Colors.border, shadow: Colors.border, bg: Colors.background, text: Colors.text },
  selected: { border: Colors.primary, shadow: Colors.primaryDark, bg: Colors.primarySoft, text: Colors.text },
  correct: { border: Colors.correct, shadow: Colors.correctDark, bg: Colors.correctSoft, text: Colors.correct },
  wrong: { border: Colors.wrong, shadow: Colors.wrongDark, bg: Colors.wrongSoft, text: Colors.wrong },
  dimmed: { border: Colors.border, shadow: Colors.border, bg: Colors.background, text: Colors.textMuted },
};

/** Tarjeta de opción con borde grueso y sombra inferior, como las respuestas de Duolingo. */
export function OptionCard({ text, badge, isCode, state = 'idle', disabled, onPress, compact }: Props) {
  const c = palette[state];
  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        if (Platform.OS !== 'web') Haptics.selectionAsync();
        onPress?.();
      }}>
      {({ pressed }) => (
        <View
          style={[
            styles.card,
            compact && styles.compact,
            {
              borderColor: c.border,
              borderBottomColor: c.shadow,
              backgroundColor: c.bg,
              borderBottomWidth: pressed ? 2 : 4,
              marginTop: pressed ? 2 : 0,
            },
          ]}>
          {badge ? (
            <View style={[styles.badge, { borderColor: c.border }]}>
              <AppText style={[styles.badgeText, { color: state === 'idle' ? Colors.textSecondary : c.text }]}>
                {badge}
              </AppText>
            </View>
          ) : null}
          <AppText style={[styles.text, isCode && styles.code, { color: c.text }]}>{text}</AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  compact: {
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: Fonts.extraBold,
    fontSize: 13,
  },
  text: {
    flex: 1,
    fontFamily: Fonts.bold,
    fontSize: 15,
    lineHeight: 21,
  },
  code: {
    fontFamily: Fonts.mono,
    fontSize: 14,
  },
});
