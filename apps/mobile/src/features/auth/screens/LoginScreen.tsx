import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAuth0 } from 'react-native-auth0';

export function LoginScreen() {
  const { authorize } = useAuth0();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await authorize({
        audience: process.env.EXPO_PUBLIC_AUTH0_AUDIENCE,
        scope: 'openid profile email offline_access',
      });
    } catch (e: any) {
      console.error(e);
      Alert.alert('Login Error', e.message || 'Something went wrong during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-50 p-6">
      <View className="w-full max-w-sm">
        <View className="items-center mb-10">
          <Text className="text-4xl font-bold text-blue-600 mb-2">PMS</Text>
          <Text className="text-lg text-gray-500 text-center">
            Project Management System
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoading}
          className={`w-full bg-blue-600 rounded-lg p-4 flex-row justify-center items-center shadow-sm ${
            isLoading ? 'opacity-70' : ''
          }`}
        >
          <Text className="text-white font-semibold text-lg">
            {isLoading ? 'Signing in...' : 'Sign In with Auth0'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
