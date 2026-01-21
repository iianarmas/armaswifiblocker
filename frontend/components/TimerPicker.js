import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Button from './Button';

const PRESETS = [
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '2 hours', minutes: 120 },
];

export default function TimerPicker({ onSelect, disabled = false }) {
  const [customMinutes, setCustomMinutes] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handlePresetPress = (minutes) => {
    if (!disabled) {
      onSelect(minutes);
    }
  };

  const handleCustomSubmit = () => {
    const minutes = parseInt(customMinutes, 10);
    if (!isNaN(minutes) && minutes > 0 && !disabled) {
      onSelect(minutes);
      setCustomMinutes('');
      setShowCustom(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Set time limit:</Text>

      <View style={styles.presets}>
        {PRESETS.map((preset) => (
          <Button
            key={preset.minutes}
            title={preset.label}
            variant="secondary"
            onPress={() => handlePresetPress(preset.minutes)}
            disabled={disabled}
            style={styles.presetButton}
          />
        ))}
      </View>

      {!showCustom ? (
        <Button
          title="Custom time"
          variant="secondary"
          onPress={() => setShowCustom(true)}
          disabled={disabled}
          style={styles.customToggle}
        />
      ) : (
        <View style={styles.customInput}>
          <TextInput
            style={styles.input}
            placeholder="Minutes"
            keyboardType="numeric"
            value={customMinutes}
            onChangeText={(text) => setCustomMinutes(text.replace(/[^0-9]/g, ''))}
            editable={!disabled}
            maxLength={4}
          />
          <Button
            title="Set"
            onPress={handleCustomSubmit}
            disabled={disabled || !customMinutes}
            style={styles.setButton}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    color: '#5f6368',
    marginBottom: 12,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 40,
  },
  customToggle: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  customInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  setButton: {
    paddingHorizontal: 20,
  },
});
