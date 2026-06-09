import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useAlerts } from '../../context/AlertContext';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

function TabBarIcon({ name, color, focused }: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={styles.iconContainer}>
      {focused && <View style={styles.indicador} />}
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

function NotifIcon({ color, focused }: { color: string; focused: boolean }) {
  const { alerts } = useAlerts();
  const [lidas, setLidas] = useState<number[]>([]);

  useEffect(() => {
    const carregar = async () => {
      const saved = await AsyncStorage.getItem('@spacealert:lidas');
      if (saved) setLidas(JSON.parse(saved));
    };
    carregar();
  }, [focused]);

  const naoLidas = alerts.filter(a => !lidas.includes(a.id)).length;

  return (
    <View style={styles.iconContainer}>
      {focused && <View style={styles.indicador} />}
      <View>
        <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={22} color={color} />
        {naoLidas > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{naoLidas > 9 ? '9+' : naoLidas}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 105,
          paddingBottom: 24,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'grid' : 'grid-outline'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="alertas"
        options={{
          title: 'Alertas',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'warning' : 'warning-outline'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="previsao"
        options={{
          title: 'Previsão',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'partly-sunny' : 'partly-sunny-outline'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notificacoes"
        options={{
          title: 'Notificações',
          tabBarIcon: ({ color, focused }) => (
            <NotifIcon color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicador: {
    position: 'absolute',
    top: -10,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.accent,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Colors.accent,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Colors.text,
    fontSize: 9,
    fontWeight: 'bold',
  },
});