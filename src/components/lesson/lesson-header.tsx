import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ProgressBar } from '@/components/ui/progress-bar';
import { AppText } from '@/components/ui/text';
import { Colors, Fonts } from '@/constants/theme';

type Props = {
  progress: number;
  /** Racha de aciertos seguidos; a partir de 3 se muestra sobre la barra. */
  combo: number;
  onClose: () => void;
};

export function LessonHeader({ progress, combo, onClose }: Props) {
  return (
    <View style={styles.root}>
      <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Salir de la lección">
        <Ionicons name="close" size={30} color={Colors.textMuted} />
      </Pressable>
      <View style={styles.bar}>
        <ProgressBar value={progress} color={combo >= 3 ? Colors.streak : Colors.correct} />
        {combo >= 3 ? (
          <AppText style={styles.combo} color={Colors.streak}>
            {combo} SEGUIDAS
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bar: {
    flex: 1,
    flexDirection: 'row',
  },
  combo: {
    position: 'absolute',
    top: -16,
    left: 12,
    fontFamily: Fonts.black,
    fontSize: 11,
    letterSpacing: 1,
  },
});
