import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { Colors } from '../theme/colors';

import EventosScreen from '../screens/EventosScreen';
import EventoDetalleScreen from '../screens/EventoDetalleScreen';
import PagoScreen from '../screens/PagoScreen';
import MisEventosScreen from '../screens/MisEventosScreen';
import MiQRScreen from '../screens/MiQRScreen';
import PerfilScreen from '../screens/PerfilScreen';

const Tab = createBottomTabNavigator();
const EventosStack = createNativeStackNavigator();
const MisEventosStack = createNativeStackNavigator();

// ---- Tab icon component ----
function TabIcon({ emoji, focused }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
    </View>
  );
}

// ---- Eventos Stack (Explore → Detail → Pago) ----
function EventosStackScreen() {
  return (
    <EventosStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <EventosStack.Screen name="EventosList" component={EventosScreen} />
      <EventosStack.Screen name="EventoDetalle" component={EventoDetalleScreen} />
      <EventosStack.Screen name="Pago" component={PagoScreen} />
    </EventosStack.Navigator>
  );
}

// ---- Mis Eventos Stack (List → QR) ----
function MisEventosStackScreen() {
  return (
    <MisEventosStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <MisEventosStack.Screen name="MisEventosList" component={MisEventosScreen} />
      <MisEventosStack.Screen name="MiQR" component={MiQRScreen} />
    </MisEventosStack.Navigator>
  );
}

// ---- Main Tabs ----
export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.orange500,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="EventosTab"
        component={EventosStackScreen}
        options={{
          tabBarLabel: 'Eventos',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏆" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="MisEventos"
        component={MisEventosStackScreen}
        options={{
          tabBarLabel: 'Mis Eventos',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🎫" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.bgCard,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 65,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: {
    backgroundColor: 'rgba(234,88,12,0.12)',
  },
});
