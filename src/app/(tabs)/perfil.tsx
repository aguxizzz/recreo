import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChunkyButton } from '@/components/ui/chunky-button';
import { Mascot } from '@/components/ui/mascot';
import { AppText } from '@/components/ui/text';
import { Colors, Fonts, MaxContentWidth, Radius } from '@/constants/theme';
import { dayKey, FREEZES_PER_WEEK, useProgress } from '@/state/progress';
import { conceptStatuses } from '@/state/review';

const WEEKDAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { state, currentStreak, freezesLeft, frozenDays, practicedToday, reset } = useProgress();

  const records = Object.values(state.completed);
  const avgAccuracy = records.length ? records.reduce((sum, r) => sum + r.accuracy, 0) / records.length : 0;
  const statuses = conceptStatuses(state.concepts);
  const mastered = statuses.filter((c) => c.level === 'mastered').length;

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = dayKey(d);
    return {
      label: WEEKDAYS[d.getDay()],
      exercises: state.activity[key]?.exercises ?? 0,
      frozen: frozenDays.includes(key),
      today: i === 6,
    };
  });
  const maxExercises = Math.max(10, ...week.map((w) => w.exercises));

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Mascot size={84} mood="happy" animated={false} />
            </View>
            <View style={styles.headerText}>
              <AppText variant="title">Tu recreo</AppText>
              <AppText variant="caption">Leyendo código de verdad, un rato por día.</AppText>
            </View>
          </View>

          <View style={styles.grid}>
            <StatCard icon="flame" color={Colors.streak} value={String(currentStreak)} label="Días de racha" />
            <StatCard icon="ribbon" color={Colors.correct} value={`${mastered}/${statuses.length}`} label="Temas dominados" />
            <StatCard icon="checkmark-done" color={Colors.primary} value={String(records.length)} label="Lecciones" />
            <StatCard icon="locate" color="#4DA8FF" value={`${Math.round(avgAccuracy * 100)}%`} label="Precisión" />
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <AppText variant="heading">Tu rato de hoy</AppText>
              <Ionicons
                name={practicedToday ? 'checkmark-circle' : 'ellipse-outline'}
                size={26}
                color={practicedToday ? Colors.correct : Colors.textMuted}
              />
            </View>
            <AppText variant="caption">
              {practicedToday
                ? 'Hecho. La racha suma por día, no por cantidad: no hace falta más.'
                : 'Con una lección o un repaso corto alcanza para sumar el día.'}
            </AppText>
            <View style={styles.freezeRow}>
              <View style={styles.freezeIcons}>
                {Array.from({ length: FREEZES_PER_WEEK }, (_, i) => (
                  <Ionicons key={i} name="snow" size={22} color={i < freezesLeft ? Colors.freeze : Colors.border} />
                ))}
              </View>
              <AppText variant="caption" style={styles.freezeText}>
                Si un día no podés, un congelador cuida la racha solo. Hay {FREEZES_PER_WEEK} por semana y se reponen
                los lunes.
              </AppText>
            </View>
          </View>

          <View style={styles.card}>
            <AppText variant="heading">Ejercicios esta semana</AppText>
            <View style={styles.chart}>
              {week.map((d, i) => (
                <View key={i} style={styles.barCol}>
                  <AppText style={styles.barValue}>{d.exercises || ''}</AppText>
                  <View style={[styles.barTrack, d.frozen && styles.barFrozen]}>
                    {d.frozen ? (
                      <Ionicons name="snow" size={18} color={Colors.freeze} />
                    ) : (
                      <View
                        style={[styles.barFill, { height: `${(d.exercises / maxExercises) * 100}%`, backgroundColor: Colors.primary }]}
                      />
                    )}
                  </View>
                  <AppText style={[styles.barLabel, d.today && { color: Colors.text }]}>{d.label}</AppText>
                </View>
              ))}
            </View>
          </View>

          <ChunkyButton title="Reiniciar progreso" tone="neutral" onPress={reset} />
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({
  icon,
  color,
  value,
  label,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  color: string;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={24} color={color} />
      <View>
        <AppText style={styles.statValue}>{value}</AppText>
        <AppText variant="caption">{label}</AppText>
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
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primarySoft,
    borderWidth: 3,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  stat: {
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  statValue: {
    fontFamily: Fonts.black,
    fontSize: 20,
    lineHeight: 24,
  },
  card: {
    gap: 12,
    padding: 16,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  freezeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: Colors.border,
  },
  freezeIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  freezeText: {
    flex: 1,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 150,
    gap: 6,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barValue: {
    fontFamily: Fonts.extraBold,
    fontSize: 11,
    color: Colors.textSecondary,
    height: 14,
  },
  barTrack: {
    flex: 1,
    width: '70%',
    borderRadius: 8,
    backgroundColor: Colors.surface,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFrozen: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  barLabel: {
    fontFamily: Fonts.extraBold,
    fontSize: 12,
    color: Colors.textMuted,
  },
});
