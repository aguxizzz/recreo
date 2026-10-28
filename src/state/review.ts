/**
 * Repaso espaciado por concepto (Leitner con 5 cajas).
 *
 * El ítem de repaso es el concepto, no el ejercicio: cada vez que vuelve se pregunta con otro
 * fragmento de los que lo entrenan, así se repasa la idea y no la memoria de la respuesta.
 */

import { allConcepts, conceptExercises, workedExample, type ConceptInfo } from '@/lessons';
import type { Exercise } from '@/lessons/types';

/** Cómo salió un ejercicio: fallado o acertado adivinando, acertado con duda, acertado seguro. */
export type Rating = 'again' | 'hard' | 'good';

export type ConceptRecord = {
  /** Caja de Leitner, de 1 a 5. */
  box: number;
  /** Día (`dayKey`) en que vuelve al repaso. */
  due: string;
  lapses: number;
  /** Sesiones seguidas en que se falló. Con 2 o más no alcanza con repasar: vuelve el ejemplo resuelto. */
  failStreak: number;
  /** Últimos ejercicios usados, el más reciente primero, para rotar fragmentos. */
  recent: string[];
};

/** Días hasta el próximo repaso según la caja. */
export const INTERVALS = [1, 3, 7, 16, 35];

/** Conceptos por día como máximo: el repaso tiene que entrar en un rato corto. */
export const DAILY_REVIEW_CAP = 6;

const RECENT_SIZE = 3;

export function addDays(day: string, days: number): string {
  const d = new Date(`${day}T00:00:00`);
  d.setDate(d.getDate() + days);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${String(d.getDate()).padStart(2, '0')}`;
}

export function daysBetween(from: string, to: string): number {
  const ms = new Date(`${to}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime();
  return Math.round(ms / 86_400_000);
}

/**
 * Junta los resultados de un concepto en una sesión. En una lección hay varios ejercicios del
 * mismo concepto: un solo error no lo manda de vuelta al principio, pero fallar un tercio sí.
 */
export function combineRatings(ratings: Rating[]): Rating {
  if (ratings.every((r) => r === 'good')) return 'good';
  const misses = ratings.filter((r) => r === 'again').length;
  return misses / ratings.length > 1 / 3 ? 'again' : 'hard';
}

export function updateConcept(
  record: ConceptRecord | undefined,
  rating: Rating,
  today: string,
  used: string[],
): ConceptRecord {
  const recent = [...used, ...(record?.recent ?? [])].filter((id, i, all) => all.indexOf(id) === i).slice(0, RECENT_SIZE);

  if (!record) {
    return { box: 1, due: addDays(today, 1), lapses: 0, failStreak: rating === 'again' ? 1 : 0, recent };
  }
  if (rating === 'again') {
    return { box: 1, due: addDays(today, 1), lapses: record.lapses + 1, failStreak: record.failStreak + 1, recent };
  }
  // Practicar antes de tiempo (repetir una lección) no adelanta cajas: el espaciado es lo que fija.
  if (record.due > today) return { ...record, failStreak: 0, recent };

  const box = rating === 'good' ? Math.min(5, record.box + 1) : record.box;
  const interval = rating === 'good' ? INTERVALS[box - 1] : INTERVALS[Math.max(0, box - 2)];
  return { box, due: addDays(today, interval), lapses: record.lapses, failStreak: 0, recent };
}

export type MasteryLevel = 'new' | 'learning' | 'firm' | 'mastered';

export function masteryOf(record: ConceptRecord | undefined): MasteryLevel {
  if (!record) return 'new';
  if (record.box >= 5) return 'mastered';
  return record.box >= 3 ? 'firm' : 'learning';
}

export const MasteryLabel: Record<MasteryLevel, string> = {
  new: 'Sin ver',
  learning: 'Aprendiendo',
  firm: 'Afianzando',
  mastered: 'Dominado',
};

export type ConceptStatus = ConceptInfo & { record?: ConceptRecord; level: MasteryLevel };

export function conceptStatuses(records: Record<string, ConceptRecord>): ConceptStatus[] {
  return allConcepts().map((c) => ({ ...c, record: records[c.id], level: masteryOf(records[c.id]) }));
}

/** Conceptos vencidos, del más atrasado al más reciente; a igual atraso, primero los más flojos. */
export function dueConcepts(records: Record<string, ConceptRecord>, today: string): string[] {
  return Object.entries(records)
    .filter(([id, r]) => r.due <= today && conceptExercises(id).length > 0)
    .sort(([, a], [, b]) => a.due.localeCompare(b.due) || a.box - b.box)
    .map(([id]) => id);
}

/** Elige el fragmento que hace más tiempo que no se ve (o uno nuevo). */
function pickExercise(candidates: Exercise[], recent: string[]): Exercise {
  const age = (e: Exercise) => {
    const i = recent.indexOf(e.id);
    return i < 0 ? Infinity : i;
  };
  return candidates.reduce((best, e) => (age(e) > age(best) ? e : best));
}

/** Un ejercicio por concepto; el que se falló dos veces seguidas vuelve primero a su ejemplo resuelto. */
function reviewItems(ids: string[], records: Record<string, ConceptRecord>): Exercise[] {
  return ids.flatMap((id) => {
    const record = records[id];
    const question = pickExercise(conceptExercises(id), record.recent);
    const example = record.failStreak >= 2 ? workedExample(id) : undefined;
    return example ? [example, question] : [question];
  });
}

/** Arma la sesión de repaso de hoy: un ejercicio por concepto vencido, hasta el tope diario. */
export function buildReviewSession(records: Record<string, ConceptRecord>, today: string, reviewedToday: number): Exercise[] {
  const slots = Math.max(0, DAILY_REVIEW_CAP - reviewedToday);
  return reviewItems(dueConcepts(records, today).slice(0, slots), records);
}

/** Conceptos viejos que se mezclan al final de cada lección. */
export const INTERLEAVED_PER_LESSON = 2;

/**
 * Repaso intercalado: al terminar una lección vuelven uno o dos conceptos anteriores que ya
 * vencían. Alternar temas obliga a reconocer qué idea aplica, no solo a repetir la de recién.
 * Descuenta del tope diario igual que el repaso.
 */
export function buildInterleavedReview(
  records: Record<string, ConceptRecord>,
  today: string,
  reviewedToday: number,
  lessonConcepts: Set<string>,
): Exercise[] {
  const slots = Math.min(INTERLEAVED_PER_LESSON, Math.max(0, DAILY_REVIEW_CAP - reviewedToday));
  const ids = dueConcepts(records, today).filter((id) => !lessonConcepts.has(id));
  return reviewItems(ids.slice(0, slots), records);
}
