import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize } from '../theme/colors';
import useAuthStore from '../store/authStore';

export default function PerfilScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: logout },
      ]
    );
  };

  const initial = user?.nombre?.charAt(0)?.toUpperCase() || 'U';

  return (
    <View style={styles.container}>
      <View style={styles.orb} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarBox}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.name}>{user?.nombre}</Text>
          <View style={styles.rolBadge}>
            <Text style={styles.rolText}>{user?.rol === 'admin' ? '👑 Administrador' : '🚴 Corredor'}</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Información Personal</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>✉️</Text>
            <View>
              <Text style={styles.infoLabel}>Correo Electrónico</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </View>

          {user?.telefono ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📱</Text>
              <View>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoValue}>{user.telefono}</Text>
              </View>
            </View>
          ) : null}

          {user?.direccion ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📍</Text>
              <View>
                <Text style={styles.infoLabel}>Dirección</Text>
                <Text style={styles.infoValue}>{user.direccion}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* App Info */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Acerca de</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🏷️</Text>
            <View>
              <Text style={styles.infoLabel}>Versión</Text>
              <Text style={styles.infoValue}>CycleRace Pro Mobile v1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  orb: {
    position: 'absolute', width: 280, height: 280, borderRadius: 999,
    backgroundColor: Colors.violet400, opacity: 0.08, top: -80, left: -80,
  },
  scroll: { padding: Spacing.xl, paddingBottom: 80 },
  avatarBox: { alignItems: 'center', marginBottom: Spacing.xxl, marginTop: Spacing.xl },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.orange500,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  avatarText: { color: Colors.white, fontSize: 32, fontWeight: '800' },
  name: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '800' },
  rolBadge: {
    marginTop: Spacing.sm, backgroundColor: Colors.bgElevated, borderRadius: Radius.full,
    paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: Colors.border,
  },
  rolText: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },
  infoCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.xl,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.xl,
  },
  sectionTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.lg },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  infoIcon: { fontSize: 20 },
  infoLabel: { color: Colors.textMuted, fontSize: FontSize.xs },
  infoValue: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '600', marginTop: 2 },
  logoutBtn: {
    borderWidth: 1, borderColor: Colors.rose400, borderRadius: Radius.sm,
    paddingVertical: 14, alignItems: 'center',
  },
  logoutText: { color: Colors.rose400, fontSize: FontSize.md, fontWeight: '700' },
});
