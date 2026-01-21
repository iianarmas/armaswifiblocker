import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import StatusBadge from './StatusBadge';

export default function DeviceCard({ device, onPress, onQuickBlock }) {
  const status = device.blocked ? 'blocked' : device.online ? 'online' : 'offline';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {device.name || 'Unknown Device'}
        </Text>
        <Text style={styles.mac}>{device.mac}</Text>
        {device.ip && device.ip !== 'Unknown' && (
          <Text style={styles.ip}>{device.ip}</Text>
        )}
      </View>
      <View style={styles.actions}>
        <StatusBadge status={status} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 4,
  },
  mac: {
    fontSize: 12,
    color: '#5f6368',
    fontFamily: 'monospace',
  },
  ip: {
    fontSize: 12,
    color: '#5f6368',
    marginTop: 2,
  },
  actions: {
    marginLeft: 12,
  },
});
