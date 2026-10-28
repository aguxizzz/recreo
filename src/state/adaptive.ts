/**
 * Dificultad adaptativa dentro de una sesión, según cómo vienen las respuestas.
 *
 * - Trabado (3 fallos seguidos, o menos del 60% de aciertos): vuelve el ejemplo resuelto del concepto.
 * - Sobrado (90% o más, con las últimas respuestas seguras, rápidas y bien): se retira el andamio,
 *   o sea las preguntas con opciones que quedan y las líneas resaltadas del código.
 *
 * Umbrales de partida del informe en `assets/`; ajustarlos con datos propios.
 */

import type { Confidence } from '@/lessons/grading';
import type { Exercise, ExerciseType } from '@/lessons/types';

export type Attempt = { ok: boolean; confidence: Confidence | null; seconds: number };

/** Fallos seguidos que cuentan como estar trabado. */
export const STRUGGLE_STREAK = 3;
/** Por debajo de esta precisión también, pero recién con algunas respuestas para que no lo decida una sola. */
export const STRUGGLE_ACCURACY = 0.6;
export const MIN_ATTEMPTS_FOR_ACCURACY = 4;

export const CRUISE_ACCURACY = 0.9;
/** Últimas respuestas que tienen que ser seguras, rápidas y correctas. */
export const CRUISE_STREAK = 2;
/** Leer un fragmento lleva su tiempo: "rápido" es generoso. */
export const FAST_SECONDS = 30;
export const MIN_ATTEMPTS_TO_CRUISE = 3;

/** Reconocer entre opciones: sirve de andamio, y es lo primero que sobra si ya lo sabés. */
const SCAFFOLD_TYPES: ExerciseType[] = ['choice', 'fill-blank'];

function accuracy(attempts: Attempt[]): number {
  return attempts.filter((a) => a.ok).length / attempts.length;
}

export function isStruggling(attempts: Attempt[]): boolean {
  const last = attempts.slice(-STRUGGLE_STREAK);
  if (last.length === STRUGGLE_STREAK && last.every((a) => !a.ok)) return true;
  return attempts.length >= MIN_ATTEMPTS_FOR_ACCURACY && accuracy(attempts) < STRUGGLE_ACCURACY;
}

export function isCruising(attempts: Attempt[]): boolean {
  if (attempts.length < MIN_ATTEMPTS_TO_CRUISE || accuracy(attempts) < CRUISE_ACCURACY) return false;
  const last = attempts.slice(-CRUISE_STREAK);
  return last.every((a) => a.ok && a.confidence === 'sure' && a.seconds <= FAST_SECONDS);
}

export function isScaffold(exercise: Exercise): boolean {
  return SCAFFOLD_TYPES.includes(exercise.type);
}

/** El mismo ejercicio sin líneas resaltadas: hay que encontrar solo dónde mirar. */
export function withoutHighlights(exercise: Exercise): Exercise {
  if (!('code' in exercise) || !exercise.code?.highlight) return exercise;
  return { ...exercise, code: { ...exercise.code, highlight: undefined } } as Exercise;
}
