import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';

interface NavigationFriendlyWrapperProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Wrapper simple que no interfiere con ningún gesto de navegación
 * Usa solo ScrollView keyboardDismissMode para manejar el teclado
 */
export const NavigationFriendlyWrapper: React.FC<NavigationFriendlyWrapperProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[{ flex: 1 }, style]} pointerEvents="box-none">
      {children}
    </View>
  );
};

export default NavigationFriendlyWrapper;