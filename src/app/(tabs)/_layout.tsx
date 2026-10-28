import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect } from 'expo-router';
import { Tabs, type BottomTabBarProps } from 'expo-router/tabs';
import { useEffect, useState, type ComponentProps } from 'react';
import { Easing as RNEasing, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { Colors, Fonts, Radius } from '@/constants/theme';
import { useProgress } from '@/state/progress';

type IconName = ComponentProps<typeof Ionicons>['name'];

const TAB_META: Record<string, { label: string; icon: IconName; color: string }> = {
  index: { label: 'Aprender', icon: 'school', color: Colors.primary },
  repaso: { label: 'Repaso', icon: 'refresh-circle', color: Colors.heart },
  perfil: { label: 'Perfil', icon: 'person-circle', color: Colors.xp },
};

export default function TabsLayout() {
  const { state } = useProgress();
  if (!state.onboarded) return <Redirect href="/bienvenida" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Fundido corto entre secciones, sin desplazamiento.
        animation: 'fade',
        transitionSpec: { animation: 'timing', config: { duration: 180, easing: RNEasing.out(RNEasing.cubic) } },
      }}
      tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="repaso" />
      <Tabs.Screen name="perfil" />
    </Tabs>
  );
}

type PillLayout = { x: number; y: number; width: number; height: number };

/**
 * Barra inferior estilo Duolingo: un único recuadro de color se desliza hasta el tab activo
 * y va cambiando de color mientras se mueve.
 */
function TabBar({ state, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const routes = state.routes.filter((route) => TAB_META[route.name]);
  const activeIndex = routes.findIndex((route) => route.key === state.routes[state.index]?.key);

  // Medidas de cada tab y de su recuadro, para que el indicador copie su tamaño exacto.
  const [items, setItems] = useState<Record<number, PillLayout>>({});
  const [pills, setPills] = useState<Record<number, PillLayout>>({});
  const store = (setter: typeof setPills, index: number, { x, y, width, height }: PillLayout) =>
    setter((prev) => ({ ...prev, [index]: { x, y, width, height } }));
  const measured = routes.length > 0 && routes.every((_, i) => pills[i] && items[i]);

  // Solo números y strings planos: es lo que viaja al hilo de animación.
  const steps = routes.map((_, i) => i);
  const colors = routes.map((route) => TAB_META[route.name].color);
  const xs = measured ? routes.map((_, i) => items[i].x + pills[i].x) : [];
  const widths = measured ? routes.map((_, i) => pills[i].width) : [];
  const top = measured ? items[0].y + pills[0].y : 0;
  const height = measured ? pills[0].height : 0;

  const position = useSharedValue(activeIndex);
  useEffect(() => {
    position.value = withTiming(activeIndex, { duration: 280, easing: Easing.inOut(Easing.cubic) });
  }, [activeIndex, position]);

  const indicatorStyle = useAnimatedStyle(() => {
    if (xs.length === 0) return {};
    const many = xs.length > 1;
    const color = many ? interpolateColor(position.value, steps, colors) : colors[0];
    return {
      top,
      height,
      width: many ? interpolate(position.value, steps, widths) : widths[0],
      transform: [{ translateX: many ? interpolate(position.value, steps, xs) : xs[0] }],
      borderColor: color,
      backgroundColor: color,
    };
  });

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 8 }]}>
      {measured && activeIndex >= 0 ? (
        <Animated.View pointerEvents="none" style={[styles.indicator, indicatorStyle]}>
          <View style={styles.indicatorFill} />
        </Animated.View>
      ) : null}
      {routes.map((route, index) => {
        const meta = TAB_META[route.name];
        const focused = index === activeIndex;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={meta.label}
            style={styles.item}
            onLayout={(e) => store(setItems, index, e.nativeEvent.layout)}
            onPress={() => {
              const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigateToTab(route.key);
            }}>
            <TabItem
              index={index}
              position={position}
              onPillLayout={(layout) => store(setPills, index, layout)}
              {...meta}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

/** Ícono y texto se tiñen a medida que el recuadro se acerca; el ícono crece apenas. */
function TabItem({
  index,
  position,
  onPillLayout,
  label,
  icon,
  color,
}: {
  index: number;
  position: SharedValue<number>;
  onPillLayout: (layout: PillLayout) => void;
  label: string;
  icon: IconName;
  color: string;
}) {
  const nearness = (v: number) => {
    'worklet';
    return interpolate(Math.abs(v - index), [0, 1], [1, 0], 'clamp');
  };

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + nearness(position.value) * 0.08 }] }));
  const activeIconStyle = useAnimatedStyle(() => ({ opacity: nearness(position.value) }));
  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(nearness(position.value), [0, 1], [Colors.textMuted, color]),
  }));

  return (
    <View style={styles.pill} onLayout={(e) => onPillLayout(e.nativeEvent.layout)}>
      <Animated.View style={iconStyle}>
        <Ionicons name={icon} size={28} color={Colors.textMuted} />
        <Animated.View style={[StyleSheet.absoluteFill, activeIconStyle]}>
          <Ionicons name={icon} size={28} color={color} />
        </Animated.View>
      </Animated.View>
      <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: 8,
    borderTopWidth: 2,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  pill: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    minWidth: 84,
  },
  indicator: {
    position: 'absolute',
    left: 0,
    borderRadius: Radius.md,
    borderWidth: 2,
    overflow: 'hidden',
  },
  indicatorFill: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.background,
    opacity: 0.87,
  },
  label: {
    fontFamily: Fonts.extraBold,
    fontSize: 11,
    letterSpacing: 0.6,
    lineHeight: 23,
    textTransform: 'uppercase',
  },
});
