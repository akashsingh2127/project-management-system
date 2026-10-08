import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, SafeAreaView, RefreshControl, Alert } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, Plus, CheckCircle2, Circle, CheckSquare, Trash2 } from 'lucide-react-native';
import { useTasks, useUpdateTask, useDeleteTask } from '../../tasks/api/useTasks';
import { useDeleteProject } from '../api/useProjects';
import { Task } from '../../../types';

export function ProjectDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { project } = route.params;
  
  const { data, isLoading, refetch, isRefetching } = useTasks(project.id, 1, 20);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const deleteProject = useDeleteProject();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const toggleTaskStatus = (task: Task) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    updateTask.mutate({ id: task.id, data: { status: newStatus } });
  };

  const handleDeleteTask = (task: Task) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.name || (task as any).title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteTask.mutate(task.id)
        }
      ]
    );
  };

  const handleDeleteProject = () => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteProject.mutate(project.id, {
              onSuccess: () => navigation.goBack()
            });
          }
        }
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' };
      case 'MEDIUM': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' };
      default: return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' };
    }
  };

  const renderTask = ({ item }: { item: Task }) => {
    const priorityColors = getPriorityColor(item.priority);
    const isCompleted = item.status === 'COMPLETED';
    
    return (
      <View className="bg-white p-5 rounded-2xl shadow-sm mb-4 border border-gray-100">
        <View className="flex-row items-start">
          <TouchableOpacity 
            className="mr-3 mt-1"
            onPress={() => toggleTaskStatus(item)}
            disabled={updateTask.isPending}
          >
            {isCompleted ? (
              <CheckCircle2 color="#10B981" size={24} />
            ) : (
              <Circle color="#94A3B8" size={24} />
            )}
          </TouchableOpacity>
          <View className="flex-1">
            <View className="flex-row justify-between items-start">
              <Text className={`flex-1 text-lg font-bold mb-1 mr-2 ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                {item.name || (item as any).title}
              </Text>
              <TouchableOpacity 
                onPress={() => handleDeleteTask(item)}
                disabled={deleteTask.isPending}
                className="p-1"
              >
                <Trash2 color="#EF4444" size={20} />
              </TouchableOpacity>
            </View>
            {item.description ? (
              <Text className="text-gray-500 text-sm mb-3 line-clamp-2 leading-relaxed" numberOfLines={2}>
                {item.description}
              </Text>
            ) : (
              <View className="h-2" />
            )}
            
            <View className="flex-row flex-wrap items-center gap-2 mt-1">
              <View className={`px-2.5 py-1 rounded-md border ${isCompleted ? 'bg-emerald-50 border-emerald-100' : item.status === 'IN_PROGRESS' ? 'bg-amber-50 border-amber-100' : 'bg-slate-100 border-slate-200'}`}>
                <Text className={`text-xs font-semibold ${isCompleted ? 'text-emerald-700' : item.status === 'IN_PROGRESS' ? 'text-amber-700' : 'text-slate-700'}`}>
                  {item.status.replace('_', ' ')}
                </Text>
              </View>
              
              <View className={`px-2.5 py-1 rounded-md border ${priorityColors.bg} ${priorityColors.border}`}>
                <Text className={`text-xs font-semibold ${priorityColors.text}`}>
                  {item.priority}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="px-4 py-4 bg-white border-b border-gray-100 shadow-sm flex-row items-center z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-2">
          <ChevronLeft color="#0F172A" size={24} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900" numberOfLines={1}>{project.name}</Text>
          <Text className="text-sm text-gray-500 font-medium">Project Details</Text>
        </View>
        <TouchableOpacity 
          onPress={handleDeleteProject}
          disabled={deleteProject.isPending}
          className="p-2"
        >
          <Trash2 color="#EF4444" size={24} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={data?.data || []}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          isLoading ? (
            <View className="py-20 items-center">
              <ActivityIndicator size="large" color="#0F172A" />
            </View>
          ) : (
            <View className="items-center justify-center py-20 px-6">
              <View className="bg-gray-100 w-20 h-20 rounded-full items-center justify-center mb-6">
                <CheckSquare size={32} color="#94A3B8" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">No tasks yet</Text>
              <Text className="text-gray-500 text-center mb-8">This project doesn't have any tasks.</Text>
            </View>
          )
        }
      />
      
      <TouchableOpacity
        onPress={() => navigation.navigate('CreateTask', { projectId: project.id })}
        className="absolute bottom-8 right-6 bg-indigo-600 w-14 h-14 rounded-full items-center justify-center shadow-xl shadow-indigo-600/30"
        activeOpacity={0.8}
      >
        <Plus color="white" size={28} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
