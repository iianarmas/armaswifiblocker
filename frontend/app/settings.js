import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { getApiUrl, setApiUrl, getApiKey, setApiKey } from '../services/storage';
import api from '../services/api';
import Button from '../components/Button';

export default function SettingsScreen() {
  const [serverUrl, setServerUrl] = useState('');
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const url = await getApiUrl();
    const key = await getApiKey();
    setServerUrl(url);
    setApiKeyValue(key);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setConnectionStatus(null);

    try {
      // Temporarily save settings for test
      await setApiUrl(serverUrl);
      await setApiKey(apiKeyValue);

      await api.getDevices();
      setConnectionStatus('success');
      Alert.alert('Success', 'Connected to server successfully!');
    } catch (err) {
      setConnectionStatus('error');
      Alert.alert('Connection Failed', err.message);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!serverUrl.trim()) {
      Alert.alert('Error', 'Server URL is required');
      return;
    }
    if (!apiKeyValue.trim()) {
      Alert.alert('Error', 'API Key is required');
      return;
    }

    setSaving(true);
    try {
      await setApiUrl(serverUrl.trim());
      await setApiKey(apiKeyValue.trim());
      Alert.alert('Saved', 'Settings saved successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Server Configuration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Server Configuration</Text>

        <Text style={styles.label}>Server URL</Text>
        <TextInput
          style={styles.input}
          value={serverUrl}
          onChangeText={setServerUrl}
          placeholder="http://192.168.100.16:5000"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <Text style={styles.hint}>
          The URL of your Ubuntu server running the Armas WiFi API
        </Text>

        <Text style={styles.label}>API Key</Text>
        <TextInput
          style={styles.input}
          value={apiKeyValue}
          onChangeText={setApiKeyValue}
          placeholder="Your API key"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
        />
        <Text style={styles.hint}>
          Must match the API_KEY in your server's .env file
        </Text>
      </View>

      {/* Connection Status */}
      {connectionStatus && (
        <View
          style={[
            styles.statusBanner,
            connectionStatus === 'success'
              ? styles.statusSuccess
              : styles.statusError,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              connectionStatus === 'success'
                ? styles.statusTextSuccess
                : styles.statusTextError,
            ]}
          >
            {connectionStatus === 'success'
              ? 'Connected to server'
              : 'Cannot connect to server'}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Test Connection"
          variant="secondary"
          onPress={handleTestConnection}
          loading={testing}
          disabled={testing || saving}
        />
        <Button
          title="Save Settings"
          onPress={handleSave}
          loading={saving}
          disabled={testing || saving}
          style={styles.saveButton}
        />
      </View>

      {/* Help */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Setup Instructions</Text>
        <Text style={styles.helpText}>
          1. Make sure your Ubuntu server is running the Armas WiFi backend{'\n\n'}
          2. The server should be accessible at the URL you configured{'\n\n'}
          3. The API key must match between this app and the server's .env file{'\n\n'}
          4. Your phone/device must be on the same network as the server
        </Text>
      </View>
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#202124',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  hint: {
    fontSize: 12,
    color: '#5f6368',
    marginTop: 4,
  },
  statusBanner: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  statusSuccess: {
    backgroundColor: '#d4edda',
  },
  statusError: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  statusTextSuccess: {
    color: '#155724',
  },
  statusTextError: {
    color: '#721c24',
  },
  actions: {
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#5f6368',
    lineHeight: 20,
  },
});
