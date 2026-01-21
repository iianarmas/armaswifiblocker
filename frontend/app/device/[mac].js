import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import api from '../../services/api';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import TimerPicker from '../../components/TimerPicker';
import TimerDisplay from '../../components/TimerDisplay';

export default function DeviceControlScreen() {
  const { mac } = useLocalSearchParams();
  const navigation = useNavigation();
  const decodedMac = decodeURIComponent(mac);

  const [device, setDevice] = useState(null);
  const [timer, setTimer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [deviceRes, timerRes] = await Promise.all([
        api.getDevice(decodedMac),
        api.getTimer(decodedMac),
      ]);
      setDevice(deviceRes.data.device);
      setTimer(timerRes.data.timer);
      setNewName(deviceRes.data.device?.name || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [decodedMac]);

  useEffect(() => {
    loadData();
    // Refresh every 5 seconds to update timer
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    if (device?.name) {
      navigation.setOptions({ title: device.name });
    }
  }, [device?.name, navigation]);

  const handleBlock = async () => {
    try {
      setActionLoading(true);
      await api.blockDevice(decodedMac);
      await loadData();
      Alert.alert('Success', 'Device has been blocked');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblock = async () => {
    try {
      setActionLoading(true);
      await api.unblockDevice(decodedMac);
      await loadData();
      Alert.alert('Success', 'Device has been unblocked');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetTimer = async (minutes) => {
    try {
      setActionLoading(true);
      await api.setTimer(decodedMac, minutes);
      await loadData();
      Alert.alert('Timer Set', `Device will be blocked in ${minutes} minutes`);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelTimer = async () => {
    try {
      setActionLoading(true);
      await api.cancelTimer(decodedMac);
      setTimer(null);
      Alert.alert('Success', 'Timer cancelled');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    try {
      setActionLoading(true);
      await api.setDeviceName(decodedMac, newName.trim());
      setEditingName(false);
      await loadData();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <Button title="Retry" onPress={loadData} style={styles.retryButton} />
      </View>
    );
  }

  const status = device?.blocked ? 'blocked' : device?.online ? 'online' : 'offline';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Device Info */}
      <View style={styles.header}>
        {editingName ? (
          <View style={styles.nameEdit}>
            <TextInput
              style={styles.nameInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Device name"
              autoFocus
            />
            <Button
              title="Save"
              onPress={handleSaveName}
              loading={actionLoading}
              style={styles.nameButton}
            />
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => {
                setEditingName(false);
                setNewName(device?.name || '');
              }}
              style={styles.nameButton}
            />
          </View>
        ) : (
          <View style={styles.nameRow}>
            <Text style={styles.deviceName}>
              {device?.name || 'Unknown Device'}
            </Text>
            <Button
              title="Edit"
              variant="secondary"
              onPress={() => setEditingName(true)}
              style={styles.editButton}
            />
          </View>
        )}
        <Text style={styles.mac}>{decodedMac}</Text>
        {device?.ip && device.ip !== 'Unknown' && (
          <Text style={styles.ip}>IP: {device.ip}</Text>
        )}
        <View style={styles.statusRow}>
          <StatusBadge status={status} />
        </View>
      </View>

      {/* Block/Unblock Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Internet Access</Text>
        {device?.blocked ? (
          <Button
            title="Unblock Internet"
            variant="success"
            onPress={handleUnblock}
            loading={actionLoading}
          />
        ) : (
          <Button
            title="Block Internet Now"
            variant="danger"
            onPress={handleBlock}
            loading={actionLoading}
          />
        )}
      </View>

      {/* Timer Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Time Limit</Text>

        {timer ? (
          <View style={styles.timerActive}>
            <TimerDisplay expiresAt={timer.expires_at} />
            <Text style={styles.timerNote}>
              Internet will be blocked when timer expires
            </Text>
            <Button
              title="Cancel Timer"
              variant="secondary"
              onPress={handleCancelTimer}
              loading={actionLoading}
            />
          </View>
        ) : device?.blocked ? (
          <Text style={styles.disabledNote}>
            Unblock the device first to set a time limit
          </Text>
        ) : (
          <TimerPicker
            onSelect={handleSetTimer}
            disabled={actionLoading}
          />
        )}
      </View>

      {/* Device Details */}
      {device?.vendor && device.vendor !== 'Unknown' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <Text style={styles.detail}>Vendor: {device.vendor}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deviceName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#202124',
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minHeight: 32,
  },
  nameEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  nameButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 36,
  },
  mac: {
    fontSize: 14,
    color: '#5f6368',
    fontFamily: 'monospace',
    marginTop: 8,
  },
  ip: {
    fontSize: 14,
    color: '#5f6368',
    marginTop: 4,
  },
  statusRow: {
    marginTop: 12,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 16,
  },
  timerActive: {
    alignItems: 'center',
  },
  timerNote: {
    fontSize: 14,
    color: '#5f6368',
    marginBottom: 16,
    textAlign: 'center',
  },
  disabledNote: {
    fontSize: 14,
    color: '#5f6368',
    fontStyle: 'italic',
  },
  detail: {
    fontSize: 14,
    color: '#5f6368',
  },
  error: {
    color: '#dc3545',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    width: 150,
  },
});
