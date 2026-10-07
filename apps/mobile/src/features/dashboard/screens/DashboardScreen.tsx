import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth0 } from 'react-native-auth0';
import { useDashboardMetrics } from '../api/useDashboardMetrics';

export function DashboardScreen() {
  const { user, clearSession } = useAuth0();
  const { data: metrics, isLoading, isError } = useDashboardMetrics();

  const handleLogout = async () => {
    try {
      await clearSession();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-900">
            Welcome, {user?.name || 'User'}!
          </Text>
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500 rounded-lg py-2 px-4 shadow-sm"
          >
            <Text className="text-white font-semibold">Log out</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="py-10">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : isError ? (
          <View className="py-10 bg-red-100 rounded-lg px-4">
            <Text className="text-red-700 text-center">Failed to load metrics</Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-100">
              <Text className="text-gray-500 text-sm mb-1">Total Projects</Text>
              <Text className="text-2xl font-bold text-gray-900">{metrics?.totalProjects}</Text>
            </View>
            <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-100">
              <Text className="text-gray-500 text-sm mb-1">Active Projects</Text>
              <Text className="text-2xl font-bold text-blue-600">{metrics?.activeProjects}</Text>
            </View>
            <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-100">
              <Text className="text-gray-500 text-sm mb-1">Pending Tasks</Text>
              <Text className="text-2xl font-bold text-amber-500">{metrics?.pendingTasks}</Text>
            </View>
            <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-100">
              <Text className="text-gray-500 text-sm mb-1">Overdue Tasks</Text>
              <Text className="text-2xl font-bold text-red-500">{metrics?.overdueTasks}</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
