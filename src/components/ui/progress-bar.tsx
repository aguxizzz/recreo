import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Colors } from '@/constants/theme';

type Props = {
  /** 0 a 1. */
  value: number;
  color?: string;
  height?: number;
  trackColor?: string;
};

export function ProgressBar({ value, color = Colors.correct, height = 16, trackColor = Colors.border }: Props) {
  const progress = useSharedValue(value);

  useEffect(() => {
    progress.value = withTiming(Math.max(0, Math.min(1, value)), { duration: 300, easing: Easing.out(Easing.cubic) });
  }, [value, progress]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: trackColor }]}>
      <Animated.View style={[styles.fill, { borderRadius: height / 2, backgroundColor: color }, fillStyle]}>
        {/* Brillo superior, como en las barras de Duolingo */}
        <View style={[styles.shine, { top: height * 0.22, height: Math.max(3, height * 0.22) }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flex: 1,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    minWidth: 0,
  },
  shine: {
    position: 'absolute',
    left: 8,
    right: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});
