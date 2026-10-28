import { StyleSheet, View } from 'react-native';

import { CodeBlock } from '@/components/code/code-block';
import type { ExerciseProps } from '@/components/exercises/types';
import { OptionCard, type OptionState } from '@/components/ui/option-card';
import { AppText } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import type { CompareExercise } from '@/lessons/types';

const choices = [
  { id: 'a', text: 'A' },
  { id: 'b', text: 'B' },
  { id: 'both', text: 'Las dos' },
  { id: 'neither', text: 'Ninguna' },
] as const;

export function CompareExerciseView({ exercise, answer, onAnswer, status }: ExerciseProps<CompareExercise>) {
  const locked = status !== 'answering';

  const stateFor = (id: string): OptionState => {
    if (!locked) return answer === id ? 'selected' : 'idle';
    if (id === exercise.answer) return 'correct';
    if (id === answer) return 'wrong';
    return 'dimmed';
  };

  return (
    <View style={styles.root}>
      <Version label="A" snippet={exercise.a} />
      <Version label="B" snippet={exercise.b} />
      <View style={styles.choices}>
        {choices.map((c) => (
          <View key={c.id} style={styles.choice}>
            <OptionCard
              compact
              text={c.text}
              state={stateFor(c.id)}
              disabled={locked}
              onPress={() => onAnswer(c.id)}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

function Version({ label, snippet }: { label: string; snippet: CompareExercise['a'] }) {
  return (
    <View style={styles.version}>
      <AppText variant="label" color={Colors.textSecondary}>
        Versión {label}
      </AppText>
      <CodeBlock snippet={snippet} maxHeight={200} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 14,
  },
  version: {
    gap: 6,
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  choice: {
    minWidth: '45%',
    flexGrow: 1,
  },
});
