import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize } from '../theme/colors';
import useAuthStore from '../store/authStore';
import api from '../api/client';

export default function PagoScreen({ route, navigation }) {
  const { evento } = route.params;
  const user = useAuthStore((s) => s.user);

  const [form, setForm] = useState({
    cardName: user?.nombre || '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txId, setTxId] = useState('');
  const [inscData, setInscData] = useState(null);

  const handlePayment = async () => {
    if (!form.cardName || !form.cardNumber || !form.expiry || !form.cvv) {
      Alert.alert('Error', 'Completa todos los campos de pago');
      return;
    }
    setPaying(true);

    // Simulated 2-second payment processing (mirrors web PaymentPage)
    setTimeout(async () => {
      try {
        const res = await api.post('/api/inscripciones', {
          evento_id: evento.id,
          metodo_pago: 'Tarjeta de Crédito',
          monto: evento.precio,
        });
        const tx = `TRX-${Date.now().toString(36).toUpperCase()}`;
        setTxId(tx);
        setInscData(res.data);
        setSuccess(true);
      } catch (err) {
        Alert.alert('Error', err.response?.data?.error || 'Error al procesar el pago');
        setPaying(false);
      }
    }, 2000);
  };

  // ---- Success View ----
  if (success) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.successScroll}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>¡Pago Exitoso!</Text>
          <Text style={styles.successSub}>
            Tu inscripción a <Text style={{ fontWeight: '800' }}>{evento.nombre}</Text> ha sido procesada.
          </Text>

          <View style={styles.receiptCard}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Monto Pagado:</Text>
              <Text style={styles.receiptVal}>${evento.precio} MXN</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Folio:</Text>
              <Text style={styles.receiptVal}>{txId}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Estado:</Text>
              <Text style={[styles.receiptVal, { color: Colors.sky400 }]}>Pendiente de validación</Text>
            </View>
            {inscData?.numero_competidor && (
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>No. Competidor:</Text>
                <Text style={[styles.receiptVal, { color: Colors.emerald400 }]}>
                  #{String(inscData.numero_competidor).padStart(4, '0')}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('MisEventos')}>
            <Text style={styles.primaryBtnText}>Ver Mis Eventos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('EventosTab')}>
            <Text style={styles.secondaryBtnText}>Explorar más eventos</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ---- Payment Form ----
  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Volver a eventos</Text>
          </TouchableOpacity>

          {/* Event Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Resumen del Evento</Text>
            <View style={styles.eventInfoRow}>
              <Text style={{ fontSize: 24 }}>🚴</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventName}>{evento.nombre}</Text>
                <Text style={styles.eventType}>{evento.tipo_evento}</Text>
              </View>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaItem}>📅 {new Date(evento.fecha_evento).toLocaleDateString('es-MX')}</Text>
              <Text style={styles.metaItem}>📍 {evento.ubicacion}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Inscripción</Text>
              <Text style={styles.priceValue}>${evento.precio}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Cargos por servicio</Text>
              <Text style={styles.priceValue}>$0.00</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total a Pagar</Text>
              <Text style={styles.totalValue}>${evento.precio} MXN</Text>
            </View>
            <View style={styles.securityNote}>
              <Text style={styles.securityText}>🛡️ Pago seguro — CycleRace Pro Pay</Text>
            </View>
          </View>

          {/* Payment Card */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Método de Pago</Text>
            <Text style={styles.cardIcons}>💳  👛</Text>

            <Text style={styles.label}>Titular de la Tarjeta</Text>
            <TextInput style={styles.input} value={form.cardName} onChangeText={(v) => setForm({ ...form, cardName: v })} placeholderTextColor={Colors.textMuted} editable={!paying} />

            <Text style={styles.label}>Número de Tarjeta</Text>
            <TextInput style={styles.input} placeholder="0000 0000 0000 0000" placeholderTextColor={Colors.textMuted} keyboardType="number-pad" maxLength={19} value={form.cardNumber} onChangeText={(v) => setForm({ ...form, cardNumber: v })} editable={!paying} />

            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Vencimiento</Text>
                <TextInput style={styles.input} placeholder="MM/YY" placeholderTextColor={Colors.textMuted} maxLength={5} value={form.expiry} onChangeText={(v) => setForm({ ...form, expiry: v })} editable={!paying} />
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={styles.label}>CVV</Text>
                <TextInput style={styles.input} placeholder="123" placeholderTextColor={Colors.textMuted} keyboardType="number-pad" maxLength={4} secureTextEntry value={form.cvv} onChangeText={(v) => setForm({ ...form, cvv: v })} editable={!paying} />
              </View>
            </View>

            <TouchableOpacity style={[styles.payBtn, paying && { opacity: 0.6 }]} onPress={handlePayment} disabled={paying} activeOpacity={0.8}>
              {paying ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.payBtnText}>Pagar ${evento.precio} MXN</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.terms}>
              Al hacer clic en pagar, aceptas los términos y condiciones de inscripción al evento.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.xl, paddingBottom: 80 },
  successScroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  backText: { color: Colors.orange400, fontSize: FontSize.md, fontWeight: '600', marginBottom: Spacing.xl },
  // Summary
  summaryCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.xl },
  sectionTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.lg },
  eventInfoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  eventName: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '700' },
  eventType: { color: Colors.textMuted, fontSize: FontSize.sm, textTransform: 'capitalize' },
  metaRow: { flexDirection: 'row', gap: Spacing.xl, marginBottom: Spacing.md },
  metaItem: { color: Colors.textMuted, fontSize: FontSize.sm },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.lg },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  priceLabel: { color: Colors.textSecondary, fontSize: FontSize.md },
  priceValue: { color: Colors.textPrimary, fontSize: FontSize.md },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.orange500, paddingTop: Spacing.md, marginTop: Spacing.sm },
  totalLabel: { color: Colors.orange400, fontSize: FontSize.lg, fontWeight: '700' },
  totalValue: { color: Colors.orange400, fontSize: FontSize.lg, fontWeight: '800' },
  securityNote: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.lg },
  securityText: { color: Colors.textMuted, fontSize: FontSize.xs },
  // Form
  formCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border },
  cardIcons: { fontSize: 24, marginBottom: Spacing.md },
  label: { color: Colors.textSecondary, fontSize: FontSize.sm, marginBottom: Spacing.xs, marginTop: Spacing.md },
  input: { backgroundColor: Colors.bgElevated, color: Colors.textPrimary, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: Platform.OS === 'ios' ? 14 : 10, fontSize: FontSize.md },
  rowInputs: { flexDirection: 'row' },
  payBtn: { backgroundColor: Colors.orange500, borderRadius: Radius.sm, paddingVertical: 16, alignItems: 'center', marginTop: Spacing.xl },
  payBtnText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
  terms: { color: Colors.textMuted, fontSize: FontSize.xs, textAlign: 'center', marginTop: Spacing.md },
  // Success
  successIcon: { fontSize: 64, marginBottom: Spacing.xl },
  successTitle: { color: Colors.textPrimary, fontSize: FontSize.xxl, fontWeight: '800', marginBottom: Spacing.md },
  successSub: { color: Colors.textSecondary, fontSize: FontSize.md, textAlign: 'center', marginBottom: Spacing.xl },
  receiptCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border, width: '100%', marginBottom: Spacing.xl },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  receiptLabel: { color: Colors.textSecondary, fontSize: FontSize.md },
  receiptVal: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '700' },
  primaryBtn: { backgroundColor: Colors.orange500, borderRadius: Radius.sm, paddingVertical: 14, paddingHorizontal: 40, marginBottom: Spacing.md },
  primaryBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
  secondaryBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, paddingVertical: 14, paddingHorizontal: 40 },
  secondaryBtnText: { color: Colors.textSecondary, fontSize: FontSize.md, fontWeight: '600' },
});
