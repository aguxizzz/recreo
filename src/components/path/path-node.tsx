import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { type ComponentProps } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Ellipse, Rect } from 'react-native-svg';

import { AppText } from '@/components/ui/text';
import { Colors, Fonts } from '@/constants/theme';

export type NodeState = 'locked' | 'current' | 'done';

/** El nodo es un "plato": una cara elíptica apoyada sobre un canto más oscuro. */
const WIDTH = 76;
const FACE_HEIGHT = 64;
const DEPTH = 9;
const HEIGHT = FACE_HEIGHT + DEPTH;

/** Anillo elíptico que marca la lección actual. */
const RING_GAP = 7;
const RING_STROKE = 7;
const RING_WIDTH = WIDTH + (RING_GAP + RING_STROKE) * 2;
const RING_HEIGHT = HEIGHT + (RING_GAP + RING_STROKE) * 2;

const LOCKED = [Colors.borderStrong, Colors.border] as const;
const PERFECT = [Colors.xp, Colors.xpDark] as const;

type Props = {
  state: NodeState;
  icon?: string;
  color: readonly [string, string];
  offsetX: number;
  onPress: () => void;
  perfect?: boolean;
};

/** Nodo del camino con relieve. El nodo actual tiene un anillo y un cartel "EMPEZAR". */
export function PathNode({ state, icon, color, offsetX, onPress, perfect }: Props) {
  const [face, side] = state === 'locked' ? LOCKED : state === 'done' && perfect ? PERFECT : color;
  // Las bloqueadas muestran su ícono en gris (como adelanto), no un candado.
  const iconName = (state === 'done' ? (perfect ? 'star' : 'checkmark') : (icon ?? 'code-slash')) as ComponentProps<
    typeof Ionicons
  >['name'];
  const iconColor = state === 'locked' ? 'rgba(255,255,255,0.32)' : '#fff';

  return (
    <View style={[styles.wrap, { transform: [{ translateX: offsetX }] }]}>
      {state === 'current' ? (
        <View style={styles.bubbleSlot} pointerEvents="none">
          <View style={styles.bubble}>
            <AppText style={[styles.bubbleText, { color: color[0] }]} numberOfLines={1}>
              Empezar
            </AppText>
            <View style={styles.bubbleArrow} />
          </View>
        </View>
      ) : null}

      <View style={styles.ringSpace}>
        {state === 'current' ? (
          <Svg width={RING_WIDTH} height={RING_HEIGHT} style={StyleSheet.absoluteFill}>
            <Ellipse
              cx={RING_WIDTH / 2}
              cy={RING_HEIGHT / 2}
              rx={(RING_WIDTH - RING_STROKE) / 2}
              ry={(RING_HEIGHT - RING_STROKE) / 2}
              fill="none"
              stroke={Colors.surfaceRaised}
              strokeWidth={RING_STROKE}
            />
          </Svg>
        ) : null}

        <Pressable
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onPress();
          }}
          hitSlop={6}
          accessibilityRole="button">
          {({ pressed }) => <Plate face={face} side={side} pressed={pressed} icon={iconName} iconColor={iconColor} />}
        </Pressable>
      </View>
    </View>
  );
}

type PlateProps = {
  face: string;
  side: string;
  pressed: boolean;
  icon: ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
};

/** Al presionar, la cara baja hasta tapar el canto, como un botón físico. */
function Plate({ face, side, pressed, icon, iconColor }: PlateProps) {
  const top = pressed ? DEPTH : 0;
  const cx = WIDTH / 2;
  const ry = FACE_HEIGHT / 2;

  return (
    <View style={styles.plate}>
      <Svg width={WIDTH} height={HEIGHT}>
        {/* Canto: dos elipses unidas por un rectángulo forman el borde del plato. */}
        <Ellipse cx={cx} cy={ry + DEPTH} rx={cx} ry={ry} fill={side} />
        <Rect x={0} y={ry + top} width={WIDTH} height={DEPTH - top} fill={side} />
        <Ellipse cx={cx} cy={ry + top} rx={cx} ry={ry} fill={face} />
      </Svg>
      <View style={[styles.icon, { top }]}>
        <Ionicons name={icon} size={34} color={iconColor} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  ringSpace: {
    width: RING_WIDTH,
    height: RING_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plate: {
    width: WIDTH,
    height: HEIGHT,
  },
  icon: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: FACE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Más ancho que el nodo, así el cartel nunca se parte en dos líneas.
  bubbleSlot: {
    position: 'absolute',
    top: -44,
    width: 200,
    zIndex: 2,
    alignItems: 'center',
  },
  bubble: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignItems: 'center',
  },
  bubbleText: {
    fontFamily: Fonts.black,
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  bubbleArrow: {
    position: 'absolute',
    bottom: -8,
    width: 12,
    height: 12,
    backgroundColor: Colors.surface,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: Colors.border,
    transform: [{ rotate: '45deg' }],
  },
});
