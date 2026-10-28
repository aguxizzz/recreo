import type { Exercise, ExplainExercise } from '@/lessons/types';

/** A cuál de las dos explicaciones modelo se parece la del usuario, según él mismo. */
export type ExplainMatch = 'purpose' | 'lineByLine' | 'none';
export type ExplainAnswer = { text: string; match: ExplainMatch | null };

/**
 * Respuesta en curso de un ejercicio:
 * - choice: id de opción · fill-blank / predict: texto · compare: 'a' | 'b' | 'both' | 'neither'
 * - order: ids de pasos en el orden elegido · tap-line: número de línea · explain: texto + comparación
 */
export type Answer = string | string[] | number | ExplainAnswer | null;

/** Qué tan seguro estaba el usuario al responder. Un acierto "adivinando" va igual a Repaso. */
export type Confidence = 'sure' | 'think' | 'guess';

/** Mínimo de caracteres para que una explicación cuente como intento. */
export const MIN_EXPLANATION = 12;

export function isAnswerReady(exercise: Exercise, answer: Answer): boolean {
  switch (exercise.type) {
    case 'concept':
      return true;
    case 'order':
      return Array.isArray(answer) && answer.length === exercise.steps.length;
    case 'predict':
      return typeof answer === 'string' && answer.trim().length > 0;
    case 'explain':
      return isExplainAnswer(answer) && answer.match !== null;
    default:
      return answer !== null;
  }
}

/** Los tipos que el usuario evalúa solo (explain) o que no se evalúan (concept) no piden confianza. */
export function asksConfidence(exercise: Exercise): boolean {
  return exercise.type !== 'concept' && exercise.type !== 'explain';
}

export function grade(exercise: Exercise, answer: Answer): boolean {
  switch (exercise.type) {
    case 'concept':
      return true;
    case 'choice':
    case 'fill-blank':
    case 'compare':
      return answer === exercise.answer;
    case 'predict':
      return (
        typeof answer === 'string' &&
        [exercise.answer, ...(exercise.accept ?? [])].some((a) => normalize(a) === normalize(answer))
      );
    case 'tap-line':
      return typeof answer === 'number' && exercise.answerLines.includes(answer);
    case 'order':
      return Array.isArray(answer) && answer.every((id, i) => id === exercise.steps[i].id);
    case 'explain':
      return isExplainAnswer(answer) && answer.match === 'purpose';
  }
}

export function isExplainAnswer(answer: Answer): answer is ExplainAnswer {
  return typeof answer === 'object' && answer !== null && !Array.isArray(answer);
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '');
}

const compareLabels = { a: 'La versión A', b: 'La versión B', both: 'Las dos', neither: 'Ninguna' } as const;

/** Texto de la respuesta correcta para el panel de feedback. */
export function correctAnswerText(exercise: Exercise): string | null {
  switch (exercise.type) {
    case 'choice':
      return exercise.options.find((o) => o.id === exercise.answer)?.text ?? null;
    case 'fill-blank':
      return exercise.answer;
    case 'predict':
      return `${exercise.prefix ?? ''}${exercise.answer}${exercise.suffix ?? ''}`.trim();
    case 'compare':
      return compareLabels[exercise.answer];
    case 'tap-line':
      return exercise.answerLines
        .map((l) => `Línea ${(exercise.code.startLine ?? 1) + l - 1}`)
        .join(' o ');
    case 'order':
      return exercise.steps.map((s, i) => `${i + 1}. ${s.text}`).join('\n');
    case 'explain':
      return exercise.purpose;
    default:
      return null;
  }
}

/** Por qué la opción elegida no era, si el ejercicio lo explica. */
export function wrongAnswerWhy(exercise: Exercise, answer: Answer): string | null {
  if (exercise.type !== 'choice') return null;
  return exercise.options.find((o) => o.id === answer)?.why ?? null;
}

/** Feedback de la autoevaluación de una explicación, según a qué modelo se parecía. */
export function explainFeedback(exercise: ExplainExercise, match: ExplainMatch): string {
  switch (match) {
    case 'purpose':
      return 'Tu explicación dice para qué sirve el código, no solo qué líneas tiene. Ese es el nivel que piden en una entrevista.';
    case 'lineByLine':
      return 'Leíste el código paso a paso, y eso está bien como primer paso. Para la próxima, probá contar para qué sirve y qué pasa en el caso raro, como en la segunda explicación.';
    case 'none':
      return `Fijate en lo que dice la explicación al propósito: "${exercise.purpose}". Este ejercicio vuelve en Repaso.`;
  }
}

/** Mezcla determinística: el mismo ejercicio siempre se mezcla igual dentro de una sesión. */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  // Un orden "mezclado" que quedó igual al original haría trivial el ejercicio.
  if (out.length > 1 && out.every((x, i) => x === items[i])) out.push(out.shift()!);
  return out;
}
