import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import { CodeBlock } from '@/components/code/code-block';
import type { ExerciseProps } from '@/components/exercises/types';
import { OptionCard, type OptionState } from '@/components/ui/option-card';
import { AppText } from '@/components/ui/text';
import { Colors, Radius } from '@/constants/theme';
import { seededShuffle } from '@/lessons/grading';
import type { OrderExercise } from '@/lessons/types';

/**
 * Ordenar pasos al estilo "banco de palabras": tocar un paso del banco lo agrega
 * al final de la respuesta; tocarlo en la respuesta lo devuelve al banco.
 */
export function OrderExerciseView({ exercise, answer, onAnswer, status }: ExerciseProps<OrderExercise>) {
  const all = useMemo(() => [...exercise.steps, ...(exercise.distractors ?? [])], [exercise]);
  const shuffled = useMemo(() => seededShuffle(all, exercise.id), [all, exercise.id]);
  const placed = Array.isArray(answer) ? answer : [];
  const locked = status !== 'answering';
  const byId = Object.fromEntries(all.map((s) => [s.id, s]));
  const full = placed.length >= exercise.steps.length;

  const placedState = (id: string, index: number): OptionState => {
    if (!locked) return 'selected';
    return exercise.steps[index]?.id === id ? 'correct' : 'wrong';
  };

  return (
    <View style={styles.root}>
      {exercise.code ? <CodeBlock snippet={exercise.code} maxHeight={220} /> : null}

      <View style={styles.answerArea}>
        {placed.length === 0 ? (
          <AppText variant="caption" style={styles.placeholder}>
            {exercise.distractors?.length
              ? `Tocá los ${exercise.steps.length} pasos en orden. Sobra alguno.`
              : 'Tocá los pasos en el orden en que ocurren'}
          </AppText>
        ) : null}
        {placed.map((id, i) => (
          <Animated.View key={id} entering={FadeIn.duration(160)} layout={LinearTransition.duration(200)}>
            <View style={styles.row}>
              <View style={[styles.stepNumber, locked && { backgroundColor: placedState(id, i) === 'correct' ? Colors.correct : Colors.wrong }]}>
                <AppText style={styles.stepNumberText}>{i + 1}</AppText>
              </View>
              <View style={styles.flex}>
                <OptionCard
                  compact
                  text={byId[id].text}
                  state={placedState(id, i)}
                  disabled={locked}
                  onPress={() => onAnswer(placed.filter((p) => p !== id))}
                />
              </View>
            </View>
          </Animated.View>
        ))}
      </View>

      <View style={styles.bank}>
        {shuffled.map((step) => {
          const used = placed.includes(step.id);
          return (
            <Animated.View key={step.id} layout={LinearTransition}>
              {used ? (
                <View style={styles.ghost} />
              ) : (
                <OptionCard
                  compact
                  text={step.text}
                  state={locked || full ? 'dimmed' : 'idle'}
                  disabled={locked || full}
                  onPress={() => onAnswer([...placed, step.id])}
                />
              )}
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 16,
  },
  answerArea: {
    minHeight: 120,
    gap: 8,
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.border,
  },
  placeholder: {
    textAlign: 'center',
    marginTop: 36,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flex: {
    flex: 1,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 13,
    lineHeight: 16,
    color: '#fff',
  },
  bank: {
    gap: 8,
  },
  ghost: {
    height: 46,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
  },
});
