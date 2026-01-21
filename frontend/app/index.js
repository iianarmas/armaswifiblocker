import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDevices } from '../hooks/useDevices';
import api from '../services/api';
import Button from '../components/Button';
import DeviceCard from '../components/DeviceCard';

export default function DashboardScreen() {
  const router = useRouter();
  const { devices, loading, error, refresh } = useDevices(true, 30000);
  const [timers, setTimers] = useState([]);
  const [connected, setConnected] = useState(null);

  const checkConnection = useCallback(async () => {
    try {
      await api.checkHealth();
      setConnected(true);
    } catch {
      setConnected(false);
    }
  }, []);

  const fetchTimers = useCallback(async () => {
    try {
      const result = await api.getAllTimers();
      setTimers(result.data.timers || []);
    } catch {
      // Ignore timer fetch errors
    }
  }, []);

  useEffect(() => {
    checkConnection();
    fetchTimers();
  }, [checkConnection, fetchTimers]);

  const handleRefresh = async () => {
    await Promise.all([refresh(), fetchTimers(), checkConnection()]);
  };

  const blockedCount = devices.filter((d) => d.blocked).length;
  const onlineCount = devices.filter((d) => d.online && !d.blocked).length;

  if (connected === false) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Cannot Connect to Server</Text>
          <Text style={styles.errorText}>
            Make sure your Ubuntu server is running and the API is accessible.
          </Text>
          <Button
            title="Go to Settings"
            onPress={() => router.push('/settings')}
            style={styles.errorButton}
          />
          <Button
            title="Retry"
            variant="secondary"
            onPress={checkConnection}
            style={styles.errorButton}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
      }
    >
      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{onlineCount}</Text>
          <Text style={styles.statLabel}>Online</Text>
        </View>
        <View style={[styles.statCard, styles.statCardBlocked]}>
          <Text style={[styles.statNumber, styles.statNumberBlocked]}>
            {blockedCount}
          </Text>
          <Text style={[styles.statLabel, styles.statLabelBlocked]}>Blocked</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{timers.length}</Text>
          <Text style={styles.statLabel}>Timers</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.buttonRow}>
          <Button
            title="All Devices"
            onPress={() => router.push('/devices')}
            style={styles.actionButton}
          />
          <Button
            title="Settings"
            variant="secondary"
            onPress={() => router.push('/settings')}
            style={styles.actionButton}
          />
        </View>
      </View>

      {/* Blocked Devices */}
      {blockedCount > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currently Blocked</Text>
          {devices
            .filter((d) => d.blocked)
            .map((device) => (
              <DeviceCard
                key={device.mac}
                device={device}
                onPress={() => router.push(`/device/${encodeURIComponent(device.mac)}`)}
              />
            ))}
        </View>
      )}

      {/* Active Timers */}
      {timers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Timers</Text>
          {timers.map((timer) => {
            const device = devices.find((d) => d.mac === timer.mac);
            const mins = Math.ceil(timer.remaining_seconds / 60);
            return (
              <View key={timer.mac} style={styles.timerCard}>
                <Text style={styles.timerDevice}>
                  {device?.name || timer.mac}
                </Text>
                <Text style={styles.timerTime}>{mins} min left</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Recent Devices */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Devices</Text>
        {devices.slice(0, 5).map((device) => (
          <DeviceCard
            key={device.mac}
            device={device}
            onPress={() => router.push(`/device/${encodeURIComponent(device.mac)}`)}
          />
        ))}
        {devices.length > 5 && (
          <Button
            title={`View all ${devices.length} devices`}
            variant="secondary"
            onPress={() => router.push('/devices')}
          />
        )}
      </View>

      {error && (
        <Text style={styles.error}>{error}</Text>
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statCardBlocked: {
    backgroundColor: '#fff5f5',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a73e8',
  },
  statNumberBlocked: {
    color: '#dc3545',
  },
  statLabel: {
    fontSize: 12,
    color: '#5f6368',
    marginTop: 4,
  },
  statLabelBlocked: {
    color: '#dc3545',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  timerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  timerDevice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#202124',
  },
  timerTime: {
    fontSize: 14,
    color: '#1a73e8',
    fontWeight: '600',
  },
  error: {
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#5f6368',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    width: 200,
    marginBottom: 12,
  },
});
