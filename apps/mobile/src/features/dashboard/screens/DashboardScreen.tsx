import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, SafeAreaView, RefreshControl } from 'react-native';
import { useAuth0 } from 'react-native-auth0';
import { useDashboardMetrics } from '../api/useDashboardMetrics';
import { FolderGit2, CheckCircle2, Clock, AlertCircle, LogOut } from 'lucide-react-native';

export function DashboardScreen() {
  const { user, clearSession } = useAuth0();
  const { data: metrics, isLoading, isError, refetch, isRefetching } = useDashboardMetrics();

  const handleLogout = async () => {
    try {
      await clearSession();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <View className="px-6 pt-8 pb-6 bg-white border-b border-gray-100 shadow-sm">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Overview</Text>
              <Text className="text-2xl font-bold text-gray-900">
                Hi, {user?.givenName || user?.name?.split(' ')[0] || 'User'}! 👋
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              className="bg-red-50 p-3 rounded-full"
            >
              <LogOut size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="p-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">Your Metrics</Text>
          
          {isLoading && !metrics ? (
            <View className="py-20 items-center">
              <ActivityIndicator size="large" color="#0F172A" />
            </View>
          ) : isError ? (
            <View className="py-10 bg-red-50 rounded-xl px-4 border border-red-100">
              <Text className="text-red-600 text-center font-medium">Failed to load metrics</Text>
              <TouchableOpacity onPress={() => refetch()} className="mt-4 bg-red-100 py-2 rounded-lg items-center">
                 <Text className="text-red-700 font-semibold">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {/* Total Projects */}
              <View className="w-[48%] bg-white p-5 rounded-2xl shadow-sm mb-4 border border-gray-100/80">
                <View className="bg-indigo-50 w-10 h-10 rounded-full items-center justify-center mb-3">
                  <FolderGit2 size={20} color="#4F46E5" />
                </View>
                <Text className="text-3xl font-bold text-gray-900 mb-1">{metrics?.totalProjects || 0}</Text>
                <Text className="text-gray-500 text-sm font-medium">Total Projects</Text>
              </View>
              
              {/* Active Projects */}
              <View className="w-[48%] bg-white p-5 rounded-2xl shadow-sm mb-4 border border-gray-100/80">
                <View className="bg-emerald-50 w-10 h-10 rounded-full items-center justify-center mb-3">
                  <CheckCircle2 size={20} color="#10B981" />
                </View>
                <Text className="text-3xl font-bold text-gray-900 mb-1">{metrics?.activeProjects || 0}</Text>
                <Text className="text-gray-500 text-sm font-medium">Active Projects</Text>
              </View>

              {/* Pending Tasks */}
              <View className="w-[48%] bg-white p-5 rounded-2xl shadow-sm mb-4 border border-gray-100/80">
                <View className="bg-amber-50 w-10 h-10 rounded-full items-center justify-center mb-3">
                  <Clock size={20} color="#F59E0B" />
                </View>
                <Text className="text-3xl font-bold text-gray-900 mb-1">{metrics?.pendingTasks || 0}</Text>
                <Text className="text-gray-500 text-sm font-medium">Pending Tasks</Text>
              </View>

              {/* Overdue Tasks */}
              <View className="w-[48%] bg-white p-5 rounded-2xl shadow-sm mb-4 border border-gray-100/80">
                <View className="bg-red-50 w-10 h-10 rounded-full items-center justify-center mb-3">
                  <AlertCircle size={20} color="#EF4444" />
                </View>
                <Text className="text-3xl font-bold text-gray-900 mb-1">{metrics?.overdueTasks || 0}</Text>
                <Text className="text-gray-500 text-sm font-medium">Overdue Tasks</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
