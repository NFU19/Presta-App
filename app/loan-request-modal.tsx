import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const LoanRequestModal = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedDuration, setSelectedDuration] = useState('7');
  const [selectedPurpose, setSelectedPurpose] = useState('');
  
  const product = {
    nombre: params.nombre as string,
    categoria: params.categoria as string,
  };

  const durationOptions = [
    { value: '1', label: '1 día', description: 'Uso puntual' },
    { value: '3', label: '3 días', description: 'Proyecto corto' },
    { value: '7', label: '7 días', description: 'Proyecto semanal' },
    { value: '14', label: '14 días', description: 'Proyecto extenso' },
  ];

  const purposeOptions = [
    { value: 'academic', label: 'Académico', icon: 'school-outline' },
    { value: 'research', label: 'Investigación', icon: 'search-outline' },
    { value: 'project', label: 'Proyecto', icon: 'construct-outline' },
    { value: 'presentation', label: 'Presentación', icon: 'easel-outline' },
    { value: 'other', label: 'Otro', icon: 'ellipsis-horizontal-outline' },
  ];

  const handleSubmitRequest = () => {
    if (!selectedPurpose) {
      Alert.alert('Error', 'Por favor selecciona el propósito del préstamo');
      return;
    }

    Alert.alert(
      'Solicitud Enviada',
      `Tu solicitud para ${product.nombre} por ${selectedDuration} día(s) ha sido enviada.\n\nRecibirás una notificación cuando sea revisada.`,
      [
        {
          text: 'Entendido',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={24} color="#0A2540" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Solicitar Préstamo</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Product Info */}
        <View style={styles.productSection}>
          <View style={styles.productInfo}>
            <Ionicons name="cube-outline" size={24} color="#007bff" />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{product.nombre}</Text>
              <Text style={styles.productCategory}>{product.categoria}</Text>
            </View>
          </View>
        </View>

        {/* Duration Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duración del Préstamo</Text>
          <Text style={styles.sectionSubtitle}>¿Por cuánto tiempo necesitas el equipo?</Text>
          
          <View style={styles.optionsContainer}>
            {durationOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  selectedDuration === option.value && styles.selectedOption,
                ]}
                onPress={() => setSelectedDuration(option.value)}
              >
                <View style={styles.optionContent}>
                  <Text style={[
                    styles.optionLabel,
                    selectedDuration === option.value && styles.selectedOptionText,
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={[
                    styles.optionDescription,
                    selectedDuration === option.value && styles.selectedOptionDescription,
                  ]}>
                    {option.description}
                  </Text>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedDuration === option.value && styles.radioButtonSelected,
                ]}>
                  {selectedDuration === option.value && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Purpose Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Propósito del Préstamo</Text>
          <Text style={styles.sectionSubtitle}>¿Para qué vas a usar el equipo?</Text>
          
          <View style={styles.purposeGrid}>
            {purposeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.purposeCard,
                  selectedPurpose === option.value && styles.selectedPurpose,
                ]}
                onPress={() => setSelectedPurpose(option.value)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={selectedPurpose === option.value ? '#007bff' : '#525f7f'}
                />
                <Text style={[
                  styles.purposeLabel,
                  selectedPurpose === option.value && styles.selectedPurposeText,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Términos y Condiciones</Text>
          <View style={styles.termsList}>
            <View style={styles.termItem}>
              <Ionicons name="checkmark-circle" size={16} color="#28a745" />
              <Text style={styles.termText}>
                Devolver el equipo en las mismas condiciones
              </Text>
            </View>
            <View style={styles.termItem}>
              <Ionicons name="checkmark-circle" size={16} color="#28a745" />
              <Text style={styles.termText}>
                Respetar el tiempo máximo de préstamo
              </Text>
            </View>
            <View style={styles.termItem}>
              <Ionicons name="checkmark-circle" size={16} color="#28a745" />
              <Text style={styles.termText}>
                Reportar cualquier daño inmediatamente
              </Text>
            </View>
            <View style={styles.termItem}>
              <Ionicons name="checkmark-circle" size={16} color="#28a745" />
              <Text style={styles.termText}>
                Usar el equipo solo para fines académicos
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedPurpose || !selectedDuration) && styles.disabledButton,
          ]}
          onPress={handleSubmitRequest}
          disabled={!selectedPurpose || !selectedDuration}
        >
          <Ionicons name="send" size={20} color="#fff" />
          <Text style={styles.submitButtonText}>Enviar Solicitud</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundAlt,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.primary,
    letterSpacing: -0.5,
  },
  placeholder: {
    width: 40,
  },
  productSection: {
    backgroundColor: Colors.light.background,
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productDetails: {
    marginLeft: 16,
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 15,
    color: Colors.light.gray,
    fontWeight: '500',
  },
  section: {
    backgroundColor: Colors.light.background,
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: Colors.light.gray,
    marginBottom: 20,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.backgroundAlt,
  },
  selectedOption: {
    borderColor: Colors.light.secondary,
    backgroundColor: Colors.light.accent,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textDark,
  },
  selectedOptionText: {
    color: Colors.light.secondary,
  },
  optionDescription: {
    fontSize: 13,
    color: Colors.light.gray,
    marginTop: 4,
    lineHeight: 18,
  },
  selectedOptionDescription: {
    color: Colors.light.secondary,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: Colors.light.secondary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.secondary,
  },
  purposeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  purposeCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.backgroundAlt,
  },
  selectedPurpose: {
    borderColor: Colors.light.secondary,
    backgroundColor: Colors.light.accent,
  },
  purposeLabel: {
    fontSize: 14,
    color: Colors.light.textDark,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedPurposeText: {
    color: Colors.light.secondary,
    fontWeight: '600',
  },
  termsList: {
    gap: 16,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  termText: {
    fontSize: 14,
    color: Colors.light.gray,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.secondary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: Colors.light.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: Colors.light.gray,
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default LoanRequestModal;