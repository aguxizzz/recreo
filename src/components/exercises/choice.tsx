import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { CodeBlock } from '@/components/code/code-block';
import type { ExerciseProps } from '@/components/exercises/types';
import { OptionCard, type OptionState } from '@/components/ui/option-card';
import { seededShuffle } from '@/lessons/grading';
import type { ChoiceExercise } from '@/lessons/types';

export function ChoiceExerciseView({ exercise, answer, onAnswer, status }: ExerciseProps<ChoiceExercise>) {
  const options = useMemo(() => seededShuffle(exercise.options, exercise.id), [exercise]);
  const locked = status !== 'answering';

  const stateFor = (id: string): OptionState => {
    if (!locked) return answer === id ? 'selected' : 'idle';
    if (id === exercise.answer) return 'correct';
    if (id === answer) return 'wrong';
    return 'dimmed';
  };

  return (
    <View style={styles.root}>
      {exercise.code ? <CodeBlock snippet={exercise.code} maxHeight={300} /> : null}
      <View style={styles.options}>
        {options.map((o, i) => (
          <OptionCard
            key={o.id}
            badge={String(i + 1)}
            text={o.text}
            isCode={o.isCode}
            state={stateFor(o.id)}
            disabled={locked}
            onPress={() => onAnswer(o.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 18,
  },
  options: {
    gap: 10,
  },
});
