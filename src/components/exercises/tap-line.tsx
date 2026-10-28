import { StyleSheet, View } from 'react-native';

import { CodeBlock, type LineState } from '@/components/code/code-block';
import type { ExerciseProps } from '@/components/exercises/types';
import { AppText } from '@/components/ui/text';
import type { TapLineExercise } from '@/lessons/types';

export function TapLineExerciseView({ exercise, answer, onAnswer, status }: ExerciseProps<TapLineExercise>) {
  const selected = typeof answer === 'number' ? answer : null;
  const locked = status !== 'answering';

  const lineStates: Record<number, LineState> = {};
  if (!locked && selected) lineStates[selected] = 'selected';
  if (locked) {
    if (selected && !exercise.answerLines.includes(selected)) lineStates[selected] = 'wrong';
    exercise.answerLines.forEach((l) => (lineStates[l] = 'correct'));
  }

  return (
    <View style={styles.root}>
      <CodeBlock snippet={exercise.code} lineStates={lineStates} onLinePress={locked ? undefined : onAnswer} />
      <AppText variant="caption" style={styles.hint}>
        Tocá una línea para marcarla
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
  },
  hint: {
    textAlign: 'center',
  },
});
