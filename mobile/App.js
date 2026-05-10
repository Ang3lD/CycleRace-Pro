import React, { useEffect } from 'react';
import { View, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useAuthStore from './src/store/authStore';
import AuthStack from './src/navigation/AuthStack';
import MainTabs from './src/navigation/MainTabs';
import { Colors } from './src/theme/colors';

export default function App() {
  const { user, loading, init } = useAuthStore();

  useEffect(() => {
    init();
  }, []);

  if (loading) {
    return (
      <View style={styles.splash}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
        <ActivityIndicator size="large" color={Colors.orange500} />
      </View>
    );
  }

  const MyTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: Colors.orange500,
      background: Colors.bg,
      card: Colors.bgCard,
      text: Colors.textPrimary,
      border: Colors.border,
      notification: Colors.orange500,
    },
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <NavigationContainer theme={MyTheme}>
        {user ? <MainTabs /> : <AuthStack />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
