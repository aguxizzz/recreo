import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { ChunkyButton } from '@/components/ui/chunky-button';
import { Mascot } from '@/components/ui/mascot';
import { MasteryMeter, MasteryPill } from '@/components/ui/mastery-meter';
import { AppText } from '@/components/ui/text';
import { Colors, Fonts, Radius } from '@/constants/theme';
import type { MasteryLevel } from '@/state/review';

export type ConceptProgress = { id: string; title: string; before: MasteryLevel; after: MasteryLevel; dueIn: number };

type Props = {
  /** Cómo quedó cada concepto practicado: el progreso se muestra en dominio, no en puntos. */
  concepts: ConceptProgress[];
  accuracy: number;
  seconds: number;
  isReview: boolean;
  /** Lo que se aprendió en la lección, en una frase. */
  takeaway?: string;
  onContinue: () => void;
};

const LEVELS: MasteryLevel[] = ['new', 'learning', 'firm', 'mastered'];

function conceptCaption({ before, after, dueIn }: ConceptProgress): string {
  const due = dueIn <= 1 ? 'vuelve mañana' : `vuelve en ${dueIn} días`;
  if (before === 'new') return `Nuevo · ${due}`;
  if (LEVELS.indexOf(after) > LEVELS.indexOf(before)) return `Subió de nivel · ${due}`;
  return due[0].toUpperCase() + due.slice(1);
}

export function LessonComplete({ concepts, accuracy, seconds, isReview, takeaway, onContinue }: Props) {
  const perfect = accuracy === 1;
  const minutes = Math.floor(seconds / 60);
  const time = `${minutes}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <View style={styles.root}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.center}>
        <Animated.View entering={FadeIn.duration(300)}>
          <Mascot mood="cheer" size={concepts.length > 2 ? 120 : 150} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(150).duration(300)} style={styles.titles}>
          <AppText variant="title" color={Colors.xp} style={styles.title}>
            {isReview ? '¡Repaso completo!' : perfect ? '¡Lección perfecta!' : '¡Lección completa!'}
          </AppText>
          <AppText variant="caption" style={styles.subtitle}>
            {perfect ? 'Sin errores en el primer intento.' : 'Lo que fallaste o adivinaste vuelve antes al repaso.'}
          </AppText>
        </Animated.View>

        {takeaway ? (
          <Animated.View entering={FadeInDown.delay(250).duration(300)} style={styles.takeaway}>
            <AppText variant="label" color={Colors.textSecondary}>
              Hoy aprendiste
            </AppText>
            <AppText style={styles.takeawayText}>{takeaway}</AppText>
          </Animated.View>
        ) : null}

        {concepts.length ? (
          <Animated.View entering={FadeInDown.delay(350).duration(300)} style={styles.card}>
            <AppText variant="label" color={Colors.textSecondary}>
              Tu dominio
            </AppText>
            {concepts.map((c) => (
              <View key={c.id} style={styles.conceptRow}>
                <View style={styles.conceptText}>
                  <AppText style={styles.conceptTitle}>{c.title}</AppText>
                  <AppText variant="caption">{conceptCaption(c)}</AppText>
                </View>
                <View style={styles.conceptLevel}>
                  <MasteryPill level={c.after} />
                  <MasteryMeter level={c.after} />
                </View>
              </View>
            ))}
          </Animated.View>
        ) : null}

        <View style={styles.stats}>
          <Stat delay={450} label="Precisión" value={`${Math.round(accuracy * 100)}%`} color={Colors.correct} icon="locate" />
          <Stat delay={550} label="Tiempo" value={time} color="#4DA8FF" icon="time" />
        </View>
      </ScrollView>
      <ChunkyButton title="Continuar" onPress={onContinue} />
    </View>
  );
}

function Stat({
  label,
  value,
  color,
  icon,
  delay,
}: {
  label: string;
  value: string;
  color: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  delay: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(300)} style={[styles.stat, { borderColor: color, backgroundColor: color }]}>
      <AppText style={styles.statLabel}>{label}</AppText>
      <View style={styles.statBody}>
        <Ionicons name={icon} size={18} color={color} />
        <AppText style={styles.statValue} color={color}>
          {value}
        </AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
    paddingBottom: 24,
  },
  scroll: {
    flex: 1,
    marginBottom: 12,
  },
  center: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  titles: {
    alignItems: 'center',
    gap: 6,
  },
  title: {
    textAlign: 'center',
    fontSize: 30,
    lineHeight: 36,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 15,
  },
  takeaway: {
    alignSelf: 'stretch',
    gap: 6,
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  card: {
    alignSelf: 'stretch',
    gap: 10,
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  conceptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  conceptText: {
    flex: 1,
  },
  conceptTitle: {
    fontFamily: Fonts.bold,
  },
  conceptLevel: {
    alignItems: 'flex-end',
    gap: 6,
  },
  takeawayText: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    lineHeight: 23,
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  stat: {
    width: 100,
    borderWidth: 2,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  statLabel: {
    textAlign: 'center',
    fontFamily: Fonts.black,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.background,
    paddingVertical: 4,
  },
  statBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderBottomLeftRadius: Radius.md - 2,
    borderBottomRightRadius: Radius.md - 2,
  },
  statValue: {
    fontFamily: Fonts.black,
    fontSize: 18,
  },
});
