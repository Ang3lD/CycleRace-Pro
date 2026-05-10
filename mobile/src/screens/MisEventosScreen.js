import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing, Radius, FontSize } from '../theme/colors';
import api from '../api/client';

const ESTADO_CONFIG = {
  validado: { emoji: '✅', color: Colors.emerald400, label: 'Validado' },
  pendiente: { emoji: '⏳', color: Colors.sky400, label: 'Pendiente' },
  rechazado: { emoji: '❌', color: Colors.rose400, label: 'Rechazado' },
};

const TIPO_EMOJI = {
  carrera: '🏆', paseo: '🚴', taller: '🔧',
  exhibicion: '👁️', tour: '🗺️', competencia: '⚡',
};

export default function MisEventosScreen({ navigation }) {
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/inscripciones/me');
      setInscripciones(res.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Reload every time screen is focused
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = () => { setRefreshing(true); load(); };

  const renderItem = ({ item }) => {
    const estado = ESTADO_CONFIG[item.estado] || ESTADO_CONFIG.pendiente;
    const tipoEmoji = TIPO_EMOJI[item.tipo_evento] || '🚴';

    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={styles.iconBox}>
            <Text style={{ fontSize: 22 }}>{tipoEmoji}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.cardTitle}>{item.evento_nombre}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaItem}>🏷️ {item.tipo_evento}</Text>
              {item.fecha_evento && (
                <Text style={styles.metaItem}>
                  📅 {new Date(item.fecha_evento).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              )}
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaItem}>📍 {item.ubicacion || 'Por confirmar'}</Text>
              <Text style={styles.metaItem}>💰 ${item.precio} MXN</Text>
            </View>
            <Text style={styles.inscDate}>
              Inscrito: {new Date(item.fecha_inscripcion).toLocaleDateString('es-MX')} • {item.metodo_pago}
            </Text>
          </View>
        </View>

        {/* Bottom row: estado + numero */}
        <View style={styles.cardBottom}>
          <View style={[styles.estadoBadge, { borderColor: estado.color }]}>
            <Text style={{ fontSize: 12 }}>{estado.emoji}</Text>
            <Text style={[styles.estadoText, { color: estado.color }]}>{estado.label}</Text>
          </View>

          {item.numero_competidor ? (
            <TouchableOpacity
              style={styles.qrBadge}
              onPress={() => navigation.navigate('MiQR', {
                numero: item.numero_competidor,
                evento: item.evento_nombre,
              })}
            >
              <Text style={{ fontSize: 18 }}>📱</Text>
              <Text style={styles.qrNumber}>#{String(item.numero_competidor).padStart(4, '0')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.orange500} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Inscripciones</Text>
        <Text style={styles.headerSub}>
          {inscripciones.length} evento{inscripciones.length !== 1 ? 's' : ''} •{' '}
          {inscripciones.filter((i) => i.estado === 'validado').length} validado{inscripciones.filter((i) => i.estado === 'validado').length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={inscripciones}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.orange500} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>🚲</Text>
            <Text style={styles.emptyTitle}>No tienes inscripciones aún</Text>
            <Text style={styles.emptyDesc}>Explora los eventos disponibles y participa.</Text>
            <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.navigate('EventosTab')}>
              <Text style={styles.exploreBtnText}>Explorar Eventos →</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md },
  headerTitle: { color: Colors.textPrimary, fontSize: FontSize.xxl, fontWeight: '800' },
  headerSub: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: Spacing.xs },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  card: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.lg,
    marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
  },
  cardRow: { flexDirection: 'row', gap: Spacing.md },
  iconBox: { width: 44, height: 44, borderRadius: Radius.sm, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  infoBox: { flex: 1 },
  cardTitle: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '700', marginBottom: 4 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: 2 },
  metaItem: { color: Colors.textMuted, fontSize: FontSize.xs },
  inscDate: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: Spacing.sm, fontStyle: 'italic' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border },
  estadoBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 6 },
  estadoText: { fontSize: FontSize.xs, fontWeight: '600' },
  qrBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.bgElevated, borderRadius: Radius.sm, paddingHorizontal: 12, paddingVertical: 8 },
  qrNumber: { color: Colors.emerald400, fontSize: FontSize.lg, fontWeight: '800' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '700', marginTop: Spacing.lg },
  emptyDesc: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: Spacing.sm },
  exploreBtn: { backgroundColor: Colors.orange500, borderRadius: Radius.sm, paddingVertical: 12, paddingHorizontal: 24, marginTop: Spacing.xl },
  exploreBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
});
