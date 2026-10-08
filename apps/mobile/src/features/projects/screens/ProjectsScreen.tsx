import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useProjects } from '../api/useProjects';
import { Project } from '../../../types';
import { FolderGit2, Plus, ChevronRight, LayoutList, Search } from 'lucide-react-native';

export function ProjectsScreen() {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch, isRefetching } = useProjects(page, 20, search);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' };
      case 'IN_PROGRESS': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' };
      default: return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
    }
  };

  const renderItem = ({ item }: { item: Project }) => {
    const statusColors = getStatusColor(item.status);
    
    return (
      <TouchableOpacity 
        onPress={() => navigation.navigate('ProjectDetails', { project: item })}
        activeOpacity={0.7}
        className="bg-white p-5 rounded-2xl shadow-sm mb-4 border border-gray-100 flex-row items-center"
      >
        <View className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 mr-4">
          <FolderGit2 color="#4F46E5" size={24} />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 mb-1">{item.name}</Text>
          <Text className="text-gray-500 text-sm" numberOfLines={1}>
            {item.description || 'No description provided'}
          </Text>
          <View className="flex-row items-center mt-3">
            <View className={`px-2.5 py-1 rounded-md border ${statusColors.bg} ${statusColors.border}`}>
              <Text className={`text-xs font-semibold ${statusColors.text}`}>
                {item.status.replace('_', ' ')}
              </Text>
            </View>
          </View>
        </View>
        <ChevronRight color="#CBD5E1" size={24} className="ml-2" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="px-6 py-4 bg-white border-b border-gray-100 shadow-sm flex-row justify-between items-center z-10">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Projects</Text>
          <Text className="text-sm text-gray-500 font-medium">Manage your workspaces</Text>
        </View>
      </View>

      <View className="px-6 pt-4 bg-[#F8FAFC]">
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-2.5">
          <Search color="#94A3B8" size={20} />
          <TextInput
            className="flex-1 ml-2 text-base text-gray-900"
            placeholder="Search projects..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={data?.data || []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          isLoading && !data ? (
            <View className="py-20 items-center">
              <ActivityIndicator size="large" color="#0F172A" />
            </View>
          ) : isError ? (
            <View className="py-20 items-center">
              <Text className="text-red-500 text-base font-medium mb-2">Failed to load projects</Text>
              <TouchableOpacity onPress={() => refetch()} className="bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                <Text className="text-red-600 font-semibold">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="items-center justify-center py-20 px-6">
              <View className="bg-gray-100 w-20 h-20 rounded-full items-center justify-center mb-6">
                <LayoutList size={32} color="#94A3B8" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">No projects yet</Text>
              <Text className="text-gray-500 text-center mb-8">Create your first project to start organizing tasks and collaborating.</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateProject')}
                className="bg-indigo-600 px-6 py-3 rounded-xl flex-row items-center"
              >
                <Plus color="white" size={20} className="mr-2" />
                <Text className="text-white font-semibold text-base">Create Project</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />

      {data?.data && data.data.length > 0 && (
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateProject')}
          className="absolute bottom-8 right-6 bg-indigo-600 w-14 h-14 rounded-full items-center justify-center shadow-xl shadow-indigo-600/30"
          activeOpacity={0.8}
        >
          <Plus color="white" size={28} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
