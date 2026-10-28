import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChoiceExerciseView } from '@/components/exercises/choice';
import { ConceptExerciseView } from '@/components/exercises/concept';
import { FillBlankExerciseView } from '@/components/exercises/fill-blank';
import { CompareExerciseView } from '@/components/exercises/compare';
import { ExplainExerciseView } from '@/components/exercises/explain';
import { OrderExerciseView } from '@/components/exercises/order';
import { PredictExerciseView } from '@/components/exercises/predict';
import { TapLineExerciseView } from '@/components/exercises/tap-line';
import type { ExerciseProps } from '@/components/exercises/types';
import { AppText } from '@/components/ui/text';
import { Colors, Fonts } from '@/constants/theme';
import type { Exercise } from '@/lessons/types';

type IconName = ComponentProps<typeof Ionicons>['name'];

function kindLabel(exercise: Exercise): { label: string; icon: IconName; color: string } {
  switch (exercise.type) {
    case 'concept':
      return { label: 'Ejemplo resuelto', icon: 'sparkles', color: Colors.xp };
    case 'predict':
      return { label: 'Predecí', icon: 'play-forward', color: Colors.streak };
    case 'order':
      return { label: 'Seguí el flujo', icon: 'git-network', color: '#2EC4B6' };
    case 'tap-line':
      return exercise.variant === 'bug'
        ? { label: 'Encontrá el bug', icon: 'bug', color: Colors.wrong }
        : { label: 'Tocá la línea', icon: 'finger-print', color: '#4DA8FF' };
    case 'compare':
      return { label: 'Compará los dos', icon: 'git-compare', color: '#FF7EB6' };
    case 'explain':
      return { label: 'Explicalo en una frase', icon: 'chatbubble-ellipses', color: Colors.correct };
    case 'fill-blank':
      return { label: 'Completá el código', icon: 'code-slash', color: '#4DA8FF' };
    case 'choice':
      return {
        'what-does': { label: '¿Qué hace?', icon: 'eye' as IconName, color: Colors.primary },
        predict: { label: 'Predecí el resultado', icon: 'play-forward' as IconName, color: Colors.streak },
        'where-lives': { label: '¿Dónde vive?', icon: 'folder-open' as IconName, color: '#FF7EB6' },
        why: { label: '¿Por qué?', icon: 'help-circle' as IconName, color: Colors.primary },
        'what-if': { label: '¿Qué cambia si…?', icon: 'shuffle' as IconName, color: Colors.streak },
      }[exercise.variant];
  }
}

export function ExerciseView(props: ExerciseProps<Exercise>) {
  const { exercise } = props;
  const kind = kindLabel(exercise);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.kind}>
          <Ionicons name={kind.icon} size={16} color={kind.color} />
          <AppText variant="label" color={kind.color}>
            {kind.label}
          </AppText>
        </View>
        {exercise.type === 'concept' ? <AppText variant="title">{exercise.title}</AppText> : null}
        <AppText style={exercise.type === 'concept' ? styles.conceptPrompt : styles.prompt}>{exercise.prompt}</AppText>
      </View>
      {renderBody(props)}
    </View>
  );
}

function renderBody({ exercise, ...rest }: ExerciseProps<Exercise>) {
  switch (exercise.type) {
    case 'concept':
      return <ConceptExerciseView exercise={exercise} {...rest} />;
    case 'choice':
      return <ChoiceExerciseView exercise={exercise} {...rest} />;
    case 'order':
      return <OrderExerciseView exercise={exercise} {...rest} />;
    case 'predict':
      return <PredictExerciseView exercise={exercise} {...rest} />;
    case 'tap-line':
      return <TapLineExerciseView exercise={exercise} {...rest} />;
    case 'compare':
      return <CompareExerciseView exercise={exercise} {...rest} />;
    case 'explain':
      return <ExplainExerciseView exercise={exercise} {...rest} />;
    case 'fill-blank':
      return <FillBlankExerciseView exercise={exercise} {...rest} />;
  }
}

const styles = StyleSheet.create({
  root: {
    gap: 20,
  },
  header: {
    gap: 8,
  },
  kind: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prompt: {
    fontFamily: Fonts.extraBold,
    fontSize: 20,
    lineHeight: 27,
  },
  conceptPrompt: {
    fontSize: 17,
    lineHeight: 25,
    color: Colors.textSecondary,
  },
});
