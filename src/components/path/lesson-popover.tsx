import { StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';

import type { NodeState } from '@/components/path/path-node';
import { ChunkyButton } from '@/components/ui/chunky-button';
import { AppText } from '@/components/ui/text';
import { Colors, Fonts, Radius } from '@/constants/theme';
import type { Lesson } from '@/lessons/types';

type Props = {
  lesson: Lesson;
  position: string;
  state: NodeState;
  color: readonly [string, string];
  /** Posición vertical (debajo del nodo) dentro del área del camino. */
  top: number;
  /** Centro horizontal del nodo, medido desde el borde izquierdo del área del camino. */
  arrowX: number;
  onStart: () => void;
};

const SIDE_INSET = 24;
const ARROW = 18;

// Crece desde la flecha al abrirse y se achica hacia ella al cerrarse, sin rebote.
const enter = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 0.4 }] },
  100: { opacity: 1, transform: [{ scale: 1 }], easing: Easing.out(Easing.cubic) },
}).duration(180);

const exit = new Keyframe({
  0: { opacity: 1, transform: [{ scale: 1 }] },
  100: { opacity: 0, transform: [{ scale: 0.4 }], easing: Easing.in(Easing.cubic) },
}).duration(140);

/** Tarjeta que flota debajo de un nodo del camino, tapando lo que haya abajo. */
export function LessonPopover({ lesson, position, state, color, top, arrowX, onStart }: Props) {
  const locked = state === 'locked';
  const bg = locked ? Colors.surfaceRaised : color[0];
  const arrowLeft = arrowX - SIDE_INSET;

  return (
    <Animated.View
      entering={enter}
      exiting={exit}
      // El origen de la escala es la punta de la flecha (el nodo), como un globo que sale de ahí.
      style={[styles.root, { top, backgroundColor: bg, transformOrigin: [arrowLeft, 0, 0] }]}>
      <View style={[styles.arrow, { backgroundColor: bg, left: arrowLeft - ARROW / 2 }]} />
      <AppText style={[styles.title, locked && { color: Colors.textSecondary }]}>{lesson.title}</AppText>
      <AppText style={[styles.subtitle, locked && { color: Colors.textMuted }]}>
        {locked ? 'Completá las lecciones anteriores para desbloquearla' : `${position} · ${lesson.exercises.length} ejercicios`}
      </AppText>
      {!locked ? (
        <ChunkyButton tone="neutral" onPress={onStart} style={styles.button} contentStyle={styles.buttonFace}>
          <AppText style={[styles.buttonText, { color: color[0] }]}>
            {state === 'done' ? 'Practicar +5 XP' : 'Empezar +10 XP'}
          </AppText>
        </ChunkyButton>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    zIndex: 10,
    elevation: 10,
    left: SIDE_INSET,
    right: SIDE_INSET,
    marginTop: 4,
    borderRadius: Radius.lg,
    padding: 16,
    gap: 4,
  },
  arrow: {
    position: 'absolute',
    top: -ARROW / 2 + 1,
    width: ARROW,
    height: ARROW,
    transform: [{ rotate: '45deg' }],
  },
  title: {
    fontFamily: Fonts.black,
    fontSize: 18,
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.88)',
    marginBottom: 8,
  },
  button: {
    marginTop: 4,
  },
  buttonFace: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  buttonText: {
    fontFamily: Fonts.black,
    fontSize: 15,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
