import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectSchema } from '@project-management/common';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { FolderPlus } from 'lucide-react-native';

type CreateProjectData = z.infer<typeof createProjectSchema>;

export function CreateProjectScreen({ navigation }: any) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<any>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'NOT_STARTED',
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateProjectData) => {
      const response = await api.post('/projects', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigation.goBack();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create project');
    }
  });

  const onSubmit = async (data: CreateProjectData) => {
    setIsSubmitting(true);
    await createMutation.mutateAsync(data);
    setIsSubmitting(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 40 }}>
          <View className="items-center mb-8 mt-4">
            <View className="bg-indigo-50 w-20 h-20 rounded-full items-center justify-center mb-4 border border-indigo-100 shadow-sm">
              <FolderPlus size={36} color="#4F46E5" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">New Project</Text>
            <Text className="text-base text-gray-500 text-center px-4">
              Create a new workspace to organize your tasks and collaborate with your team.
            </Text>
          </View>

          <View className="space-y-5">
            <View>
              <Text className="text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-wider">Project Name</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-3 ${errors.name ? 'border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-indigo-500 focus:bg-white'}`}>
                    <TextInput
                      className="flex-1 text-base text-gray-900 min-h-[24px]"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="e.g. Website Redesign"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                )}
              />
              {errors.name && <Text className="text-red-500 text-xs mt-1.5 ml-1 font-medium">{errors.name.message as string}</Text>}
            </View>

            <View>
              <Text className="text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-wider mt-4">Description <Text className="text-gray-400 font-normal normal-case">(Optional)</Text></Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className={`bg-gray-50 border rounded-xl px-4 py-3 ${errors.description ? 'border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-indigo-500 focus:bg-white'}`}>
                    <TextInput
                      className="text-base text-gray-900 h-28"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value || ''}
                      placeholder="What is this project about?"
                      placeholderTextColor="#94A3B8"
                      multiline
                      textAlignVertical="top"
                    />
                  </View>
                )}
              />
              {errors.description && <Text className="text-red-500 text-xs mt-1.5 ml-1 font-medium">{errors.description.message as string}</Text>}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            activeOpacity={0.8}
            className={`w-full bg-indigo-600 rounded-xl p-4 flex-row justify-center items-center shadow-lg shadow-indigo-600/30 mt-10 ${
              isSubmitting ? 'opacity-70' : ''
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Create Project</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
