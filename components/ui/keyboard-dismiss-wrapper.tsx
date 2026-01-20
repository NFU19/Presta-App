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
 * Componente wrapper que cierra el teclado preservando gestos de navegación
 * Implementación que NO interfiere con swipes ni navegación
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

  // Si está deshabilitado o el teclado no está visible, devuelve View normal
  if (disabled || !isKeyboardVisible) {
    return <View style={[{ flex: 1 }, style]}>{children}</View>;
  }

  return (
    <TouchableWithoutFeedback 
      onPress={dismissKeyboard}
      accessible={false}
      style={{ flex: 1 }}
    >
      <View style={[{ flex: 1 }, style]}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default KeyboardDismissWrapper;