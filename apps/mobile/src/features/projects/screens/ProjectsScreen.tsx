import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useProjects } from '../api/useProjects';
import { Project } from '../../../types';
import { FolderGit2, Plus } from 'lucide-react-native';

export function ProjectsScreen() {
  const navigation = useNavigation<any>();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch, isRefetching } = useProjects(page, 20);

  const renderItem = ({ item }: { item: Project }) => (
    <View className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-gray-100 flex-row items-center">
      <View className="bg-blue-50 p-3 rounded-full mr-4">
        <FolderGit2 color="#2563eb" size={24} />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
        <Text className="text-gray-500 text-sm mt-1" numberOfLines={1}>
          {item.description || 'No description'}
        </Text>
      </View>
      <View className="ml-2">
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
        <Text className="text-red-500 text-lg text-center">Failed to load projects. Pull to refresh.</Text>
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
            <Text className="text-gray-500">No projects found.</Text>
          </View>
        }
      />
      <TouchableOpacity
        onPress={() => navigation.navigate('CreateProject')}
        className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
      >
        <Plus color="white" size={28} />
      </TouchableOpacity>
    </View>
  );
}
