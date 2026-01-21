import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDevices } from '../hooks/useDevices';
import DeviceCard from '../components/DeviceCard';
import Button from '../components/Button';

export default function DevicesScreen() {
  const router = useRouter();
  const { devices, loading, error, refresh, scanNetwork } = useDevices(false);
  const [search, setSearch] = useState('');
  const [scanning, setScanning] = useState(false);

  const handleScan = async () => {
    setScanning(true);
    await scanNetwork();
    setScanning(false);
  };

  const filteredDevices = devices.filter((device) => {
    const searchLower = search.toLowerCase();
    return (
      device.name?.toLowerCase().includes(searchLower) ||
      device.mac.toLowerCase().includes(searchLower) ||
      device.ip?.toLowerCase().includes(searchLower)
    );
  });

  const renderDevice = ({ item }) => (
    <DeviceCard
      device={item}
      onPress={() => router.push(`/device/${encodeURIComponent(item.mac)}`)}
    />
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, MAC, or IP..."
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
      </View>

      {/* Scan Button */}
      <View style={styles.scanContainer}>
        <Button
          title="Scan Network"
          variant="secondary"
          onPress={handleScan}
          loading={scanning}
          disabled={scanning}
        />
        <Text style={styles.deviceCount}>
          {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Device List */}
      <FlatList
        data={filteredDevices}
        renderItem={renderDevice}
        keyExtractor={(item) => item.mac}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {search ? 'No devices match your search' : 'No devices found'}
            </Text>
            <Button
              title="Scan Network"
              onPress={handleScan}
              loading={scanning}
              style={styles.emptyButton}
            />
          </View>
        }
      />

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 0,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#dadce0',
  },
  scanContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  deviceCount: {
    fontSize: 14,
    color: '#5f6368',
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  empty: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#5f6368',
    marginBottom: 16,
  },
  emptyButton: {
    width: 200,
  },
  error: {
    color: '#dc3545',
    textAlign: 'center',
    padding: 16,
  },
});
