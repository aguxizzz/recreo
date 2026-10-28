import { demoCourse } from '@/lessons/courses/demo';
import type { ConceptExercise, ConceptMeta, Course, Exercise, Lesson, Unit } from '@/lessons/types';

export const courses: Course[] = [demoCourse];

export function getCourse(id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}

export type LessonLocation = { course: Course; unit: Unit; lesson: Lesson; index: number };

export function findLesson(lessonId: string): LessonLocation | undefined {
  for (const course of courses) {
    for (const unit of course.units) {
      const index = unit.lessons.findIndex((l) => l.id === lessonId);
      if (index >= 0) return { course, unit, lesson: unit.lessons[index], index };
    }
  }
  return undefined;
}

/** Todas las lecciones del curso en orden de camino. */
export function flatLessons(course: Course): Lesson[] {
  return course.units.flatMap((u) => u.lessons);
}

export function findExercise(exerciseId: string): Exercise | undefined {
  for (const course of courses) {
    for (const lesson of flatLessons(course)) {
      const found = lesson.exercises.find((e) => e.id === exerciseId);
      if (found) return found;
    }
  }
  return undefined;
}

/** Los ejercicios de tipo `concept` no se evalúan ni cuentan para la precisión. */
export function isGraded(exercise: Exercise): boolean {
  return exercise.type !== 'concept';
}

export type ConceptInfo = ConceptMeta & { id: string };

/** Todos los conceptos, en el orden en que aparecen en el camino. */
export function allConcepts(): ConceptInfo[] {
  const seen = new Set<string>();
  const result: ConceptInfo[] = [];
  for (const course of courses) {
    for (const lesson of flatLessons(course)) {
      for (const { concept } of lesson.exercises) {
        if (seen.has(concept)) continue;
        seen.add(concept);
        result.push({ id: concept, ...(course.concepts[concept] ?? { title: concept, canExplain: concept }) });
      }
    }
  }
  return result;
}

export function conceptInfo(id: string): ConceptInfo {
  return allConcepts().find((c) => c.id === id) ?? { id, title: id, canExplain: id };
}

/** Ejercicios evaluados que entrenan un concepto: los fragmentos entre los que rota el repaso. */
export function conceptExercises(concept: string): Exercise[] {
  return courses.flatMap((c) => flatLessons(c).flatMap((l) => l.exercises)).filter((e) => e.concept === concept && isGraded(e));
}

/** El ejemplo resuelto donde se presentó el concepto. */
export function workedExample(concept: string): ConceptExercise | undefined {
  for (const course of courses) {
    for (const lesson of flatLessons(course)) {
      const found = lesson.exercises.find((e): e is ConceptExercise => e.type === 'concept' && e.concept === concept);
      if (found) return found;
    }
  }
  return undefined;
}
