import React from 'react';
import {
  View, Text, StyleSheet, Dimensions,
} from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { Colors, Spacing, Radius, FontSize } from '../theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

/**
 * Simple QR-like visual using SVG grid.
 * In production, swap this with `react-native-qrcode-svg` for real QR encoding.
 */
function SimpleQRGrid({ data, size = 200 }) {
  const gridSize = 11;
  const cellSize = size / gridSize;

  // Deterministic pattern from data string
  const cells = [];
  const seed = data.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      // Fixed corners (finder patterns)
      const isCorner =
        (row < 3 && col < 3) ||
        (row < 3 && col >= gridSize - 3) ||
        (row >= gridSize - 3 && col < 3);
      const hash = (seed * (row + 1) * (col + 1) + row * 7 + col * 13) % 100;
      const filled = isCorner || hash < 40;

      if (filled) {
        cells.push(
          <Rect
            key={`${row}-${col}`}
            x={col * cellSize}
            y={row * cellSize}
            width={cellSize - 1}
            height={cellSize - 1}
            fill={Colors.textPrimary}
            rx={1}
          />
        );
      }
    }
  }

  return (
    <Svg width={size} height={size}>
      {cells}
    </Svg>
  );
}

export default function MiQRScreen({ route }) {
  const { numero, evento } = route.params;
  const formattedNum = `#${String(numero).padStart(4, '0')}`;

  return (
    <View style={styles.container}>
      <View style={styles.orb} />

      <Text style={styles.title}>Tu Número de Competidor</Text>
      <Text style={styles.evento}>{evento}</Text>

      {/* QR Card */}
      <View style={styles.qrCard}>
        <View style={styles.qrBox}>
          <SimpleQRGrid data={`CYCLERACE-${numero}-${evento}`} size={SCREEN_WIDTH * 0.55} />
        </View>

        <Text style={styles.numero}>{formattedNum}</Text>
        <Text style={styles.instrucciones}>
          Presenta este código QR el día del evento para ser escaneado en el punto de registro.
        </Text>
      </View>

      {/* Badge */}
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>✅ Inscripción Validada</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: Colors.bg, alignItems: 'center',
    justifyContent: 'center', padding: Spacing.xl,
  },
  orb: {
    position: 'absolute', width: 300, height: 300, borderRadius: 999,
    backgroundColor: Colors.orange500, opacity: 0.08, top: -60, right: -60,
  },
  title: {
    color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '800', marginBottom: Spacing.sm,
  },
  evento: {
    color: Colors.textMuted, fontSize: FontSize.md, marginBottom: Spacing.xxl,
  },
  qrCard: {
    backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.xxl,
    alignItems: 'center', width: '100%', maxWidth: 340,
  },
  qrBox: {
    padding: Spacing.lg, backgroundColor: Colors.white, borderRadius: Radius.md,
    marginBottom: Spacing.lg,
  },
  numero: {
    color: Colors.black, fontSize: 42, fontWeight: '900', marginBottom: Spacing.md,
  },
  instrucciones: {
    color: '#555', fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20,
  },
  statusBadge: {
    marginTop: Spacing.xxl, backgroundColor: 'rgba(52,211,153,0.15)',
    borderRadius: Radius.full, paddingVertical: 10, paddingHorizontal: 24,
    borderWidth: 1, borderColor: Colors.emerald400,
  },
  statusText: {
    color: Colors.emerald400, fontSize: FontSize.md, fontWeight: '700',
  },
});
