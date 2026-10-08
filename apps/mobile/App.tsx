import React, { useEffect, useState } from 'react';
import { Auth0Provider, useAuth0 } from 'react-native-auth0';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, ActivityIndicator } from 'react-native';

import { queryClient, clientPersister } from './src/lib/queryClient';
import { setAuthToken } from './src/lib/axios';
import { RootNavigator } from './src/navigation/RootNavigator';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
// @ts-ignore
import './global.css';

const AuthHandler = ({ children }: { children: React.ReactNode }) => {
  const { user, getCredentials, isLoading } = useAuth0();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (user) {
        try {
          const creds = await getCredentials();
          if (creds?.accessToken) {
            setAuthToken(creds.accessToken);
          }
        } catch (e) {
          console.error('Failed to get credentials:', e);
          setAuthToken(null);
        }
      } else {
        setAuthToken(null);
      }
      setIsInitializing(false);
    };

    if (!isLoading) {
      init();
    }
  }, [user, isLoading, getCredentials]);

  if (isLoading || isInitializing) {
    console.log('AuthHandler loading state:', { isLoading, isInitializing, user: !!user });
    return (
      <View className="flex-1 items-center justify-center bg-white" style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  console.log('AuthHandler loaded successfully');

  return <>{children}</>;
};

export default function App() {
  const domain = process.env.EXPO_PUBLIC_AUTH0_DOMAIN || '';
  const clientId = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID || '';

  if (!domain || !clientId) {
    return (
      <View className="flex-1 items-center justify-center bg-red-100 p-4">
        <Text className="text-red-700 text-center font-bold">
          Auth0 Configuration Missing
        </Text>
        <Text className="text-red-700 text-center mt-2">
          Please check your EXPO_PUBLIC_AUTH0_DOMAIN and EXPO_PUBLIC_AUTH0_CLIENT_ID environment variables.
        </Text>
      </View>
    );
  }

  return (
    <Auth0Provider domain={domain} clientId={clientId}>
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: clientPersister }}>
        <SafeAreaProvider>
          <AuthHandler>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </AuthHandler>
        </SafeAreaProvider>
      </PersistQueryClientProvider>
    </Auth0Provider>
  );
}
