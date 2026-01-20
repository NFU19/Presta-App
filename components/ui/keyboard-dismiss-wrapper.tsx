import React from 'react';
import {
  Keyboard,
  TouchableWithoutFeedback,
  StyleProp,
  ViewStyle,
  View,
} from 'react-native';
import { useKeyboard } from '@/hooks/use-keyboard';

interface KeyboardDismissWrapperProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

/**
 * Componente wrapper que cierra el teclado cuando se toca fuera de los inputs
 * Solo actúa cuando el teclado está visible para no interferir con navegación
 * Útil para mejorar la experiencia de usuario en formularios
 */
export const KeyboardDismissWrapper: React.FC<KeyboardDismissWrapperProps> = ({
  children,
  style,
  disabled = false,
}) => {
  const { isKeyboardVisible } = useKeyboard();
  
  const dismissKeyboard = () => {
    if (!disabled && isKeyboardVisible) {
      Keyboard.dismiss();
    }
  };

  // Si el teclado no está visible, devolvemos solo el View sin TouchableWithoutFeedback
  // para no interferir con gestos de navegación
  if (!isKeyboardVisible) {
    return <View style={[{ flex: 1 }, style]}>{children}</View>;
  }

  return (
    <TouchableWithoutFeedback 
      onPress={dismissKeyboard}
      accessible={false}
    >
      <View style={[{ flex: 1 }, style]}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default KeyboardDismissWrapper;