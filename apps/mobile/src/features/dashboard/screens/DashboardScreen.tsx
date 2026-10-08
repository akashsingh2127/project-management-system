import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, SafeAreaView, RefreshControl } from 'react-native';
import { useAuth0 } from 'react-native-auth0';
import { useFocusEffect } from '@react-navigation/native';
import { useDashboardMetrics } from '../api/useDashboardMetrics';
import { useTasks, useUpdateTask } from '../../tasks/api/useTasks';
import { useProjects } from '../../projects/api/useProjects';
import { FolderGit2, CheckCircle2, Clock, LogOut, ChevronRight, Circle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export function DashboardScreen() {
  const { user, clearSession } = useAuth0();
  const navigation = useNavigation<any>();
  const { data: metrics, isLoading, isError, refetch, isRefetching } = useDashboardMetrics();
  
  const { data: recentProjects, refetch: refetchProjects } = useProjects(1, 5);
  const { data: upcomingTasks, refetch: refetchTasks } = useTasks(undefined, 1, 5, undefined, 'PENDING');
  const updateTask = useUpdateTask();

  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchProjects();
      refetchTasks();
    }, [refetch, refetchProjects, refetchTasks])
  );

  const toggleTaskStatus = (task: any) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    updateTask.mutate({ id: task.id, data: { status: newStatus } });
  };

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
                <Text className="text-gray-500 text-sm font-medium">Projects</Text>
              </View>
              
              {/* Total Tasks */}
              <View className="w-[48%] bg-white p-5 rounded-2xl shadow-sm mb-4 border border-gray-100/80">
                <View className="bg-emerald-50 w-10 h-10 rounded-full items-center justify-center mb-3">
                  <CheckCircle2 size={20} color="#10B981" />
                </View>
                <Text className="text-3xl font-bold text-gray-900 mb-1">{metrics?.totalTasks || 0}</Text>
                <Text className="text-gray-500 text-sm font-medium">Total Tasks</Text>
              </View>

              {/* In Progress / Pending Tasks */}
              <View className="w-[48%] bg-white p-5 rounded-2xl shadow-sm mb-4 border border-gray-100/80">
                <View className="bg-amber-50 w-10 h-10 rounded-full items-center justify-center mb-3">
                  <Clock size={20} color="#F59E0B" />
                </View>
                <Text className="text-3xl font-bold text-gray-900 mb-1">{metrics?.pendingTasks || 0}</Text>
                <Text className="text-gray-500 text-sm font-medium">In Progress</Text>
              </View>

              {/* Completed Tasks */}
              <View className="w-[48%] bg-white p-5 rounded-2xl shadow-sm mb-4 border border-gray-100/80">
                <View className="bg-emerald-50 w-10 h-10 rounded-full items-center justify-center mb-3">
                  <CheckCircle2 size={20} color="#10B981" />
                </View>
                <Text className="text-3xl font-bold text-gray-900 mb-1">{metrics?.completedTasks || 0}</Text>
                <Text className="text-gray-500 text-sm font-medium">Completed</Text>
              </View>
            </View>
          )}
          
          {/* Recent Projects Section */}
          <View className="mt-6 mb-4 flex-row justify-between items-center">
            <Text className="text-lg font-bold text-gray-900">Recent Projects</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ProjectsTab')}>
              <Text className="text-indigo-600 font-medium">View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentProjects?.data?.map((project: any) => (
            <TouchableOpacity 
              key={project.id}
              className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-gray-100/80 flex-row items-center justify-between"
              onPress={() => navigation.navigate('ProjectDetails', { project })}
            >
              <View className="flex-row items-center flex-1">
                <View className="bg-indigo-50 w-10 h-10 rounded-lg items-center justify-center mr-3">
                  <FolderGit2 size={20} color="#4F46E5" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900 mb-0.5">{project.name}</Text>
                  <Text className="text-gray-500 text-xs">
                    {project.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
                  </Text>
                </View>
              </View>
              <ChevronRight color="#CBD5E1" size={20} />
            </TouchableOpacity>
          ))}
          {(!recentProjects?.data || recentProjects.data.length === 0) && (
             <Text className="text-gray-500 text-center py-4 bg-white rounded-xl border border-gray-100">No recent projects found</Text>
          )}

          {/* Upcoming Tasks Section */}
          <View className="mt-8 mb-4 flex-row justify-between items-center">
            <Text className="text-lg font-bold text-gray-900">Upcoming Tasks</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TasksTab')}>
              <Text className="text-indigo-600 font-medium">View All</Text>
            </TouchableOpacity>
          </View>

          {upcomingTasks?.data?.map((task: any) => {
             const isCompleted = task.status === 'COMPLETED';
             return (
              <View 
                key={task.id}
                className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-gray-100/80 flex-row items-center"
              >
                <TouchableOpacity 
                  className="mr-3"
                  onPress={() => toggleTaskStatus(task)}
                >
                  {isCompleted ? (
                    <CheckCircle2 color="#10B981" size={24} />
                  ) : (
                    <Circle color="#94A3B8" size={24} />
                  )}
                </TouchableOpacity>
                <View className="flex-1">
                  <Text className={`text-base font-bold mb-0.5 ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {task.name || task.title}
                  </Text>
                  {task.project?.name && (
                    <Text className="text-gray-500 text-xs">{task.project.name}</Text>
                  )}
                </View>
              </View>
             );
          })}
          {(!upcomingTasks?.data || upcomingTasks.data.length === 0) && (
             <Text className="text-gray-500 text-center py-4 bg-white rounded-xl border border-gray-100">No upcoming tasks</Text>
          )}
          
          <View className="h-10" />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
