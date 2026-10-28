import { StyleSheet, TextInput, View } from 'react-native';

import { CodeBlock } from '@/components/code/code-block';
import type { ExerciseProps } from '@/components/exercises/types';
import { OptionCard, type OptionState } from '@/components/ui/option-card';
import { AppText } from '@/components/ui/text';
import { Colors, Fonts, Radius } from '@/constants/theme';
import { grade } from '@/lessons/grading';
import type { PredictExercise } from '@/lessons/types';

/** Predecir un valor: se escribe, o se arma con las fichas de `keys` si las hay. */
export function PredictExerciseView({ exercise, answer, onAnswer, status }: ExerciseProps<PredictExercise>) {
  const value = typeof answer === 'string' ? answer : '';
  const locked = status !== 'answering';
  const fieldColor = !locked ? Colors.primary : status === 'correct' ? Colors.correct : Colors.wrong;

  const keyState = (key: string): OptionState => {
    if (!locked) return key === value ? 'selected' : 'idle';
    if (grade(exercise, key)) return 'correct';
    if (key === value) return 'wrong';
    return 'dimmed';
  };

  return (
    <View style={styles.root}>
      <CodeBlock snippet={exercise.code} maxHeight={300} />

      <View style={styles.answerRow}>
        {exercise.prefix ? <AppText style={styles.affix}>{exercise.prefix}</AppText> : null}
        {exercise.keys ? (
          <View style={[styles.field, styles.slot, { borderColor: value ? fieldColor : Colors.border }]}>
            <AppText style={[styles.fieldText, !value && styles.placeholder]}>{value || '?'}</AppText>
          </View>
        ) : (
          <TextInput
            value={value}
            onChangeText={(t) => onAnswer(t.length ? t : null)}
            editable={!locked}
            placeholder="Tu respuesta"
            placeholderTextColor={Colors.textMuted}
            keyboardType={exercise.keyboard === 'numeric' ? 'number-pad' : 'default'}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            style={[styles.field, styles.fieldText, styles.input, { borderColor: fieldColor }]}
          />
        )}
        {exercise.suffix ? <AppText style={styles.affix}>{exercise.suffix}</AppText> : null}
      </View>

      {exercise.keys ? (
        <View style={styles.keys}>
          {exercise.keys.map((k) => (
            <View key={k} style={styles.key}>
              <OptionCard
                compact
                isCode
                text={k}
                state={keyState(k)}
                disabled={locked}
                onPress={() => onAnswer(value === k ? null : k)}
              />
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 18,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  affix: {
    fontFamily: Fonts.monoBold,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  field: {
    minWidth: 120,
    borderWidth: 2,
    borderRadius: Radius.md,
    backgroundColor: Colors.codeBackground,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  slot: {
    alignItems: 'center',
  },
  input: {
    flexShrink: 1,
    textAlign: 'center',
  },
  fieldText: {
    fontFamily: Fonts.monoBold,
    fontSize: 18,
    color: Colors.text,
  },
  placeholder: {
    color: Colors.textMuted,
  },
  keys: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  key: {
    minWidth: '30%',
    flexGrow: 1,
  },
});
