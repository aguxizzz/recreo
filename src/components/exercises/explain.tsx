import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { CodeBlock } from '@/components/code/code-block';
import type { ExerciseProps } from '@/components/exercises/types';
import { ChunkyButton } from '@/components/ui/chunky-button';
import { OptionCard, type OptionState } from '@/components/ui/option-card';
import { AppText } from '@/components/ui/text';
import { Colors, Fonts, Radius } from '@/constants/theme';
import { isExplainAnswer, MIN_EXPLANATION, seededShuffle, type ExplainMatch } from '@/lessons/grading';
import type { ExplainExercise } from '@/lessons/types';

const modelLabels: Record<Exclude<ExplainMatch, 'none'>, string> = {
  lineByLine: 'Línea por línea',
  purpose: 'Para qué sirve',
};

/**
 * Explicar con palabras propias en dos pasos: primero se escribe, después se comparan
 * dos explicaciones modelo (sin decir cuál es cuál) y se elige a cuál se parece la propia.
 */
export function ExplainExerciseView({ exercise, answer, onAnswer, status }: ExerciseProps<ExplainExercise>) {
  const current = isExplainAnswer(answer) ? answer : { text: '', match: null };
  const [comparing, setComparing] = useState(false);
  const locked = status !== 'answering';
  const models = useMemo(
    () =>
      seededShuffle(
        [
          { id: 'lineByLine' as const, text: exercise.lineByLine },
          { id: 'purpose' as const, text: exercise.purpose },
        ],
        exercise.id,
      ),
    [exercise],
  );

  const stateFor = (id: ExplainMatch): OptionState => {
    if (!locked) return current.match === id ? 'selected' : 'idle';
    if (id === 'purpose') return 'correct';
    if (id === current.match) return 'wrong';
    return 'dimmed';
  };

  return (
    <View style={styles.root}>
      <CodeBlock snippet={exercise.code} maxHeight={280} />

      <TextInput
        value={current.text}
        onChangeText={(text) => onAnswer({ text, match: null })}
        editable={!comparing}
        multiline
        placeholder="Escribilo como se lo contarías a alguien que no programa"
        placeholderTextColor={Colors.textMuted}
        style={[styles.input, comparing && styles.inputDone]}
      />

      {!comparing ? (
        <ChunkyButton
          title="Comparar con dos ejemplos"
          tone="neutral"
          disabled={current.text.trim().length < MIN_EXPLANATION}
          onPress={() => setComparing(true)}
        />
      ) : (
        <Animated.View entering={FadeIn.duration(200)} style={styles.compare}>
          <AppText variant="label" color={Colors.textSecondary}>
            ¿A cuál se parece más la tuya?
          </AppText>
          {models.map((m, i) => (
            <View key={m.id} style={styles.model}>
              {locked ? (
                <AppText variant="caption" color={m.id === 'purpose' ? Colors.correct : Colors.textSecondary}>
                  {modelLabels[m.id]}
                </AppText>
              ) : null}
              <OptionCard
                badge={String(i + 1)}
                text={m.text}
                state={stateFor(m.id)}
                disabled={locked}
                onPress={() => onAnswer({ ...current, match: m.id })}
              />
            </View>
          ))}
          <OptionCard
            compact
            text="A ninguna de las dos"
            state={stateFor('none')}
            disabled={locked}
            onPress={() => onAnswer({ ...current, match: 'none' })}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 16,
  },
  input: {
    minHeight: 96,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    padding: 14,
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  inputDone: {
    borderColor: Colors.border,
    color: Colors.textSecondary,
  },
  compare: {
    gap: 10,
  },
  model: {
    gap: 4,
  },
});
