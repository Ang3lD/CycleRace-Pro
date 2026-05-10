import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize } from '../theme/colors';
import useAuthStore from '../store/authStore';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '', direccion: '',
    password: '', confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);

  const update = (key, val) => setForm({ ...form, [key]: val });

  const handleRegister = async () => {
    if (!form.nombre || !form.email || !form.password) {
      Alert.alert('Error', 'Nombre, correo y contraseña son requeridos');
      return;
    }
    if (form.password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      await register({
        nombre: form.nombre,
        email: form.email.trim(),
        password: form.password,
        telefono: form.telefono,
        direccion: form.direccion,
      });
    } catch (err) {
      Alert.alert('Error de registro', err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'nombre', label: 'Nombre Completo', icon: '👤', placeholder: 'Juan Pérez López', type: 'default' },
    { key: 'email', label: 'Correo Electrónico', icon: '✉️', placeholder: 'correo@ejemplo.com', type: 'email-address' },
    { key: 'telefono', label: 'Teléfono', icon: '📱', placeholder: '+52 555 123 4567', type: 'phone-pad' },
    { key: 'direccion', label: 'Dirección', icon: '📍', placeholder: 'Calle, Colonia, Ciudad', type: 'default' },
    { key: 'password', label: 'Contraseña', icon: '🔒', placeholder: 'Mínimo 8 caracteres', secure: true },
    { key: 'confirmPassword', label: 'Confirmar Contraseña', icon: '🔒', placeholder: 'Repite tu contraseña', secure: true },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.orb, styles.orbOne]} />
      <View style={[styles.orb, styles.orbTwo]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>🚴</Text>
            <Text style={styles.logoText}>CycleRace Pro</Text>
          </View>

          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>
            Regístrate para explorar y unirte a eventos de ciclismo
          </Text>

          <View style={styles.card}>
            {fields.map((f) => (
              <View key={f.key}>
                <Text style={styles.label}>{f.label}</Text>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputIcon}>{f.icon}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={f.placeholder}
                    placeholderTextColor={Colors.textMuted}
                    keyboardType={f.type || 'default'}
                    autoCapitalize={f.key === 'email' ? 'none' : 'sentences'}
                    secureTextEntry={f.secure || false}
                    value={form[f.key]}
                    onChangeText={(v) => update(f.key, v)}
                    editable={!loading}
                  />
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.btnText}>Crear Cuenta →</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.footer}>
              ¿Ya tienes cuenta?{' '}
              <Text style={styles.link}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.bg },
  orb: { position: 'absolute', borderRadius: 999, opacity: 0.15 },
  orbOne: { width: 260, height: 260, backgroundColor: Colors.orange500, top: -80, right: -60 },
  orbTwo: { width: 200, height: 200, backgroundColor: Colors.violet400, bottom: 60, left: -80 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
  },
  logoBox: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginBottom: Spacing.xl, gap: Spacing.sm },
  logoIcon: { fontSize: 32 },
  logoText: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, marginBottom: Spacing.xl },
  card: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border },
  label: { color: Colors.textSecondary, fontSize: FontSize.sm, marginBottom: Spacing.xs, marginTop: Spacing.lg },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md,
  },
  inputIcon: { fontSize: 16, marginRight: Spacing.sm },
  input: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.md, paddingVertical: Platform.OS === 'ios' ? 14 : 10 },
  btn: { backgroundColor: Colors.orange500, borderRadius: Radius.sm, paddingVertical: 14, alignItems: 'center', marginTop: Spacing.xl },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
  footer: { color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.xl, fontSize: FontSize.md },
  link: { color: Colors.orange400, fontWeight: '600' },
});
