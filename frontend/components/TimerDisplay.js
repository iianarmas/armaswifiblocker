import { View, Text, StyleSheet } from 'react-native';
import { useTimer } from '../hooks/useTimer';

export default function TimerDisplay({ expiresAt, onExpire }) {
  const { remainingFormatted, remainingSeconds, isExpired } = useTimer(expiresAt);

  if (isExpired) {
    return null;
  }

  // Calculate progress (for visual indicator)
  const isLow = remainingSeconds < 300; // Less than 5 minutes

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Time remaining:</Text>
      <Text style={[styles.time, isLow && styles.timeLow]}>
        {remainingFormatted}
      </Text>
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            isLow && styles.progressBarLow,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#5f6368',
    marginBottom: 8,
  },
  time: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1a73e8',
    fontVariant: ['tabular-nums'],
  },
  timeLow: {
    color: '#dc3545',
  },
  progressContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1a73e8',
    borderRadius: 2,
  },
  progressBarLow: {
    backgroundColor: '#dc3545',
  },
});
