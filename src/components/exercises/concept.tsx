import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { CodeBlock } from '@/components/code/code-block';
import type { ExerciseProps } from '@/components/exercises/types';
import { AppText } from '@/components/ui/text';
import { Colors, Fonts, Radius } from '@/constants/theme';
import type { ConceptExercise } from '@/lessons/types';

/**
 * Ejemplo resuelto: el código con sus pasos rotulados (tocar un paso resalta sus líneas),
 * los términos nuevos y la idea clave.
 */
export function ConceptExerciseView({ exercise }: ExerciseProps<ConceptExercise>) {
  const [active, setActive] = useState(0);
  const subgoals = exercise.subgoals ?? [];
  const code =
    exercise.code && subgoals.length
      ? { ...exercise.code, highlight: subgoals[active]?.lines ?? exercise.code.highlight }
      : exercise.code;

  return (
    <View style={styles.root}>
      {code ? <CodeBlock snippet={code} maxHeight={320} /> : null}

      {subgoals.length ? (
        <View style={styles.subgoals}>
          {subgoals.map((s, i) => {
            const on = i === active;
            return (
              <Pressable key={s.label} onPress={() => setActive(i)}>
                <View style={[styles.subgoal, on && styles.subgoalOn]}>
                  <View style={[styles.number, on && styles.numberOn]}>
                    <AppText style={styles.numberText} color={on ? '#fff' : Colors.textSecondary}>
                      {i + 1}
                    </AppText>
                  </View>
                  <View style={styles.flex}>
                    <AppText style={styles.subgoalLabel} color={on ? Colors.text : Colors.textSecondary}>
                      {s.label}
                    </AppText>
                    {on ? <AppText style={styles.subgoalAnswer}>{s.answer}</AppText> : null}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <Box icon="bulb" color={Colors.xp} title="La idea clave">
        <AppText>{exercise.explanation}</AppText>
      </Box>

      {exercise.terms?.length ? (
        <Box icon="book" color="#4DA8FF" title={exercise.terms.length > 1 ? 'Palabras nuevas' : 'Palabra nueva'}>
          {exercise.terms.map((t) => (
            <AppText key={t.term}>
              <AppText style={styles.term}>{t.term}</AppText>: {t.meaning}
            </AppText>
          ))}
        </Box>
      ) : null}

      {exercise.analogy ? (
        <Box icon="color-wand" color="#FF7EB6" title="Para imaginarlo">
          <AppText>{exercise.analogy}</AppText>
        </Box>
      ) : null}
    </View>
  );
}

function Box({
  icon,
  color,
  title,
  children,
}: {
  icon: 'bulb' | 'book' | 'color-wand';
  color: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.box}>
      <View style={styles.boxHeader}>
        <Ionicons name={icon} size={18} color={color} />
        <AppText variant="label" color={color}>
          {title}
        </AppText>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 14,
  },
  flex: {
    flex: 1,
  },
  subgoals: {
    gap: 6,
  },
  subgoal: {
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  subgoalOn: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  number: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberOn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  numberText: {
    fontFamily: Fonts.black,
    fontSize: 12,
    lineHeight: 15,
  },
  subgoalLabel: {
    fontFamily: Fonts.extraBold,
    fontSize: 15,
    lineHeight: 21,
  },
  subgoalAnswer: {
    marginTop: 2,
    fontSize: 15,
    lineHeight: 21,
  },
  box: {
    gap: 8,
    padding: 16,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  boxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  term: {
    fontFamily: Fonts.monoBold,
    fontSize: 14,
  },
});
