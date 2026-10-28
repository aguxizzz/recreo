import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

import { Colors } from '@/constants/theme';

export type MascotMood = 'happy' | 'cheer' | 'sad' | 'think';

type Props = {
  mood?: MascotMood;
  size?: number;
  /** Si es true, Tiza parpadea de vez en cuando. */
  animated?: boolean;
};

const BODY_LIGHT = '#8FD0FF';
const BODY_MID = '#4FA3FF';
const BODY_DARK = '#2B6FE0';
const EYE = '#0D1B2E';

/** Una piedrita redondeada, apenas asimétrica. */
const PEBBLE =
  'M24 52 C26 30 46 18 68 20 C92 22 104 40 102 62 C100 86 82 100 58 99 C34 98 22 78 24 52 Z';

/** Pausa aleatoria entre parpadeos, para que no se sienta mecánico. */
const nextBlinkDelay = () => 2800 + Math.random() * 2600;

/** Tiza, la mascota de Recreo: una piedrita azul con dos ojitos. */
export function Mascot({ mood = 'happy', size = 120, animated = true }: Props) {
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    if (!animated) return;
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timeout = setTimeout(() => {
        setBlinking(true);
        timeout = setTimeout(() => {
          setBlinking(false);
          schedule();
        }, 130);
      }, nextBlinkDelay());
    };
    schedule();
    return () => clearTimeout(timeout);
  }, [animated]);

  const eyeRy = blinking ? 1.2 : 8;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Defs>
          <LinearGradient id="tizaBody" x1="0.2" y1="0" x2="0.8" y2="1">
            <Stop offset="0" stopColor={BODY_LIGHT} />
            <Stop offset="0.55" stopColor={BODY_MID} />
            <Stop offset="1" stopColor={BODY_DARK} />
          </LinearGradient>
          <RadialGradient id="tizaShine" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor="#fff" stopOpacity={0.7} />
            <Stop offset="1" stopColor="#fff" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Sombra en el piso */}
        <Ellipse cx={62} cy={110} rx={28} ry={4.5} fill="#000" opacity={0.25} />

        {/* Cuerpo con brillo */}
        <Path d={PEBBLE} fill="url(#tizaBody)" />
        <Ellipse cx={48} cy={36} rx={18} ry={11} fill="url(#tizaShine)" transform="rotate(-20 48 36)" />

        {/* Ojos */}
        {mood === 'cheer' ? (
          <G stroke={EYE} strokeWidth={4.5} strokeLinecap="round" fill="none">
            <Path d="M47 64 Q52 56 57 64" />
            <Path d="M69 64 Q74 56 79 64" />
          </G>
        ) : mood === 'sad' ? (
          <G>
            <Ellipse cx={52} cy={67} rx={4.5} ry={blinking ? 1.2 : 6.5} fill={EYE} />
            <Ellipse cx={74} cy={67} rx={4.5} ry={blinking ? 1.2 : 6.5} fill={EYE} />
            <Path d="M52 77 Q48 83 52 86 Q56 83 52 77 Z" fill="#CDEBFF" />
          </G>
        ) : mood === 'think' ? (
          <G fill={EYE}>
            <Ellipse cx={58} cy={56} rx={4.5} ry={eyeRy} />
            <Ellipse cx={80} cy={56} rx={4.5} ry={eyeRy} />
          </G>
        ) : (
          <G fill={EYE}>
            <Ellipse cx={52} cy={62} rx={4.5} ry={eyeRy} />
            <Ellipse cx={74} cy={62} rx={4.5} ry={eyeRy} />
          </G>
        )}

        {/* Detalles según el ánimo */}
        {mood === 'cheer' && (
          <G fill={Colors.xp}>
            <Circle cx={16} cy={28} r={3} />
            <Circle cx={108} cy={22} r={2.5} />
            <Circle cx={10} cy={70} r={2} />
            <Circle cx={112} cy={74} r={2} />
          </G>
        )}
        {mood === 'think' && (
          <G fill={Colors.textSecondary}>
            <Circle cx={104} cy={18} r={3} />
            <Circle cx={112} cy={8} r={4.5} />
          </G>
        )}
      </Svg>
    </View>
  );
}
