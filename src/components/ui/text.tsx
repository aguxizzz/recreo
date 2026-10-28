import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';

type Variant = 'title' | 'heading' | 'body' | 'label' | 'caption';

export type AppTextProps = TextProps & {
  variant?: Variant;
  color?: string;
};

export function AppText({ variant = 'body', color, style, ...rest }: AppTextProps) {
  return <Text style={[styles.base, styles[variant], color ? { color } : null, style]} {...rest} />;
}

const styles = StyleSheet.create({
  base: {
    color: Colors.text,
    fontFamily: Fonts.regular,
  },
  title: {
    fontFamily: Fonts.black,
    fontSize: 26,
    lineHeight: 32,
  },
  heading: {
    fontFamily: Fonts.extraBold,
    fontSize: 20,
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    lineHeight: 23,
  },
  label: {
    fontFamily: Fonts.extraBold,
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
});
