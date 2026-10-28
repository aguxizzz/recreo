import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { Easing, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChunkyButton } from '@/components/ui/chunky-button';
import { AppText } from '@/components/ui/text';
import { Colors, Fonts, MaxContentWidth } from '@/constants/theme';

export type FeedbackTone = 'correct' | 'partial' | 'wrong';

type Props = {
  tone: FeedbackTone;
  title: string;
  explanation: string;
  /** La regla general en una frase. */
  principle?: string;
  /** Respuesta correcta, solo cuando el usuario falló. */
  correctAnswer?: string | null;
  /** Por qué la opción elegida no era. */
  why?: string | null;
  /** Comentario sobre la confianza declarada (ej. acertó adivinando). */
  note?: string | null;
  onContinue: () => void;
};

const toneColors: Record<FeedbackTone, { color: string; soft: string; icon: 'checkmark' | 'remove' | 'close' }> = {
  correct: { color: Colors.correct, soft: Colors.correctSoft, icon: 'checkmark' },
  partial: { color: Colors.xp, soft: '#3A3317', icon: 'remove' },
  wrong: { color: Colors.wrong, soft: Colors.wrongSoft, icon: 'close' },
};

/**
 * Panel inferior que aparece después de comprobar. El feedback habla de la tarea:
 * por qué es así, qué línea lo decide y la regla para llevarse. Nada de elogios genéricos.
 */
export function FeedbackSheet({ tone, title, explanation, principle, correctAnswer, why, note, onContinue }: Props) {
  const insets = useSafeAreaInsets();
  const { color, soft, icon } = toneColors[tone];

  return (
    <Animated.View
      entering={SlideInDown.duration(250).easing(Easing.out(Easing.cubic))}
      style={[styles.sheet, { backgroundColor: soft, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.inner}>
        <View style={styles.titleRow}>
          <View style={[styles.icon, { backgroundColor: color }]}>
            <Ionicons name={icon} size={22} color={Colors.background} />
          </View>
          <AppText style={styles.title} color={color}>
            {title}
          </AppText>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {note ? <AppText style={styles.note}>{note}</AppText> : null}
          {correctAnswer ? (
            <View style={styles.answer}>
              <AppText variant="label" color={color}>
                Respuesta correcta
              </AppText>
              <AppText style={styles.answerText} color={color}>
                {correctAnswer}
              </AppText>
            </View>
          ) : null}
          {why ? <AppText style={styles.explanation}>{why}</AppText> : null}
          <AppText style={styles.explanation}>{explanation}</AppText>
          {principle ? (
            <View style={[styles.principle, { borderLeftColor: color }]}>
              <AppText style={styles.principleText}>{principle}</AppText>
            </View>
          ) : null}
        </ScrollView>

        <ChunkyButton
          title="Continuar"
          tone={tone === 'wrong' ? 'wrong' : 'correct'}
          color={tone === 'partial' ? [Colors.xp, Colors.xpDark] : undefined}
          onPress={onContinue}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 18,
    paddingHorizontal: 16,
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: Fonts.black,
    fontSize: 22,
  },
  scroll: {
    maxHeight: 260,
  },
  note: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text,
  },
  principle: {
    borderLeftWidth: 3,
    paddingLeft: 10,
  },
  principleText: {
    fontFamily: Fonts.extraBold,
    fontSize: 15,
    lineHeight: 21,
  },
  scrollContent: {
    gap: 10,
  },
  answer: {
    gap: 2,
  },
  answerText: {
    fontFamily: Fonts.bold,
  },
  explanation: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
});
