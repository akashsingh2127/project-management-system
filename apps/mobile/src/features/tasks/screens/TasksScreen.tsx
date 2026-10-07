import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useTasks } from '../api/useTasks';
import { Task } from '../../../types';
import { CheckSquare } from 'lucide-react-native';

export function TasksScreen() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch, isRefetching } = useTasks(undefined, page, 20);

  const renderItem = ({ item }: { item: Task }) => (
    <View className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-gray-100 flex-row items-center">
      <View className={`p-3 rounded-full mr-4 ${
        item.status === 'COMPLETED' ? 'bg-green-50' : 'bg-blue-50'
      }`}>
        <CheckSquare 
          color={item.status === 'COMPLETED' ? '#16a34a' : '#2563eb'} 
          size={24} 
        />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
        {item.project?.name && (
          <Text className="text-indigo-600 text-xs font-medium mb-1">
            {item.project.name}
          </Text>
        )}
        <Text className="text-gray-500 text-sm mt-1" numberOfLines={1}>
          {item.description || 'No description'}
        </Text>
        {item.dueDate && (
          <Text className="text-gray-400 text-xs mt-2">
            Due: {new Date(item.dueDate).toLocaleDateString()}
          </Text>
        )}
      </View>
      <View className="ml-2 items-end">
        <View className={`px-2 py-1 rounded-md mb-2 ${
          item.priority === 'HIGH' ? 'bg-red-100' :
          item.priority === 'MEDIUM' ? 'bg-amber-100' : 'bg-green-100'
        }`}>
          <Text className={`text-xs font-bold ${
            item.priority === 'HIGH' ? 'text-red-700' :
            item.priority === 'MEDIUM' ? 'text-amber-700' : 'text-green-700'
          }`}>
            {item.priority}
          </Text>
        </View>
        <View className={`px-2 py-1 rounded-md ${
          item.status === 'COMPLETED' ? 'bg-green-100' :
          item.status === 'IN_PROGRESS' ? 'bg-blue-100' : 'bg-gray-100'
        }`}>
          <Text className={`text-xs font-medium ${
            item.status === 'COMPLETED' ? 'text-green-700' :
            item.status === 'IN_PROGRESS' ? 'text-blue-700' : 'text-gray-700'
          }`}>
            {item.status.replace('_', ' ')}
          </Text>
        </View>
      </View>
    </View>
  );

  if (isLoading && !data) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-6">
        <Text className="text-red-500 text-lg text-center">Failed to load tasks. Pull to refresh.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={data?.data || []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <Text className="text-gray-500">No tasks found.</Text>
          </View>
        }
      />
    </View>
  );
}
