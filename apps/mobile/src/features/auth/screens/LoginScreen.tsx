import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, SafeAreaView, Dimensions } from 'react-native';
import { useAuth0 } from 'react-native-auth0';
import { Layers, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export function LoginScreen() {
  const { authorize } = useAuth0();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await authorize({
        audience: process.env.EXPO_PUBLIC_AUTH0_AUDIENCE,
        scope: 'openid profile email',
      });
    } catch (e: any) {
      console.error(e);
      Alert.alert('Login Error', e.message || 'Something went wrong during login.');
    } finally {
      setIsLoading(false);
    }
  };

  console.log('LoginScreen rendering');

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Abstract Background Elements */}
      <View className="absolute top-0 w-full h-full overflow-hidden">
        <View className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-50 rounded-full opacity-50" />
        <View className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-50 rounded-full opacity-50" />
      </View>

      <View className="flex-1 justify-between p-8" style={{ flex: 1, justifyContent: 'space-between', padding: 32 }}>
        {/* Top spacing */}
        <View className="mt-12" style={{ marginTop: 48 }} />

        {/* Logo and Typography */}
        <View className="items-center z-10">
          <View className="bg-indigo-600 w-24 h-24 rounded-3xl items-center justify-center mb-8 shadow-xl shadow-indigo-600/30 rotate-3">
            <View className="-rotate-3">
              <Layers color="white" size={48} />
            </View>
          </View>
          
          <Text className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight" style={{ fontSize: 36, fontWeight: '900', color: '#111827', marginBottom: 12 }}>
            Sync<Text className="text-indigo-600" style={{ color: '#4f46e5' }}>Pro</Text>
          </Text>
          
          <Text className="text-lg text-gray-500 text-center leading-relaxed px-4" style={{ fontSize: 18, color: '#6b7280', textAlign: 'center' }}>
            Manage projects, organize tasks, and collaborate with your team in real-time.
          </Text>
        </View>

        {/* Login Button Area */}
        <View className="w-full mb-10 z-10">
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
            className={`w-full bg-indigo-600 rounded-2xl p-5 flex-row justify-center items-center shadow-lg shadow-indigo-600/30 ${
              isLoading ? 'opacity-70' : ''
            }`}
          >
            <Text className="text-white font-bold text-lg mr-2">
              {isLoading ? 'Signing in...' : 'Sign In to Continue'}
            </Text>
            {!isLoading && <ArrowRight color="white" size={20} />}
          </TouchableOpacity>
          
          <View className="mt-6 flex-row items-center justify-center">
            <Text className="text-gray-400 text-sm">Secured by </Text>
            <Text className="text-gray-600 text-sm font-semibold">Auth0</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
