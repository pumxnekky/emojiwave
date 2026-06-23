import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import RadarScreen from '../screens/RadarScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Colors, Typography } from '../utils/theme';
import { useStore } from '../store/useStore';

const Tab = createBottomTabNavigator();

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 3 }}>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>
      <Text style={{ ...Typography.caption, color: focused ? Colors.primaryLight : Colors.textMuted }}>
        {label}
      </Text>
    </View>
  );
}

export default function AppNavigator() {
  const totalUnread = useStore((s) => s.connections.reduce((acc, c) => acc + c.unreadCount, 0));

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.surfaceBorder,
          borderTopWidth: 0.5,
          height: 70,
          paddingBottom: 10,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Radar"
        component={RadarScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🌊" label="Radar" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View>
              <TabIcon emoji="💬" label="Chats" focused={focused} />
              {totalUnread > 0 && (
                <View style={{
                  position: 'absolute', top: -2, right: -4,
                  width: 16, height: 16, borderRadius: 8,
                  backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 9, color: '#fff', fontWeight: '700' }}>{totalUnread}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="✨" label="Perfil" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
