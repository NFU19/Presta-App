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
    View,
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
    backgroundColor: '#f0f4f8',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#dfe4ea',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2540',
  },
  placeholder: {
    width: 40,
  },
  productSection: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productDetails: {
    marginLeft: 12,
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A2540',
  },
  productCategory: {
    fontSize: 14,
    color: '#525f7f',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2540',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#525f7f',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dfe4ea',
    backgroundColor: '#f8f9fa',
  },
  selectedOption: {
    borderColor: '#007bff',
    backgroundColor: '#e7f3ff',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0A2540',
  },
  selectedOptionText: {
    color: '#007bff',
  },
  optionDescription: {
    fontSize: 12,
    color: '#525f7f',
    marginTop: 2,
  },
  selectedOptionDescription: {
    color: '#0066cc',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#dfe4ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#007bff',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007bff',
  },
  purposeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  purposeCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dfe4ea',
    backgroundColor: '#f8f9fa',
  },
  selectedPurpose: {
    borderColor: '#007bff',
    backgroundColor: '#e7f3ff',
  },
  purposeLabel: {
    fontSize: 12,
    color: '#525f7f',
    marginTop: 8,
    textAlign: 'center',
  },
  selectedPurposeText: {
    color: '#007bff',
    fontWeight: '500',
  },
  termsList: {
    gap: 12,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  termText: {
    fontSize: 14,
    color: '#525f7f',
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#dfe4ea',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoanRequestModal;