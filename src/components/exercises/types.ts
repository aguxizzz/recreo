import type { Answer } from '@/lessons/grading';
import type { Exercise } from '@/lessons/types';

export type ExerciseStatus = 'answering' | 'correct' | 'wrong';

export type ExerciseProps<E extends Exercise> = {
  exercise: E;
  answer: Answer;
  onAnswer: (answer: Answer) => void;
  status: ExerciseStatus;
};
