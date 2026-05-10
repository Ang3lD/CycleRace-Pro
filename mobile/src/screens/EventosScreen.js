import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize } from '../theme/colors';
import api from '../api/client';

const TIPO_EMOJI = {
  carrera: '🏆',
  paseo: '🚴',
  taller: '🔧',
  exhibicion: '👁️',
  tour: '🗺️',
  competencia: '⚡',
};

export default function EventosScreen({ navigation }) {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [enrolledIds, setEnrolledIds] = useState(new Set());

  const loadData = useCallback(async () => {
    try {
      const [evRes, insRes] = await Promise.all([
        api.get('/api/eventos'),
        api.get('/api/inscripciones/me').catch(() => ({ data: [] })),
      ]);
      setEventos(evRes.data);
      setEnrolledIds(new Set(insRes.data.map((i) => i.evento_id)));
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los eventos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const filtered = eventos.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.nombre?.toLowerCase().includes(q) ||
      e.ubicacion?.toLowerCase().includes(q) ||
      e.descripcion?.toLowerCase().includes(q)
    );
  });

  const renderEvento = ({ item }) => {
    const emoji = TIPO_EMOJI[item.tipo_evento] || '🚴';
    const isEnrolled = enrolledIds.has(item.id);
    const cuposRestantes = item.cupo_maximo - (item.inscritos || 0);
    const pct = Math.min(100, Math.round(((item.inscritos || 0) / item.cupo_maximo) * 100));

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('EventoDetalle', { evento: item, isEnrolled })}
      >
        {/* Header row */}
        <View style={styles.cardHeader}>
          <View style={styles.tipoBadge}>
            <Text style={styles.tipoEmoji}>{emoji}</Text>
            <Text style={styles.tipoLabel}>{item.tipo_evento}</Text>
          </View>
          <View style={styles.precioBox}>
            <Text style={styles.precioVal}>${item.precio}</Text>
            <Text style={styles.precioCur}>MXN</Text>
          </View>
        </View>

        <Text style={styles.cardTitle}>{item.nombre}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.descripcion}</Text>

        {/* Meta */}
        <View style={styles.metaRow}>
          <Text style={styles.metaItem}>📅 {new Date(item.fecha_evento).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</Text>
          <Text style={styles.metaItem}>📍 {item.ubicacion}</Text>
          {item.distancia_km ? <Text style={styles.metaItem}>🛣️ {item.distancia_km} km</Text> : null}
        </View>

        {/* Capacity bar */}
        <View style={styles.capacityRow}>
          <Text style={styles.capacityText}>{cuposRestantes} cupos</Text>
          <Text style={styles.capacityPct}>{pct}%</Text>
        </View>
        <View style={styles.barBg}>
          <View style={[
            styles.barFill,
            { width: `${pct}%`, backgroundColor: pct > 80 ? Colors.rose400 : pct > 50 ? Colors.orange500 : Colors.emerald400 },
          ]} />
        </View>

        {/* CTA */}
        <View style={styles.cardFooter}>
          {isEnrolled ? (
            <View style={styles.enrolledBadge}>
              <Text style={styles.enrolledText}>✅ Ya inscrito</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.inscribirBtn}
              onPress={() => navigation.navigate('Pago', { evento: item })}
            >
              <Text style={styles.inscribirText}>Inscribirse →</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
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
        <Text style={styles.headerBadge}>🚴 Todos los Eventos</Text>
        <Text style={styles.headerTitle}>Explora Eventos</Text>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar eventos..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        renderItem={renderEvento}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.orange500} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>🚲</Text>
            <Text style={styles.emptyTitle}>No se encontraron eventos</Text>
            <Text style={styles.emptyDesc}>Intenta con otro término de búsqueda.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  headerBadge: { color: Colors.orange400, fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.xs },
  headerTitle: { color: Colors.textPrimary, fontSize: FontSize.xxl, fontWeight: '800' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', margin: Spacing.xl,
    backgroundColor: Colors.bgCard, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: { fontSize: 16, marginRight: Spacing.sm },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.md, paddingVertical: 12 },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  card: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.lg,
    marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  tipoBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tipoEmoji: { fontSize: 16 },
  tipoLabel: { color: Colors.orange400, fontSize: FontSize.sm, fontWeight: '600', textTransform: 'capitalize' },
  precioBox: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  precioVal: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '800' },
  precioCur: { color: Colors.textMuted, fontSize: FontSize.xs },
  cardTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '700', marginBottom: 4 },
  cardDesc: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.md },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.md },
  metaItem: { color: Colors.textMuted, fontSize: FontSize.xs },
  capacityRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  capacityText: { color: Colors.textMuted, fontSize: FontSize.xs },
  capacityPct: { color: Colors.textMuted, fontSize: FontSize.xs },
  barBg: { height: 4, backgroundColor: Colors.bgGlass, borderRadius: 2, marginBottom: Spacing.md },
  barFill: { height: 4, borderRadius: 2 },
  cardFooter: { alignItems: 'flex-end' },
  inscribirBtn: { backgroundColor: Colors.orange500, borderRadius: Radius.sm, paddingVertical: 10, paddingHorizontal: 20 },
  inscribirText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },
  enrolledBadge: {
    backgroundColor: 'rgba(52,211,153,0.12)', borderRadius: Radius.sm, paddingVertical: 10, paddingHorizontal: 20,
    borderWidth: 1, borderColor: Colors.emerald400,
  },
  enrolledText: { color: Colors.emerald400, fontWeight: '600', fontSize: FontSize.sm },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '700', marginTop: Spacing.lg },
  emptyDesc: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: Spacing.sm },
});
