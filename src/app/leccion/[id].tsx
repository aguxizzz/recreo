import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams, usePreventRemove } from 'expo-router';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInRight,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { ExerciseView } from '@/components/exercises/exercise-view';
import type { ExerciseStatus } from '@/components/exercises/types';
import { FeedbackSheet, type FeedbackTone } from '@/components/lesson/feedback-sheet';
import { LessonComplete } from '@/components/lesson/lesson-complete';
import { LessonHeader } from '@/components/lesson/lesson-header';
import { ChunkyButton } from '@/components/ui/chunky-button';
import { Mascot } from '@/components/ui/mascot';
import { AppText } from '@/components/ui/text';
import { Colors, Fonts, MaxContentWidth, Radius } from '@/constants/theme';
import { conceptInfo, findLesson, isGraded, workedExample } from '@/lessons';
import {
  asksConfidence,
  correctAnswerText,
  explainFeedback,
  grade,
  isAnswerReady,
  isExplainAnswer,
  wrongAnswerWhy,
  type Answer,
  type Confidence,
} from '@/lessons/grading';
import type { Exercise } from '@/lessons/types';
import { isCruising, isScaffold, isStruggling, withoutHighlights, type Attempt } from '@/state/adaptive';
import { applySession, dayKey, useProgress, type ExerciseOutcome } from '@/state/progress';
import { buildInterleavedReview, buildReviewSession, daysBetween, masteryOf, type Rating } from '@/state/review';

const confidenceOptions: { id: Confidence; label: string }[] = [
  { id: 'sure', label: 'Seguro' },
  { id: 'think', label: 'Creo' },
  { id: 'guess', label: 'Adivino' },
];

type Feedback = {
  tone: FeedbackTone;
  title: string;
  explanation: string;
  correctAnswer: string | null;
  why: string | null;
  note: string | null;
};

function secondsSince(start: number): number {
  return Math.round((Date.now() - start) / 1000);
}

/** Arma el panel de feedback según el resultado y la confianza declarada. */
function buildFeedback(exercise: Exercise, answer: Answer, ok: boolean, confidence: Confidence | null): Feedback {
  const base = { explanation: exercise.explanation, why: null, note: null, correctAnswer: null };
  if (exercise.type === 'explain' && isExplainAnswer(answer) && answer.match) {
    const tone: FeedbackTone = ok ? 'correct' : answer.match === 'lineByLine' ? 'partial' : 'wrong';
    const title = { correct: 'Explicaste el propósito', partial: 'Línea por línea', wrong: 'Comparalo con el modelo' }[tone];
    return { ...base, tone, title, note: explainFeedback(exercise, answer.match) };
  }
  if (ok && confidence === 'guess') {
    return {
      ...base,
      tone: 'partial',
      title: 'Acertaste adivinando',
      note: 'Cuenta como acierto, pero el tema vuelve mañana en Repaso: la idea es que la próxima lo sepas.',
    };
  }
  if (ok) return { ...base, tone: 'correct', title: 'Correcto' };
  return {
    ...base,
    tone: 'wrong',
    title: 'No es eso',
    correctAnswer: correctAnswerText(exercise),
    why: wrongAnswerWhy(exercise, answer),
    note: confidence === 'sure' ? 'Estabas seguro: acá hay una idea para corregir, leé bien el porqué.' : null,
  };
}

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useProgress();
  const isReview = id === 'repaso';

  // Se calcula una sola vez al abrir: si los errores cambian durante la sesión, la cola no se mueve.
  const [initial] = useState<{ exercises: Exercise[]; reviewIds: Set<string> }>(() => {
    const today = dayKey();
    const reviewedToday = state.activity[today]?.reviews ?? 0;
    if (isReview) {
      const exercises = buildReviewSession(state.concepts, today, reviewedToday);
      return { exercises, reviewIds: new Set(exercises.map((e) => e.id)) };
    }
    const lesson = findLesson(id)?.lesson.exercises ?? [];
    if (!lesson.length) return { exercises: [], reviewIds: new Set() };
    const review = buildInterleavedReview(state.concepts, today, reviewedToday, new Set(lesson.map((e) => e.concept)));
    return { exercises: [...lesson, ...review], reviewIds: new Set(review.map((e) => e.id)) };
  });

  return (
    <LessonEntrance>
      {initial.exercises.length === 0 ? (
        <EmptySession isReview={isReview} />
      ) : (
        <LessonPlayer lessonId={isReview ? null : id} exercises={initial.exercises} reviewIds={initial.reviewIds} />
      )}
    </LessonEntrance>
  );
}

/** Si montar la lección tarda más que esto, mostramos a Tiza esperando en vez de una pantalla vacía. */
const LOADER_DELAY = 250;

const entering = FadeInRight.duration(260)
  .easing(Easing.out(Easing.cubic))
  .withInitialValues({ transform: [{ translateX: 16 }] });

const exitTiming = { duration: 200, easing: Easing.in(Easing.cubic) };

/**
 * Deja pintar el primer frame (el fundido de la navegación arranca sin trabas) y monta la lección
 * en el siguiente, entrando con un fundido y un leve corrimiento hacia la izquierda.
 * Al salir (por cualquier camino) se desvanece volviendo hacia la derecha.
 */
function LessonEntrance({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [slow, setSlow] = useState(false);
  const [left, setLeft] = useState(false);
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);

  // En web bloquear la salida también frenaría la recarga de la página, así que ahí sale directo.
  usePreventRemove(Platform.OS !== 'web' && !left, ({ repeat }) => {
    const leave = () => {
      setLeft(true);
      repeat();
    };
    translateX.value = withTiming(16, exitTiming);
    opacity.value = withTiming(0, exitTiming, (finished) => {
      if (finished) scheduleOnRN(leave);
    });
  });

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    const timer = setTimeout(() => setSlow(true), LOADER_DELAY);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, []);

  const exitStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.screen}>
      <Animated.View style={[styles.flex, exitStyle]}>
        {mounted ? (
          <Animated.View entering={entering} style={styles.flex}>
            {children}
          </Animated.View>
        ) : slow ? (
          <Animated.View entering={FadeIn.duration(200)} style={[styles.flex, styles.loader]}>
            <Mascot mood="think" size={110} />
            <AppText variant="caption">Preparando la lección…</AppText>
          </Animated.View>
        ) : null}
      </Animated.View>
    </View>
  );
}

/** Calificación para el repaso espaciado: adivinar no cuenta como saber, dudar sí pero acorta el intervalo. */
function rateAnswer(exercise: Exercise, answer: Answer, ok: boolean, confidence: Confidence | null): Rating {
  if (exercise.type === 'explain') {
    if (ok) return 'good';
    return isExplainAnswer(answer) && answer.match === 'lineByLine' ? 'hard' : 'again';
  }
  if (!ok || confidence === 'guess') return 'again';
  return confidence === 'think' ? 'hard' : 'good';
}

function LessonPlayer({
  lessonId,
  exercises,
  reviewIds,
}: {
  lessonId: string | null;
  exercises: Exercise[];
  /** Ejercicios de repaso. En una lección son los intercalados del final y no cuentan para su precisión. */
  reviewIds: Set<string>;
}) {
  const insets = useSafeAreaInsets();
  const { state, recordSession } = useProgress();

  const [queue, setQueue] = useState<Exercise[]>(exercises);
  const [position, setPosition] = useState(0);
  const [answer, setAnswer] = useState<Answer>(null);
  const [status, setStatus] = useState<ExerciseStatus>('answering');
  const [combo, setCombo] = useState(0);
  const [solved, setSolved] = useState(0);
  const [failed, setFailed] = useState<Set<string>>(new Set());
  /** Primer intento de cada ejercicio, para el repaso. Un acierto adivinando no baja la precisión pero cuenta como "again". */
  const [ratings, setRatings] = useState<Map<string, Rating>>(new Map());
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  /** Respuestas de la sesión, reintentos incluidos, para ajustar la dificultad. */
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  /** Ejercicios que quedan por hacer bien: crece con un ejemplo resuelto agregado y baja al retirar andamio. */
  const [planned, setPlanned] = useState(exercises.length);
  /** Conceptos cuyo ejemplo resuelto ya volvió en esta sesión: vuelve una sola vez. */
  const [reshown, setReshown] = useState<Set<string>>(new Set());
  const [cruising, setCruising] = useState(false);
  const [cruiseUsed, setCruiseUsed] = useState(false);
  const shownAt = useRef(0);
  const [phase, setPhase] = useState<'playing' | 'done'>('playing');
  const [confirmExit, setConfirmExit] = useState(false);
  const startedAt = useRef(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    shownAt.current = Date.now();
  }, [position]);

  const current = queue[position];
  const isReview = lessonId === null;

  const summary = useMemo(() => {
    const graded = exercises.filter(isGraded);
    // Lo salteado por ir sobrado no cuenta: la precisión es sobre lo que se respondió.
    const scored = (isReview ? graded : graded.filter((e) => !reviewIds.has(e.id))).filter((e) => ratings.has(e.id));
    const firstTry = scored.filter((e) => !failed.has(e.id)).length;
    const accuracy = scored.length ? firstTry / scored.length : 1;
    return { accuracy, graded };
  }, [exercises, failed, isReview, reviewIds, ratings]);

  const result = useMemo(() => {
    const outcomes: ExerciseOutcome[] = summary.graded.flatMap((e) => {
      const rating = ratings.get(e.id);
      return rating ? [{ exerciseId: e.id, concept: e.concept, rating, review: reviewIds.has(e.id) }] : [];
    });
    return { lessonId, accuracy: summary.accuracy, outcomes };
  }, [summary, ratings, lessonId, reviewIds]);

  const check = (confidence: Confidence | null) => {
    if (current.type === 'concept') return advance(true);
    const ok = grade(current, answer);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
    }
    setStatus(ok ? 'correct' : 'wrong');
    const rating = rateAnswer(current, answer, ok, confidence);
    setRatings((r) => (r.has(current.id) ? r : new Map(r).set(current.id, rating)));

    // Lo que fallás vuelve al final de la lección. Una explicación no: ya viste los modelos.
    // Por eso la lección siempre cierra con un acierto.
    let next = !ok && current.type !== 'explain' ? [...queue, current] : queue;
    let adaptNote: string | null = null;
    // La predicción en frío, antes del ejemplo resuelto, es para arriesgar: no cuenta para ajustar.
    const warmup = !isReview && position < exercises.findIndex((e) => e.type === 'concept');
    const nextAttempts = warmup ? attempts : [...attempts, { ok, confidence, seconds: secondsSince(shownAt.current) }];
    setAttempts(nextAttempts);

    const example = workedExample(current.concept);
    if (isStruggling(nextAttempts)) {
      setCruising(false);
      if (example && !reshown.has(current.concept)) {
        next = [...next.slice(0, position + 1), example, ...next.slice(position + 1)];
        setReshown((s) => new Set(s).add(current.concept));
        setPlanned((p) => p + 1);
        adaptNote = 'Varias seguidas que no salieron: antes de seguir, volvé a mirar el ejemplo resuelto.';
      }
    } else if (!cruiseUsed && isCruising(nextAttempts)) {
      setCruising(true);
      setCruiseUsed(true);
      // En el repaso cada ejercicio es el único de su concepto, así que ahí no se saltea nada.
      const skip = (e: Exercise, i: number) =>
        i > position && !isReview && isScaffold(e) && !reviewIds.has(e.id) && !failed.has(e.id);
      const skipped = next.filter(skip).length;
      next = next.filter((e, i) => !skip(e, i));
      setPlanned((p) => p - skipped);
      adaptNote = skipped
        ? 'Vas firme: salteo las preguntas con opciones que quedaban y saco las marcas del código.'
        : 'Vas firme: desde acá el código viene sin líneas marcadas.';
    }
    setQueue(next);

    const base = buildFeedback(current, answer, ok, confidence);
    setFeedback(adaptNote ? { ...base, note: base.note ? `${base.note}\n\n${adaptNote}` : adaptNote } : base);
    if (ok) {
      setCombo((c) => c + 1);
    } else {
      setCombo(0);
      setFailed((f) => new Set(f).add(current.id));
    }
  };

  const advance = (ok: boolean) => {
    // Una explicación que no llegó al propósito no se repite, así que igual avanza la barra.
    const nextSolved = ok || current.type === 'explain' ? solved + 1 : solved;
    setSolved(nextSolved);
    setAnswer(null);
    setStatus('answering');
    setFeedback(null);

    if (position + 1 >= queue.length) {
      setElapsed(secondsSince(startedAt.current));
      return setPhase('done');
    }
    setPosition((p) => p + 1);
  };

  const finish = () => {
    recordSession(result);
    router.back();
  };

  const takeaway = lessonId ? findLesson(lessonId)?.lesson.takeaway : undefined;

  if (phase === 'done') {
    // Cómo quedan los conceptos practicados, para mostrar dominio en vez de puntos.
    const today = dayKey();
    const after = applySession(state, result).concepts;
    const concepts = [...new Set(result.outcomes.map((o) => o.concept))].map((id) => ({
      ...conceptInfo(id),
      before: masteryOf(state.concepts[id]),
      after: masteryOf(after[id]),
      dueIn: daysBetween(today, after[id].due),
    }));
    return (
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={[styles.content, styles.flex]}>
          <LessonComplete
            concepts={concepts}
            accuracy={summary.accuracy}
            seconds={elapsed}
            isReview={isReview}
            takeaway={takeaway}
            onContinue={finish}
          />
        </View>
      </View>
    );
  }

  const ready = isAnswerReady(current, answer);
  const shown = cruising && isGraded(current) ? withoutHighlights(current) : current;
  const answered = status !== 'answering';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <LessonHeader
          progress={solved / planned}
          combo={combo}
          onClose={() => setConfirmExit(true)}
        />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.scroll, { paddingBottom: answered ? 320 : 120 }]}
        keyboardShouldPersistTaps="handled">
        <Animated.View key={`${current.id}-${position}`} entering={FadeIn.duration(200)} style={styles.content}>
          {!isReview && reviewIds.has(current.id) ? <ReviewTag title={conceptInfo(current.concept).title} /> : null}
          <ExerciseView exercise={shown} answer={answer} onAnswer={setAnswer} status={status} />
        </Animated.View>
      </ScrollView>

      {!answered || !feedback ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.content}>
            {asksConfidence(current) ? (
              <View style={styles.confidence}>
                <AppText variant="caption" style={styles.centerText}>
                  {ready ? '¿Qué tan seguro estás? Elegí para comprobar' : 'Respondé y después elegí qué tan seguro estás'}
                </AppText>
                <View style={styles.confidenceRow}>
                  {confidenceOptions.map((c) => (
                    <ChunkyButton
                      key={c.id}
                      title={c.label}
                      tone={c.id === 'sure' ? 'correct' : 'neutral'}
                      disabled={!ready}
                      style={styles.flex}
                      onPress={() => check(c.id)}
                    />
                  ))}
                </View>
              </View>
            ) : (
              <ChunkyButton
                title={current.type === 'concept' ? 'Entendido' : 'Comprobar'}
                tone={current.type === 'concept' ? 'primary' : 'correct'}
                disabled={!ready}
                onPress={() => check(null)}
              />
            )}
          </View>
        </View>
      ) : (
        <FeedbackSheet
          tone={feedback.tone}
          title={feedback.title}
          explanation={feedback.explanation}
          principle={current.type === 'concept' ? undefined : current.principle}
          correctAnswer={feedback.correctAnswer}
          why={feedback.why}
          note={feedback.note}
          onContinue={() => advance(status === 'correct')}
        />
      )}

      {confirmExit ? (
        <ExitConfirm onStay={() => setConfirmExit(false)} onLeave={() => router.back()} bottomInset={insets.bottom} />
      ) : null}
    </KeyboardAvoidingView>
  );
}

/** Marca los ejercicios intercalados: vienen de una lección anterior, no de la que se está haciendo. */
function ReviewTag({ title }: { title: string }) {
  return (
    <View style={styles.reviewTag}>
      <Ionicons name="refresh" size={14} color={Colors.freeze} />
      <AppText style={styles.reviewTagText} color={Colors.freeze} numberOfLines={1}>
        Repaso · {title}
      </AppText>
    </View>
  );
}

function ExitConfirm({
  onStay,
  onLeave,
  bottomInset,
}: {
  onStay: () => void;
  onLeave: () => void;
  bottomInset: number;
}) {
  return (
    <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} style={styles.backdrop}>
      <View style={[styles.dialog, { paddingBottom: bottomInset + 20 }]}>
        <View style={[styles.content, styles.dialogInner]}>
          <Mascot mood="sad" size={100} animated={false} />
          <AppText variant="heading" style={styles.centerText}>
            ¿Seguro que querés salir?
          </AppText>
          <AppText variant="caption" style={styles.centerText}>
            Vas a perder el progreso de esta lección.
          </AppText>
          <ChunkyButton title="Seguir aprendiendo" onPress={onStay} />
          <ChunkyButton title="Salir" tone="ghost" onPress={onLeave} />
        </View>
      </View>
    </Animated.View>
  );
}

function EmptySession({ isReview }: { isReview: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, styles.centered, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
      <View style={[styles.content, styles.emptyState]}>
        <View style={styles.centerBlock}>
          <Mascot mood={isReview ? 'happy' : 'think'} size={150} />
          <AppText variant="title" style={styles.centerText}>
            {isReview ? 'No hay nada para repasar' : 'No encontré esta lección'}
          </AppText>
          <AppText variant="caption" style={styles.centerText}>
            {isReview ? 'Cuando a un tema le toque volver, va a aparecer acá.' : 'Puede que se haya movido o renombrado.'}
          </AppText>
        </View>
        <ChunkyButton title="Volver" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
  },
  loader: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: 2,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  emptyState: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  centerBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  centerText: {
    textAlign: 'center',
  },
  confidence: {
    gap: 8,
  },
  confidenceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  reviewTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.freeze,
  },
  reviewTagText: {
    fontFamily: Fonts.extraBold,
    fontSize: 12,
    flexShrink: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  dialog: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  dialogInner: {
    alignItems: 'center',
    gap: 10,
  },
});
