import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Colors, Fonts, Radius } from '@/constants/theme';

type Props = {
  courseTitle: string;
  streak: number;
  /** Congeladores de racha que quedan esta semana. */
  freezes: number;
  /** Temas para repasar hoy. */
  review: number;
};

export function TopBar({ courseTitle, streak, freezes, review }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.course}>
        <Ionicons name="cafe" size={18} color={Colors.streak} />
        <AppText style={styles.courseText} numberOfLines={1}>
          {courseTitle}
        </AppText>
      </View>
      <View style={styles.stats}>
        <Stat icon="flame" color={streak > 0 ? Colors.streak : Colors.textMuted} value={streak} />
        <Stat icon="snow" color={freezes > 0 ? Colors.freeze : Colors.textMuted} value={freezes} />
        <Stat icon="refresh-circle" color={review > 0 ? Colors.heart : Colors.textMuted} value={review} />
      </View>
    </View>
  );
}

function Stat({ icon, color, value }: { icon: ComponentProps<typeof Ionicons>['name']; color: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={22} color={color} />
      <AppText style={styles.statText} color={color}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  course: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    flexShrink: 1,
  },
  courseText: {
    fontFamily: Fonts.extraBold,
    fontSize: 14,
  },
  stats: {
    flexDirection: 'row',
    gap: 14,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontFamily: Fonts.black,
    fontSize: 16,
  },
});
