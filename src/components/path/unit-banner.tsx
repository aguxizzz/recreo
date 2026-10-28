import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Fonts, Radius, UnitPalette } from '@/constants/theme';
import type { Unit } from '@/lessons/types';

type Props = {
  unit: Unit;
  index: number;
  done: number;
};

export function UnitBanner({ unit, index, done }: Props) {
  const [color, shadow] = UnitPalette[unit.color];
  const complete = done === unit.lessons.length;

  return (
    <View style={[styles.root, { backgroundColor: color, borderBottomColor: shadow }]}>
      <View style={styles.text}>
        <AppText style={styles.eyebrow}>
          Unidad {index + 1} · {done}/{unit.lessons.length}
        </AppText>
        <AppText style={styles.title}>{unit.title}</AppText>
        <AppText style={styles.description}>{unit.description}</AppText>
      </View>
      <View style={[styles.badge, { backgroundColor: shadow }]}>
        <Ionicons name={complete ? 'trophy' : 'book'} size={22} color="#fff" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: Radius.lg,
    borderBottomWidth: 5,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    fontFamily: Fonts.black,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.8)',
  },
  title: {
    fontFamily: Fonts.black,
    fontSize: 20,
    lineHeight: 25,
    color: '#fff',
  },
  description: {
    fontSize: 14,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.9)',
  },
  badge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
