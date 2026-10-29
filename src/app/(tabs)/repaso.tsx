import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChunkyButton } from '@/components/ui/chunky-button';
import { Mascot } from '@/components/ui/mascot';
import { MasteryColor, MasteryMeter } from '@/components/ui/mastery-meter';
import { ProgressBar } from '@/components/ui/progress-bar';
import { AppText } from '@/components/ui/text';
import { Colors, Fonts, MaxContentWidth, Radius } from '@/constants/theme';
import { dayKey, useProgress } from '@/state/progress';
import { conceptStatuses, daysBetween, MasteryLabel, type ConceptStatus } from '@/state/review';

/** Cada concepto lleva un ejercicio de menos de un minuto. */
const MINUTES_PER_CONCEPT = 0.6;

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const { state, reviewToday, reviewOverflow } = useProgress();
  const statuses = conceptStatuses(state.concepts);
  const mastered = statuses.filter((c) => c.level === 'mastered').length;
  const growing = statuses.filter((c) => c.level === 'firm' || c.level === 'learning').length;
  const reviewedToday = state.activity[dayKey()]?.reviews ?? 0;
  const minutes = Math.max(1, Math.round(reviewToday * MINUTES_PER_CONCEPT));
  const today = dayKey();
  const records = Object.values(state.concepts);
  const nextDueIn = Math.min(...records.map((r) => daysBetween(today, r.due)).filter((d) => d > 0));
  const started = records.length > 0;

  const heading = reviewToday
    ? `${reviewToday} ${reviewToday === 1 ? 'tema' : 'temas'} para hoy`
    : !started
      ? 'Todavía no hay nada para repasar'
      : reviewedToday
        ? 'Repaso de hoy hecho'
        : '¡Todo al día!';
  const caption = reviewToday
    ? `Unos ${minutes} min. Cada tema vuelve con otro fragmento de código.`
    : !started
      ? 'Los temas que veas en las lecciones van a aparecer acá, justo antes de que se te olviden.'
      : 'Cada tema vuelve cuando está por olvidarse: primero al día, después a los 3, 7, 16 y 35 días.';
  const idleButton = !started
    ? 'Ir a la primera lección'
    : nextDueIn === 1
      ? 'El próximo tema vuelve mañana'
      : Number.isFinite(nextDueIn)
        ? `El próximo tema vuelve en ${nextDueIn} días`
        : 'Nada para repasar';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <AppText variant="title">Repaso</AppText>

          <View style={styles.hero}>
            <Mascot mood={reviewToday ? 'think' : started ? 'cheer' : 'happy'} size={110} />
            <View style={styles.heroText}>
              <AppText variant="heading">{heading}</AppText>
              <AppText variant="caption">{caption}</AppText>
            </View>
          </View>

          {reviewOverflow ? (
            <View style={styles.notice}>
              <AppText variant="caption">
                Se juntaron {reviewOverflow} temas más. No pasa nada: hoy repasamos lo más urgente y el resto queda
                para mañana.
              </AppText>
            </View>
          ) : null}

          <ChunkyButton
            title={reviewToday ? 'Hacer mi repaso' : idleButton}
            disabled={!reviewToday && started}
            onPress={() => (reviewToday ? router.push('/leccion/repaso') : router.navigate('/'))}
          />

          <View style={styles.section}>
            <AppText variant="label" color={Colors.textSecondary}>
              Tu mapa
            </AppText>
            <View style={styles.summary}>
              <AppText variant="heading">
                Dominás {mastered} de {statuses.length}
              </AppText>
              <ProgressBar value={statuses.length ? mastered / statuses.length : 0} color={Colors.correct} height={12} />
              <AppText variant="caption">
                {growing
                  ? `${growing} ${growing === 1 ? 'tema se está' : 'temas se están'} afianzando. Un tema queda dominado cuando lo respondés bien después de semanas sin verlo.`
                  : 'Completá lecciones del camino para sumar temas al mapa.'}
              </AppText>
            </View>
            {statuses.map((c) => (
              <ConceptRow key={c.id} concept={c} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function ConceptRow({ concept }: { concept: ConceptStatus }) {
  const seen = concept.level !== 'new';
  const dueIn = concept.record ? daysBetween(dayKey(), concept.record.due) : 0;
  const when = !concept.record ? 'Todavía no lo viste' : dueIn <= 0 ? 'Toca hoy' : dueIn === 1 ? 'Vuelve mañana' : `Vuelve en ${dueIn} días`;

  return (
    <View style={[styles.conceptRow, !seen && styles.conceptLocked]}>
      <View style={styles.conceptText}>
        <AppText style={styles.conceptName} color={seen ? Colors.text : Colors.textMuted}>
          {concept.title}
        </AppText>
        <AppText variant="caption" numberOfLines={2}>
          Puedo explicar {concept.canExplain}
        </AppText>
      </View>
      <View style={styles.conceptLevel}>
        <AppText style={styles.levelText} color={MasteryColor[concept.level]}>
          {MasteryLabel[concept.level]}
        </AppText>
        <MasteryMeter level={concept.level} />
        <AppText style={styles.whenText}>{when}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 18,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  heroText: {
    flex: 1,
    gap: 4,
  },
  notice: {
    padding: 12,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
  },
  section: {
    gap: 10,
    marginTop: 6,
  },
  summary: {
    gap: 8,
    padding: 16,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
  },
  conceptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  conceptLocked: {
    borderStyle: 'dashed',
  },
  conceptText: {
    flex: 1,
    gap: 2,
  },
  conceptName: {
    fontFamily: Fonts.bold,
  },
  conceptLevel: {
    alignItems: 'flex-end',
    gap: 5,
  },
  levelText: {
    fontFamily: Fonts.extraBold,
    fontSize: 12,
  },
  whenText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: Colors.textMuted,
  },
});
