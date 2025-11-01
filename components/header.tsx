import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface HeaderProps {
  showBackButton?: boolean;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  children?: React.ReactNode;
}

export const Header = ({ onMenuPress, showBackButton, onBackPress, children }: HeaderProps) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity 
        onPress={showBackButton ? onBackPress : onMenuPress} 
        style={styles.menuButton}
      >
        <Ionicons 
          name={showBackButton ? 'arrow-back-outline' : 'menu-outline'}
          size={28} 
          color={Colors.light.primary} 
        />
      </TouchableOpacity>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundAlt,
  },
});