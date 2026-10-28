/**
 * Identidad visual de Recreo: un pizarrón oscuro con colores de tiza.
 * Cada color "sólido" tiene su variante `*Dark`, que se usa como sombra inferior
 * de los botones 3D (el efecto de "botón grueso" del estilo Duolingo).
 */

export const Colors = {
  // Pizarrón
  background: '#0E1A1D',
  surface: '#16262A',
  surfaceRaised: '#1D3136',
  border: '#2A4249',
  borderStrong: '#37555D',

  text: '#F3F1EA',
  textSecondary: '#93A9AE',
  textMuted: '#5E777D',

  // Marca
  primary: '#8B6CFF',
  primaryDark: '#6447D6',
  primarySoft: '#2A2550',

  // Estados
  correct: '#5BD67A',
  correctDark: '#36A456',
  correctSoft: '#173A26',
  wrong: '#FF6B6B',
  wrongDark: '#D14848',
  wrongSoft: '#3E1F23',

  // Gamificación
  streak: '#FF9F3D',
  xp: '#FFD447',
  xpDark: '#D9A61C',
  heart: '#FF5C7A',
  freeze: '#7FD8FF',

  disabled: '#2A4249',
  disabledText: '#5E777D',

  // Editor de código
  codeBackground: '#0A1316',
  codeLineNumber: '#3F5A61',
  codeHighlight: '#22343A',
} as const;

/** Colores por unidad del camino: [color, sombra]. */
export const UnitPalette = {
  violet: ['#8B6CFF', '#6447D6'],
  teal: ['#2EC4B6', '#1E9187'],
  pink: ['#FF7EB6', '#D8558F'],
  orange: ['#FF9F3D', '#D67A1F'],
  blue: ['#4DA8FF', '#2F7FD1'],
} as const;

export type UnitColor = keyof typeof UnitPalette;

export const SyntaxColors = {
  keyword: '#C792EA',
  type: '#FFCB6B',
  string: '#C3E88D',
  number: '#F78C6C',
  comment: '#5E777D',
  annotation: '#82AAFF',
  method: '#89DDFF',
  plain: '#E6E1D6',
  punctuation: '#93A9AE',
} as const;

export const Fonts = {
  regular: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extraBold: 'Nunito_800ExtraBold',
  black: 'Nunito_900Black',
  mono: 'JetBrainsMono_400Regular',
  monoBold: 'JetBrainsMono_700Bold',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 10,
  md: 14,
  lg: 18,
  pill: 999,
} as const;

export const MaxContentWidth = 560;
