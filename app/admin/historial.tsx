import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

const mockEventos = [
  {
    id: 'TX-001',
    usuario: 'Juan Pérez',
    equipo: 'Laptop Dell XPS 13',
    fecha: '2026-02-10 10:30',
    tipo: 'Préstamo',
    estado: 'aprobado',
  },
  {
    id: 'TX-002',
    usuario: 'María García',
    equipo: 'Proyector Epson',
    fecha: '2026-02-10 12:15',
    tipo: 'Préstamo',
    estado: 'pendiente',
  },
  {
    id: 'TX-003',
    usuario: 'Carlos López',
    equipo: 'Cámara Canon EOS',
    fecha: '2026-02-09 18:05',
    tipo: 'Devolución',
    estado: 'devuelto',
  },
  {
    id: 'TX-004',
    usuario: 'Ana Torres',
    equipo: 'Tablet iPad Air',
    fecha: '2026-02-08 09:50',
    tipo: 'Préstamo',
    estado: 'rechazado',
  },
];

const badgeStyles: Record<string, { bg: string; text: string; border: string }> = {
  aprobado: { bg: 'rgba(16,185,129,0.12)', text: '#0f5132', border: 'rgba(16,185,129,0.32)' },
  pendiente: { bg: 'rgba(251,191,36,0.16)', text: '#8a6500', border: 'rgba(251,191,36,0.32)' },
  devuelto: { bg: 'rgba(107,114,128,0.14)', text: '#374151', border: 'rgba(107,114,128,0.3)' },
  rechazado: { bg: 'rgba(239,68,68,0.14)', text: '#991b1b', border: 'rgba(239,68,68,0.3)' },
};

const tipoIcon: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  'Préstamo': { name: 'arrow-down-circle', color: '#0A66FF' },
  'Devolución': { name: 'arrow-up-circle', color: '#16a34a' },
  'Rechazo': { name: 'close-circle', color: '#dc2626' },
};

const HistorialScreen = () => {
  const data = useMemo(() => mockEventos, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, gap: 16 }}>
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name="time" size={24} color={Colors.light.primary} />
          <Text style={styles.title}>Historial de Movimientos</Text>
        </View>
        <Text style={styles.subtitle}>Registro inmutable de eventos clave (RF-9)</Text>
      </View>

      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 1.1 }]}>ID Transacción</Text>
          <Text style={[styles.th, { flex: 1.1 }]}>Usuario</Text>
          <Text style={[styles.th, { flex: 1.3 }]}>Equipo</Text>
          <Text style={[styles.th, { flex: 1 }]}>Fecha</Text>
          <Text style={[styles.th, { flex: 1 }]}>Tipo de Evento</Text>
          <Text style={[styles.th, { flex: 0.9, textAlign: 'right' }]}>Estado</Text>
        </View>

        {data.map((item) => {
          const badge = badgeStyles[item.estado] || badgeStyles.pendiente;
          const iconMeta = tipoIcon[item.tipo] || tipoIcon['Préstamo'];
          return (
            <View key={item.id} style={styles.tr}>
              <Text style={[styles.td, { flex: 1.1, fontWeight: '700', color: '#0A2540' }]}>{item.id}</Text>
              <Text style={[styles.td, { flex: 1.1 }]} numberOfLines={1}>{item.usuario}</Text>
              <Text style={[styles.td, { flex: 1.3 }]} numberOfLines={1}>{item.equipo}</Text>
              <Text style={[styles.td, { flex: 1 }]}>{item.fecha}</Text>
              <View style={[styles.tdInline, { flex: 1 }]}>
                <Ionicons name={iconMeta.name} size={16} color={iconMeta.color} style={{ marginRight: 6 }} />
                <Text style={styles.td}>{item.tipo}</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: badge.bg, borderColor: badge.border, flex: 0.9, justifyContent: 'flex-end' }]}>
                <Text style={[styles.statusText, { color: badge.text }]}>{item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fb' },
  headerRow: { gap: 6 },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0A2540',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 14,
    marginLeft: 34,
  },
  tableCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e6edf5',
    ...Platform.select({
      web: { boxShadow: '0 16px 36px rgba(10,37,64,0.08)' },
      default: {
        shadowColor: '#0A2540',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
      },
    }),
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e6edf5',
    backgroundColor: '#f7f9fc',
  },
  th: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f6',
    gap: 6,
  },
  td: {
    fontSize: 14,
    color: '#1f2937',
  },
  tdInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

export default HistorialScreen;
