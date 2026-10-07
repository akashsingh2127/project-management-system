import React from 'react';
import { useAuth0 } from 'react-native-auth0';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';

export function RootNavigator() {
  const { user } = useAuth0();

  return user ? <AppNavigator /> : <AuthNavigator />;
}
