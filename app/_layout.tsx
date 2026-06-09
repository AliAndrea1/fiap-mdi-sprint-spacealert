import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AlertProvider } from '../context/AlertContext';
import { Colors } from '../constants/Colors';

export default function RootLayout() {
  return (
    <AlertProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </AlertProvider>
  );
}