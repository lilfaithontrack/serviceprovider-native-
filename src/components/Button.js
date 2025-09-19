import  React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';

export default function Button({ title, onPress, style ,disabled }) {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress} disabled={disabled}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
    button: {
        backgroundColor: '#0044FFFF',
        borderRadius: 4,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});