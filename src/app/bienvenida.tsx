import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChunkyButton } from '@/components/ui/chunky-button';
import { Mascot, type MascotMood } from '@/components/ui/mascot';
import { AppText } from '@/components/ui/text';
import { Colors, Fonts, MaxContentWidth, Radius } from '@/constants/theme';
import { courses, flatLessons } from '@/lessons';
import { FREEZES_PER_WEEK, useProgress } from '@/state/progress';

type IconName = ComponentProps<typeof Ionicons>['name'];

type Step = { mood: MascotMood; title: string; body: string; points?: { icon: IconName; text: string }[] };

const STEPS: Step[] = [
  {
    mood: 'happy',
    title: 'Hola, soy Tiza',
    body: 'Recreo te entrena para leer código: entender qué hace un programa sin tener que escribirlo vos. Sirve para revisar lo que te genera una IA, el código de tu equipo o un proyecto nuevo.',
  },
  {
    mood: 'think',
    title: 'Cómo vas a practicar',
    body: 'Nada de memorizar sintaxis. Mirás un fragmento y razonás qué hace.',
    points: [
      { icon: 'code-slash', text: 'Código real, de a poco y con ejemplos resueltos.' },
      { icon: 'hand-left', text: 'Antes de ver la respuesta, decís qué tan seguro estás.' },
      { icon: 'refresh-circle', text: 'Lo que te cuesta vuelve en Repaso, justo antes de que se te olvide.' },
    ],
  },
  {
    mood: 'cheer',
    title: 'Unos minutos por día alcanzan',
    body: `Cada lección es corta. Si un día no podés, la racha te espera: tenés ${FREEZES_PER_WEEK} congeladores por semana.`,
  },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { finishOnboarding } = useProgress();
  const [index, setIndex] = useState(0);
  const step = STEPS[index];
  const last = index === STEPS.length - 1;

  const finish = (openFirstLesson: boolean) => {
    finishOnboarding();
    router.replace('/');
    const first = flatLessons(courses[0])[0];
    if (openFirstLesson && first) router.push(`/leccion/${first.id}`);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
            ))}
          </View>
          {!last ? (
            <Pressable hitSlop={12} onPress={() => finish(false)}>
              <AppText style={styles.skip}>Saltar</AppText>
            </Pressable>
          ) : null}
        </View>

        <Animated.View key={index} entering={FadeIn.duration(220)} style={styles.body}>
          <Mascot mood={step.mood} size={140} />
          <AppText variant="title" style={styles.center}>
            {step.title}
          </AppText>
          <AppText color={Colors.textSecondary} style={styles.center}>
            {step.body}
          </AppText>
          {step.points ? (
            <View style={styles.points}>
              {step.points.map((p) => (
                <View key={p.icon} style={styles.point}>
                  <Ionicons name={p.icon} size={24} color={Colors.primary} />
                  <AppText style={styles.pointText}>{p.text}</AppText>
                </View>
              ))}
            </View>
          ) : null}
        </Animated.View>

        <View style={styles.footer}>
          {last ? (
            <>
              <ChunkyButton title="Empezar la primera lección" onPress={() => finish(true)} />
              <ChunkyButton title="Ver el camino primero" tone="ghost" onPress={() => finish(false)} />
            </>
          ) : (
            <ChunkyButton title="Siguiente" onPress={() => setIndex(index + 1)} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  // Los puntos van arriba para que no se muevan cuando el último paso suma un botón.
  topRow: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skip: {
    fontFamily: Fonts.extraBold,
    color: Colors.textSecondary,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  center: {
    textAlign: 'center',
  },
  points: {
    alignSelf: 'stretch',
    gap: 10,
    marginTop: 8,
  },
  point: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  pointText: {
    flex: 1,
  },
  footer: {
    gap: 14,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 22,
    backgroundColor: Colors.primary,
  },
});
