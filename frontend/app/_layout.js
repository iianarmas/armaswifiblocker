import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, Text, Platform } from 'react-native';

function BackButton() {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.back()} style={{ paddingRight: 16 }}>
      <Text style={{ color: '#fff', fontSize: 16 }}>← Back</Text>
    </TouchableOpacity>
  );
}

export default function RootLayout() {
  const showBackButton = Platform.OS === 'web';

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a73e8',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Armas WiFi',
          }}
        />
        <Stack.Screen
          name="devices"
          options={{
            title: 'All Devices',
            headerLeft: showBackButton ? () => <BackButton /> : undefined,
          }}
        />
        <Stack.Screen
          name="device/[mac]"
          options={{
            title: 'Device Control',
            headerLeft: showBackButton ? () => <BackButton /> : undefined,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Settings',
            headerLeft: showBackButton ? () => <BackButton /> : undefined,
          }}
        />
      </Stack>
    </>
  );
}
