import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize } from '../theme/colors';

export default function EventoDetalleScreen({ route, navigation }) {
  const { evento, isEnrolled } = route.params;
  const diasFaltantes = Math.max(0, Math.ceil((new Date(evento.fecha_evento) - new Date()) / (1000 * 60 * 60 * 24)));

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>{evento.nombre}</Text>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.desc}>{evento.descripcion}</Text>
        </View>

        {/* Info Grid */}
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Fecha y Hora</Text>
            <Text style={styles.gridValue}>
              📅 {new Date(evento.fecha_evento).toLocaleDateString('es-MX')} {evento.hora_inicio?.slice(0, 5) || '08:00'}
            </Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Faltan</Text>
            <Text style={styles.gridValue}>⏱️ {diasFaltantes} días</Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.infoRow}>
          <Text style={styles.gridLabel}>Ubicación</Text>
          <Text style={styles.gridValue}>📍 {evento.lugar || evento.ubicacion}</Text>
        </View>

        {/* Price & Capacity */}
        <View style={styles.grid}>
          <View style={[styles.gridItem, styles.gridItemCenter]}>
            <Text style={styles.gridLabel}>Precio</Text>
            <Text style={styles.priceVal}>${evento.precio} MXN</Text>
          </View>
          <View style={[styles.gridItem, styles.gridItemCenter]}>
            <Text style={styles.gridLabel}>Cupo</Text>
            <Text style={styles.priceVal}>{evento.cupo_maximo}</Text>
          </View>
        </View>

        {/* Extra Info */}
        <View style={styles.grid}>
          {evento.distancia_km ? (
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Distancia</Text>
              <Text style={styles.gridValue}>🛣️ {evento.distancia_km} km</Text>
            </View>
          ) : null}
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Categoría</Text>
            <Text style={[styles.gridValue, { textTransform: 'capitalize' }]}>🏷️ {evento.categoria}</Text>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          {isEnrolled ? (
            <View style={styles.enrolledBox}>
              <Text style={styles.enrolledLabel}>✅ Ya estás inscrito</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.ctaBtn}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Pago', { evento })}
            >
              <Text style={styles.ctaBtnText}>Inscribirse Ahora →</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.xl, paddingBottom: 80 },
  backBtn: { marginBottom: Spacing.lg },
  backText: { color: Colors.orange400, fontSize: FontSize.md, fontWeight: '600' },
  title: { color: Colors.textPrimary, fontSize: FontSize.xxl, fontWeight: '800', marginBottom: Spacing.lg },
  section: {
    backgroundColor: Colors.bgElevated, borderRadius: Radius.md, padding: Spacing.lg, marginBottom: Spacing.lg,
  },
  desc: { color: Colors.textSecondary, fontSize: FontSize.md, lineHeight: 24 },
  grid: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  gridItem: {
    flex: 1, backgroundColor: Colors.bgElevated, borderRadius: Radius.md, padding: Spacing.md,
  },
  gridItemCenter: { alignItems: 'center' },
  gridLabel: { color: Colors.textMuted, fontSize: FontSize.xs, marginBottom: Spacing.xs },
  gridValue: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '700' },
  priceVal: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '800' },
  infoRow: {
    backgroundColor: Colors.bgElevated, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg,
  },
  ctaSection: { marginTop: Spacing.lg },
  ctaBtn: {
    backgroundColor: Colors.orange500, borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center',
  },
  ctaBtnText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
  enrolledBox: {
    backgroundColor: 'rgba(52,211,153,0.1)', borderColor: Colors.emerald400, borderWidth: 1,
    borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center',
  },
  enrolledLabel: { color: Colors.emerald400, fontSize: FontSize.lg, fontWeight: '700' },
});
