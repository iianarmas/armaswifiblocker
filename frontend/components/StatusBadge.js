import { View, Text, StyleSheet } from 'react-native';

export default function StatusBadge({ status }) {
  const badgeStyles = [styles.badge, styles[status]];
  const textStyles = [styles.text, styles[`${status}Text`]];

  const labels = {
    online: 'Online',
    offline: 'Offline',
    blocked: 'Blocked',
  };

  return (
    <View style={badgeStyles}>
      <Text style={textStyles}>{labels[status] || status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  online: {
    backgroundColor: '#d4edda',
  },
  onlineText: {
    color: '#155724',
  },
  offline: {
    backgroundColor: '#e2e3e5',
  },
  offlineText: {
    color: '#383d41',
  },
  blocked: {
    backgroundColor: '#f8d7da',
  },
  blockedText: {
    color: '#721c24',
  },
});
