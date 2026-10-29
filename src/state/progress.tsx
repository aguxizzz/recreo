import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { findExercise, findLesson } from '@/lessons';
import {
  addDays,
  combineRatings,
  daysBetween,
  dueConcepts,
  DAILY_REVIEW_CAP,
  updateConcept,
  type ConceptRecord,
  type Rating,
} from '@/state/review';

const STORAGE_KEY = 'recreo/progress/v2';
const LEGACY_KEY = 'recreo/progress/v1';

/** Días sin practicar que se perdonan por semana sin cortar la racha. Se usan solos. */
export const FREEZES_PER_WEEK = 2;

export type LessonRecord = { accuracy: number; completedAt: string; timesCompleted: number };

export type DayActivity = { exercises: number; reviews: number };

export type ProgressState = {
  streak: number;
  lastActiveDay: string | null;
  /** Días sin práctica que cubrió un congelador. */
  frozenDays: string[];
  activity: Record<string, DayActivity>;
  completed: Record<string, LessonRecord>;
  concepts: Record<string, ConceptRecord>;
  /** Ya vio la bienvenida (o la salteó). */
  onboarded: boolean;
};

const initialState: ProgressState = {
  streak: 0,
  lastActiveDay: null,
  frozenDays: [],
  activity: {},
  completed: {},
  concepts: {},
  onboarded: false,
};

export type ExerciseOutcome = {
  exerciseId: string;
  concept: string;
  rating: Rating;
  /** Viene del repaso (la sesión de Repaso o el intercalado al final de una lección). */
  review: boolean;
};

export type SessionResult = {
  /** null para sesiones de repaso, que no completan una lección del camino. */
  lessonId: string | null;
  accuracy: number;
  /** Primer intento de cada ejercicio evaluado. */
  outcomes: ExerciseOutcome[];
};

export function dayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Lunes de la semana del día dado: los congeladores se reponen cada lunes. */
function weekKey(day: string): string {
  const d = new Date(`${day}T00:00:00`);
  return addDays(day, -((d.getDay() + 6) % 7));
}

/**
 * Los días sin práctica entre `from` y `to` (sin incluirlos), si todos entran en los
 * congeladores de su semana. Si alguno no entra, la racha se corta y devuelve null.
 */
function coverGap(from: string, to: string, frozen: string[]): string[] | null {
  const used: Record<string, number> = {};
  for (const day of frozen) used[weekKey(day)] = (used[weekKey(day)] ?? 0) + 1;
  const covered: string[] = [];
  for (let day = addDays(from, 1); day < to; day = addDays(day, 1)) {
    const week = weekKey(day);
    if ((used[week] ?? 0) >= FREEZES_PER_WEEK) return null;
    used[week] = (used[week] ?? 0) + 1;
    covered.push(day);
  }
  return covered;
}

export function applySession(state: ProgressState, result: SessionResult): ProgressState {
  const today = dayKey();
  let { streak, frozenDays } = state;
  if (state.lastActiveDay !== today) {
    const covered = state.lastActiveDay ? coverGap(state.lastActiveDay, today, frozenDays) : null;
    streak = covered ? streak + 1 : 1;
    // Solo importan los congeladores de las últimas semanas.
    frozenDays = [...frozenDays, ...(covered ?? [])].filter((d) => daysBetween(d, today) < 21);
  }

  const completed = { ...state.completed };
  if (result.lessonId) {
    const prev = completed[result.lessonId];
    completed[result.lessonId] = {
      accuracy: Math.max(prev?.accuracy ?? 0, result.accuracy),
      completedAt: new Date().toISOString(),
      timesCompleted: (prev?.timesCompleted ?? 0) + 1,
    };
  }

  const byConcept = new Map<string, ExerciseOutcome[]>();
  for (const o of result.outcomes) byConcept.set(o.concept, [...(byConcept.get(o.concept) ?? []), o]);
  const concepts = { ...state.concepts };
  for (const [concept, outcomes] of byConcept) {
    const rating = combineRatings(outcomes.map((o) => o.rating));
    concepts[concept] = updateConcept(concepts[concept], rating, today, outcomes.map((o) => o.exerciseId));
  }

  const reviewed = new Set(result.outcomes.filter((o) => o.review).map((o) => o.concept));
  const prevDay = state.activity[today] ?? { exercises: 0, reviews: 0 };
  return {
    ...state,
    streak,
    lastActiveDay: today,
    frozenDays,
    activity: {
      ...state.activity,
      [today]: {
        exercises: prevDay.exercises + result.outcomes.length,
        reviews: prevDay.reviews + reviewed.size,
      },
    },
    completed,
    concepts,
  };
}

type LegacyState = {
  streak?: number;
  lastActiveDay?: string | null;
  completed?: Record<string, LessonRecord>;
  mistakes?: string[];
};

/** Pasa el progreso de la v1 (repaso por ejercicio) a conceptos que vencen hoy. */
function migrate(legacy: LegacyState): ProgressState {
  const today = dayKey();
  const concepts: Record<string, ConceptRecord> = {};
  const add = (concept: string) => {
    concepts[concept] ??= { box: 1, due: today, lapses: 0, failStreak: 0, recent: [] };
  };
  for (const id of Object.keys(legacy.completed ?? {})) findLesson(id)?.lesson.exercises.forEach((e) => add(e.concept));
  for (const id of legacy.mistakes ?? []) {
    const exercise = findExercise(id);
    if (exercise) add(exercise.concept);
  }
  return {
    ...initialState,
    streak: legacy.streak ?? 0,
    lastActiveDay: legacy.lastActiveDay ?? null,
    completed: legacy.completed ?? {},
    concepts,
    onboarded: true,
  };
}

async function load(): Promise<ProgressState | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  // Quien ya tenía progreso guardado antes de que existiera la bienvenida no la necesita.
  if (raw) return { ...initialState, onboarded: true, ...JSON.parse(raw) };
  const legacy = await AsyncStorage.getItem(LEGACY_KEY);
  return legacy ? migrate(JSON.parse(legacy)) : null;
}

type ProgressContextValue = {
  state: ProgressState;
  ready: boolean;
  /** Racha visible: sigue viva si los días salteados entran en los congeladores. */
  currentStreak: number;
  /** Congeladores que quedan esta semana, contando los que ya se usarían por días salteados. */
  freezesLeft: number;
  /** Días que un congelador está cubriendo (ya usados o por usarse al volver hoy). */
  frozenDays: string[];
  practicedToday: boolean;
  /** Conceptos vencidos que entran en el repaso de hoy, y cuántos quedan para otro día. */
  reviewToday: number;
  reviewOverflow: number;
  recordSession: (result: SessionResult) => void;
  finishOnboarding: () => void;
  reset: () => void;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    load()
      .then((loaded) => loaded && setState(loaded))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const recordSession = useCallback((result: SessionResult) => {
    setState((s) => applySession(s, result));
  }, []);

  const finishOnboarding = useCallback(() => setState((s) => ({ ...s, onboarded: true })), []);

  const reset = useCallback(() => setState(initialState), []);

  const value = useMemo<ProgressContextValue>(() => {
    const today = dayKey();
    const last = state.lastActiveDay;
    const pending = last && last !== today ? coverGap(last, today, state.frozenDays) : [];
    const frozenDays = [...state.frozenDays, ...(pending ?? [])];
    const usedThisWeek = frozenDays.filter((d) => weekKey(d) === weekKey(today)).length;

    const due = dueConcepts(state.concepts, today).length;
    const slots = Math.max(0, DAILY_REVIEW_CAP - (state.activity[today]?.reviews ?? 0));
    return {
      state,
      ready,
      currentStreak: last && pending ? state.streak : 0,
      freezesLeft: Math.max(0, FREEZES_PER_WEEK - usedThisWeek),
      frozenDays: pending ? frozenDays : state.frozenDays,
      practicedToday: last === today,
      reviewToday: Math.min(due, slots),
      reviewOverflow: Math.max(0, due - slots),
      recordSession,
      finishOnboarding,
      reset,
    };
  }, [state, ready, recordSession, finishOnboarding, reset]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress debe usarse dentro de <ProgressProvider>');
  return ctx;
}
