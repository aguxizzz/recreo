import { router } from 'expo-router';
import { type ComponentRef, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LessonPopover } from '@/components/path/lesson-popover';
import { PathNode, type NodeState } from '@/components/path/path-node';
import { TopBar } from '@/components/path/top-bar';
import { UnitBanner } from '@/components/path/unit-banner';
import { Mascot } from '@/components/ui/mascot';
import { Colors, MaxContentWidth, UnitPalette } from '@/constants/theme';
import { courses, findLesson, flatLessons } from '@/lessons';
import { useProgress } from '@/state/progress';

/** Desplazamiento horizontal de cada nodo: una curva suave como el camino de Duolingo. */
const ZIGZAG = [0, 44, 70, 44, 0, -44, -70, -44];

type ViewRef = ComponentRef<typeof View>;

type OpenLesson = { id: string; top: number; offsetX: number };

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const { state, currentStreak, freezesLeft, reviewToday } = useProgress();
  const [openLesson, setOpenLesson] = useState<OpenLesson | null>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const contentRef = useRef<ViewRef>(null);
  const nodeRefs = useRef<Record<string, ViewRef | null>>({});
  const course = courses[0];

  // La lección actual es la primera sin completar; todo lo posterior queda bloqueado.
  const currentId = useMemo(
    () => flatLessons(course).find((l) => !state.completed[l.id])?.id ?? null,
    [course, state.completed],
  );

  const stateOf = (lessonId: string): NodeState => {
    if (state.completed[lessonId]) return 'done';
    return lessonId === currentId ? 'current' : 'locked';
  };

  // El cartel de la lección flota sobre el camino (no lo empuja): se ubica justo debajo del nodo.
  const toggleLesson = (lessonId: string, offsetX: number) => {
    const node = nodeRefs.current[lessonId];
    if (openLesson?.id === lessonId || !node || !contentRef.current) {
      setOpenLesson(null);
      return;
    }
    node.measureLayout(contentRef.current, (_x, y, _w, h) => setOpenLesson({ id: lessonId, top: y + h, offsetX }));
  };

  const open = openLesson ? findLesson(openLesson.id) : undefined;

  let globalIndex = 0;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <TopBar courseTitle={course.title} streak={currentStreak} freezes={freezesLeft} review={reviewToday} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} onScrollBeginDrag={() => setOpenLesson(null)}>
        <Pressable
          ref={contentRef}
          style={[styles.content, styles.pathArea]}
          onLayout={(e) => setContentWidth(e.nativeEvent.layout.width)}
          onPress={() => setOpenLesson(null)}>
          {course.units.map((unit, unitIndex) => {
            const color = UnitPalette[unit.color];
            const done = unit.lessons.filter((l) => state.completed[l.id]).length;
            // Tiza se ubica del lado opuesto hacia donde se curva el camino en esta unidad.
            const mascotLeft = ZIGZAG[(globalIndex + 1) % ZIGZAG.length] >= 0;
            return (
              <View key={unit.id} style={styles.unit}>
                <UnitBanner unit={unit} index={unitIndex} done={done} />
                <View style={styles.path}>
                  {unit.lessons.map((lesson) => {
                    const offset = ZIGZAG[globalIndex++ % ZIGZAG.length];
                    return (
                      <View
                        key={lesson.id}
                        ref={(r) => {
                          nodeRefs.current[lesson.id] = r;
                        }}
                        collapsable={false}>
                        <PathNode
                          state={stateOf(lesson.id)}
                          icon={lesson.icon}
                          color={color}
                          offsetX={offset}
                          perfect={state.completed[lesson.id]?.accuracy === 1}
                          onPress={() => toggleLesson(lesson.id, offset)}
                        />
                      </View>
                    );
                  })}
                  <View style={[styles.mascot, mascotLeft ? styles.mascotLeft : styles.mascotRight]} pointerEvents="none">
                    <Mascot mood={unitIndex % 2 ? 'think' : 'happy'} size={96} />
                  </View>
                </View>
              </View>
            );
          })}

          {openLesson && open ? (
            <LessonPopover
              key={openLesson.id}
              lesson={open.lesson}
              state={stateOf(open.lesson.id)}
              color={UnitPalette[open.unit.color]}
              position={`Lección ${open.index + 1} de ${open.unit.lessons.length}`}
              top={openLesson.top}
              arrowX={contentWidth / 2 + openLesson.offsetX}
              onStart={() => {
                setOpenLesson(null);
                router.push(`/leccion/${open.lesson.id}`);
              }}
            />
          ) : null}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  // Espacio extra al final para que el cartel de la última lección entre (y se pueda tocar en Android).
  pathArea: {
    paddingBottom: 180,
  },
  unit: {
    gap: 28,
    marginBottom: 36,
  },
  path: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 24,
  },
  mascot: {
    position: 'absolute',
    top: 70,
  },
  mascotLeft: {
    left: 0,
  },
  mascotRight: {
    right: 0,
  },
});
