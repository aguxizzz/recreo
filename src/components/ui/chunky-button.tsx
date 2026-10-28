import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Colors, Fonts, Radius } from '@/constants/theme';

const DEPTH = 4;

type Tone = 'primary' | 'correct' | 'wrong' | 'neutral' | 'ghost';

const tones: Record<Tone, { bg: string; shadow: string; text: string; border?: string }> = {
  primary: { bg: Colors.primary, shadow: Colors.primaryDark, text: '#FFFFFF' },
  correct: { bg: Colors.correct, shadow: Colors.correctDark, text: '#0E1A1D' },
  wrong: { bg: Colors.wrong, shadow: Colors.wrongDark, text: '#FFFFFF' },
  neutral: { bg: Colors.surface, shadow: Colors.border, text: Colors.text, border: Colors.border },
  ghost: { bg: 'transparent', shadow: 'transparent', text: Colors.primary },
};

export type ChunkyButtonProps = {
  title?: string;
  children?: ReactNode;
  onPress?: () => void;
  tone?: Tone;
  /** Para colores fuera de la paleta de tonos (ej. el color de una unidad). */
  color?: [string, string];
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * Botón "3D": una capa de sombra sólida debajo que desaparece al presionar,
 * mientras la cara del botón baja `DEPTH` px.
 */
export function ChunkyButton({
  title,
  children,
  onPress,
  tone = 'primary',
  color,
  disabled,
  style,
  contentStyle,
}: ChunkyButtonProps) {
  const palette = tones[tone];
  const bg = disabled ? Colors.disabled : (color?.[0] ?? palette.bg);
  const shadow = disabled ? Colors.disabled : (color?.[1] ?? palette.shadow);
  const textColor = disabled ? Colors.disabledText : palette.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      style={[styles.root, style]}>
      {({ pressed }) => (
        <View style={[styles.shadow, { backgroundColor: shadow, paddingBottom: pressed ? 0 : DEPTH }]}>
          <View
            style={[
              styles.face,
              {
                backgroundColor: bg,
                marginTop: pressed ? DEPTH : 0,
                borderColor: palette.border ?? bg,
              },
              tone === 'ghost' && styles.ghostFace,
              contentStyle,
            ]}>
            {children ?? (
              <AppText style={[styles.title, { color: textColor }]} numberOfLines={1}>
                {title}
              </AppText>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: 'stretch',
  },
  shadow: {
    borderRadius: Radius.lg,
  },
  face: {
    minHeight: 50,
    borderRadius: Radius.lg,
    borderWidth: 2,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostFace: {
    borderWidth: 0,
  },
  title: {
    fontFamily: Fonts.black,
    fontSize: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
