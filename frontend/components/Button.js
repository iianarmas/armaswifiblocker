import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) {
  const buttonStyles = [
    styles.button,
    styles[variant],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#1a73e8'} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primary: {
    backgroundColor: '#1a73e8',
  },
  primaryText: {
    color: '#fff',
  },
  secondary: {
    backgroundColor: '#e8f0fe',
  },
  secondaryText: {
    color: '#1a73e8',
  },
  danger: {
    backgroundColor: '#dc3545',
  },
  dangerText: {
    color: '#fff',
  },
  success: {
    backgroundColor: '#28a745',
  },
  successText: {
    color: '#fff',
  },
  disabled: {
    opacity: 0.5,
  },
});
