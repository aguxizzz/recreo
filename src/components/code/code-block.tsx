import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { tokenize, type Token } from '@/components/code/highlight';
import { Colors, Fonts, Radius, SyntaxColors } from '@/constants/theme';
import type { CodeSnippet } from '@/lessons/types';

const LINE_HEIGHT = 21;
const FONT_SIZE = 13;

export type LineState = 'selected' | 'correct' | 'wrong';

type Props = {
  snippet: CodeSnippet;
  /** Hace las líneas tocables (ejercicio tap-line). Recibe la línea 1-based relativa al snippet. */
  onLinePress?: (line: number) => void;
  lineStates?: Record<number, LineState>;
  /** Texto con el que se rellena el hueco `___` (ejercicio fill-blank). */
  blankValue?: string | null;
  blankState?: 'idle' | 'correct' | 'wrong';
  /** Altura máxima antes de que el bloque pase a tener scroll vertical. */
  maxHeight?: number;
};

const lineStateColors: Record<LineState, { bg: string; bar: string }> = {
  selected: { bg: Colors.primarySoft, bar: Colors.primary },
  correct: { bg: Colors.correctSoft, bar: Colors.correct },
  wrong: { bg: Colors.wrongSoft, bar: Colors.wrong },
};

export function CodeBlock({ snippet, onLinePress, lineStates, blankValue, blankState = 'idle', maxHeight }: Props) {
  const lines = useMemo(() => tokenize(snippet.code, snippet.language), [snippet.code, snippet.language]);
  const start = snippet.startLine ?? 1;
  const highlight = new Set(snippet.highlight ?? []);
  const gutterWidth = String(start + lines.length - 1).length * 8 + 18;
  // Ancho visible del área de código: las líneas tocables lo ocupan entero aunque sean cortas.
  const [viewportWidth, setViewportWidth] = useState(0);

  const body = (
    <View style={styles.body}>
      {/* Las filas de fondo ocupan todo el ancho, debajo del texto con scroll horizontal */}
      <View style={styles.overlay} pointerEvents="none">
        {lines.map((_, i) => {
          const n = i + 1;
          const state = lineStates?.[n];
          const colors = state ? lineStateColors[state] : null;
          return (
            <View
              key={i}
              style={[
                styles.rowBg,
                highlight.has(n) && { backgroundColor: Colors.codeHighlight },
                colors && { backgroundColor: colors.bg, borderLeftColor: colors.bar },
              ]}
            />
          );
        })}
      </View>

      <View style={[styles.gutter, { width: gutterWidth }]}>
        {lines.map((_, i) => (
          <Text key={i} style={[styles.lineNumber, lineStates?.[i + 1] && styles.lineNumberActive]}>
            {start + i}
          </Text>
        ))}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onLayout={(e) => setViewportWidth(e.nativeEvent.layout.width)}>
        <View style={{ minWidth: viewportWidth - 16 }}>
          {lines.map((tokens, i) => {
            const content = (
              <Text style={styles.line} numberOfLines={1}>
                {tokens.length === 0 ? ' ' : tokens.map((t, j) => renderToken(t, j, blankValue, blankState))}
              </Text>
            );
            if (!onLinePress) return <View key={i}>{content}</View>;
            return (
              <Pressable key={i} onPress={() => onLinePress(i + 1)}>
                {content}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {snippet.filename ? (
        <View style={styles.header}>
          <View style={styles.dots}>
            <View style={[styles.dot, { backgroundColor: '#FF6B6B' }]} />
            <View style={[styles.dot, { backgroundColor: '#FFD447' }]} />
            <View style={[styles.dot, { backgroundColor: '#5BD67A' }]} />
          </View>
          <View style={styles.tab}>
            <Text style={styles.tabText} numberOfLines={1}>
              {snippet.filename}
            </Text>
          </View>
        </View>
      ) : null}
      {maxHeight ? (
        <ScrollView style={{ maxHeight }} nestedScrollEnabled>
          {body}
        </ScrollView>
      ) : (
        body
      )}
    </View>
  );
}

function renderToken(token: Token, key: number, blankValue?: string | null, blankState?: string) {
  if (token.kind === 'blank') {
    const filled = blankValue != null;
    const stateStyle =
      blankState === 'correct' ? styles.blankCorrect : blankState === 'wrong' ? styles.blankWrong : null;
    return (
      <Text key={key} style={[styles.blank, filled && styles.blankFilled, stateStyle]}>
        {filled ? ` ${blankValue} ` : '      '}
      </Text>
    );
  }
  const color = token.kind === 'plain' ? SyntaxColors.plain : SyntaxColors[token.kind];
  const italic = token.kind === 'comment';
  return (
    <Text key={key} style={[{ color }, italic && styles.italic]}>
      {/* Espacios no separables: en web los espacios iniciales se colapsan y se pierde la indentación */}
      {token.text.replace(/ /g, '\u00A0')}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.codeBackground,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
  },
  dots: {
    flexDirection: 'row',
    gap: 5,
    paddingBottom: 8,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  tab: {
    backgroundColor: Colors.codeBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginBottom: -2,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: Colors.border,
    flexShrink: 1,
  },
  tabText: {
    color: Colors.text,
    fontFamily: Fonts.mono,
    fontSize: 12,
  },
  body: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  overlay: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
  },
  rowBg: {
    height: LINE_HEIGHT,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  gutter: {
    paddingRight: 10,
  },
  lineNumber: {
    height: LINE_HEIGHT,
    lineHeight: LINE_HEIGHT,
    textAlign: 'right',
    color: Colors.codeLineNumber,
    fontFamily: Fonts.mono,
    fontSize: 12,
  },
  lineNumberActive: {
    color: Colors.text,
  },
  scrollContent: {
    paddingRight: 16,
  },
  line: {
    height: LINE_HEIGHT,
    lineHeight: LINE_HEIGHT,
    fontFamily: Fonts.mono,
    fontSize: FONT_SIZE,
    color: SyntaxColors.plain,
  },
  italic: {
    fontStyle: 'italic',
  },
  blank: {
    backgroundColor: Colors.surfaceRaised,
    color: Colors.text,
    borderRadius: 4,
    textDecorationLine: 'underline',
    textDecorationColor: Colors.primary,
  },
  blankFilled: {
    backgroundColor: Colors.primarySoft,
    color: Colors.text,
    fontFamily: Fonts.monoBold,
    textDecorationLine: 'none',
  },
  blankCorrect: {
    backgroundColor: Colors.correctSoft,
    color: Colors.correct,
  },
  blankWrong: {
    backgroundColor: Colors.wrongSoft,
    color: Colors.wrong,
  },
});
