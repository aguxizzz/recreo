/**
 * Esquema de contenido de Recreo (v1).
 *
 * Jerarquía: Course → Unit → Lesson → Exercise.
 * Un curso representa un sistema real (ej. Conveyor); las unidades son las
 * etapas de su roadmap y cada lección es una sesión corta de 7–9 ejercicios.
 * Cómo escribir lecciones: `src/lessons/AUTHORING.md`.
 */

import type { UnitColor } from '@/constants/theme';

export type Language = 'java' | 'kotlin' | 'typescript' | 'sql' | 'yaml' | 'text';

/** Ubicación del fragmento en el repo real, para poder regenerar o verificar la lección. */
export type CodeRef = {
  file: string;
  /** Rango de líneas en el archivo original (1-based, inclusivo). */
  lines?: [number, number];
};

export type CodeSnippet = {
  language: Language;
  code: string;
  /** Nombre corto que se muestra en la pestaña del editor, ej. `OrderService.java`. */
  filename?: string;
  /** Número de la primera línea, para que coincida con el archivo original. */
  startLine?: number;
  /** Líneas a resaltar, relativas al snippet (1-based). */
  highlight?: number[];
};

/**
 * Qué exige el ejercicio, de menor a mayor: reconocer entre opciones, seguir la ejecución,
 * explicar con palabras propias o aplicar el concepto en código nuevo.
 */
export type ExerciseLevel = 'recognize' | 'trace' | 'explain' | 'transfer';

type ExerciseBase = {
  id: string;
  /** La consigna, en una o dos oraciones. */
  prompt: string;
  code?: CodeSnippet;
  /** Lo que se muestra después de responder: por qué es así, citando la línea que lo decide. */
  explanation: string;
  /** La regla general en una frase, para llevarse. Se muestra destacada en el feedback. */
  principle?: string;
  ref?: CodeRef;
  /** Concepto que entrena, para agrupar repasos (ej. "inyección de dependencias"). */
  concept: string;
  level: ExerciseLevel;
};

/** Paso rotulado de un ejemplo resuelto: qué pregunta responde un grupo de líneas. */
export type Subgoal = {
  label: string;
  /** Líneas del snippet que responden esta pregunta (1-based). */
  lines: number[];
  /** La respuesta para este ejemplo concreto. */
  answer: string;
};

/** Término técnico nuevo. Se presenta recién después de haber visto la idea en el código. */
export type Term = { term: string; meaning: string };

/**
 * Ejemplo resuelto: el código anotado paso a paso. No se evalúa; prepara los ejercicios
 * siguientes. `explanation` es la idea clave.
 */
export type ConceptExercise = Omit<ExerciseBase, 'level'> & {
  type: 'concept';
  title: string;
  subgoals?: Subgoal[];
  /** Como máximo 2 por lección. */
  terms?: Term[];
  /** Una sola analogía, diciendo dónde deja de valer. */
  analogy?: string;
};

export type ChoiceOption = {
  id: string;
  text: string;
  /** Si es true, el texto se muestra en tipografía monoespaciada. */
  isCode?: boolean;
  /** Por qué esta opción es incorrecta: se muestra si el usuario la eligió. */
  why?: string;
};

/**
 * Opción múltiple. Es reconocimiento, así que se usa como andamio y no como núcleo.
 * `variant` solo cambia la etiqueta que acompaña la consigna.
 */
export type ChoiceExercise = ExerciseBase & {
  type: 'choice';
  variant: 'what-does' | 'predict' | 'where-lives' | 'why' | 'what-if';
  options: ChoiceOption[];
  answer: string;
};

/**
 * Predecir un valor o estado construyendo la respuesta: con `keys`, se arma tocando
 * fichas (un teclado chico, ej. códigos HTTP); sin `keys`, se escribe.
 */
export type PredictExercise = ExerciseBase & {
  type: 'predict';
  code: CodeSnippet;
  answer: string;
  /** Otras respuestas válidas. Se comparan sin distinguir mayúsculas ni espacios. */
  accept?: string[];
  keys?: string[];
  /** Teclado del celular cuando se escribe la respuesta. */
  keyboard?: 'numeric' | 'text';
  /** Texto pegado antes y después del campo, ej. "HTTP " o " pesos". */
  prefix?: string;
  suffix?: string;
};

/** Tocar la línea que hace algo (`where`) o la que tiene el problema (`bug`). */
export type TapLineExercise = ExerciseBase & {
  type: 'tap-line';
  variant: 'where' | 'bug';
  code: CodeSnippet;
  /** Líneas que cuentan como correctas, relativas al snippet (1-based). */
  answerLines: number[];
};

/** Dos versiones de un mismo código: ¿en cuál pasa lo que dice la consigna? */
export type CompareExercise = ExerciseBase & {
  type: 'compare';
  a: CodeSnippet;
  b: CodeSnippet;
  answer: 'a' | 'b' | 'both' | 'neither';
};

/**
 * Explicar con palabras propias. Después de escribir, el usuario compara su frase con dos
 * explicaciones modelo y elige a cuál se parece: es autoevaluación, nadie corrige el texto.
 */
export type ExplainExercise = ExerciseBase & {
  type: 'explain';
  code: CodeSnippet;
  /** Lee el código línea por línea ("llama a X, después a Y"). */
  lineByLine: string;
  /** Dice para qué sirve, incluyendo el caso borde. Es el nivel al que se apunta. */
  purpose: string;
};

/** Ordenar pasos de un flujo. `steps` se escribe en el orden correcto y se mezcla al mostrarse. */
export type OrderExercise = ExerciseBase & {
  type: 'order';
  steps: { id: string; text: string }[];
  /** Pasos que no participan. Solo si representan un error conceptual real, nunca de relleno. */
  distractors?: { id: string; text: string }[];
};

/** Completar el hueco `___` del código con una de las opciones. */
export type FillBlankExercise = ExerciseBase & {
  type: 'fill-blank';
  code: CodeSnippet;
  options: string[];
  answer: string;
};

export type Exercise =
  | ConceptExercise
  | ChoiceExercise
  | PredictExercise
  | OrderExercise
  | TapLineExercise
  | CompareExercise
  | ExplainExercise
  | FillBlankExercise;

export type ExerciseType = Exercise['type'];

export type Lesson = {
  id: string;
  title: string;
  /** Ícono de Ionicons para el nodo del camino. */
  icon?: string;
  /** Lo que se aprendió, en una frase llana. Se muestra al terminar ("Hoy aprendiste a leer…"). */
  takeaway: string;
  exercises: Exercise[];
};

export type Unit = {
  id: string;
  title: string;
  description: string;
  color: UnitColor;
  lessons: Lesson[];
};

/** Cómo se muestra un concepto en el mapa de dominio. */
export type ConceptMeta = {
  title: string;
  /** Qué puede explicar quien lo domina, completando "Puedo explicar…". */
  canExplain: string;
};

export type Course = {
  id: string;
  title: string;
  /** Sistema o repo al que refiere, ej. `PROJECTS/new/conveyor`. */
  source?: string;
  language: Language;
  description: string;
  /** Una entrada por cada `concept` que usan los ejercicios, en orden de aparición. */
  concepts: Record<string, ConceptMeta>;
  units: Unit[];
};
