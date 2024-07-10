import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomCheckBox = ({ value, onValueChange, disabled }) => {
  return (
    <TouchableOpacity
      style={[
        styles.checkBoxBase,
        value && styles.checkBoxChecked,
        disabled && styles.checkBoxDisabled,
      ]}
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
    >
      {value && <Ionicons name='checkmark' size={16} color='white' />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkBoxBase: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 8,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBoxChecked: {
    backgroundColor: '#4CAF50',
  },
  checkBoxDisabled: {
    borderColor: '#cccccc',
    backgroundColor: '#e6e6e6',
  },
});

export default CustomCheckBox;
