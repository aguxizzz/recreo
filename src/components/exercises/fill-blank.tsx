import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { CodeBlock } from '@/components/code/code-block';
import type { ExerciseProps } from '@/components/exercises/types';
import { OptionCard, type OptionState } from '@/components/ui/option-card';
import { seededShuffle } from '@/lessons/grading';
import type { FillBlankExercise } from '@/lessons/types';

export function FillBlankExerciseView({ exercise, answer, onAnswer, status }: ExerciseProps<FillBlankExercise>) {
  const options = useMemo(() => seededShuffle(exercise.options, exercise.id), [exercise]);
  const chosen = typeof answer === 'string' ? answer : null;
  const locked = status !== 'answering';

  const stateFor = (option: string): OptionState => {
    if (!locked) return option === chosen ? 'selected' : 'idle';
    if (option === exercise.answer) return 'correct';
    if (option === chosen) return 'wrong';
    return 'dimmed';
  };

  return (
    <View style={styles.root}>
      <CodeBlock
        snippet={exercise.code}
        blankValue={chosen}
        blankState={locked ? (status === 'correct' ? 'correct' : 'wrong') : 'idle'}
        maxHeight={300}
      />
      <View style={styles.chips}>
        {options.map((o) => (
          <View key={o} style={styles.chip}>
            <OptionCard
              compact
              isCode
              text={o}
              state={stateFor(o)}
              disabled={locked}
              onPress={() => onAnswer(chosen === o ? null : o)}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 18,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  chip: {
    minWidth: '45%',
    flexGrow: 1,
  },
});
