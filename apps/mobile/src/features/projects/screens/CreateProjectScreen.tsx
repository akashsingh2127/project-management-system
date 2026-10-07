import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectSchema } from '@project-management/common';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';

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
      Alert.alert('Success', 'Project created successfully');
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
    <ScrollView className="flex-1 bg-gray-50 p-6">
      <View className="mb-6">
        <Text className="text-xl font-bold text-gray-900 mb-2">Create New Project</Text>
        <Text className="text-gray-500">Fill in the details below.</Text>
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 font-semibold mb-1">Project Name *</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={`bg-white border rounded-lg p-3 text-gray-900 ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="e.g. Website Redesign"
            />
          )}
        />
        {errors.name && <Text className="text-red-500 text-xs mt-1">{errors.name.message as string}</Text>}
      </View>

      <View className="mb-6">
        <Text className="text-gray-700 font-semibold mb-1">Description</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="bg-white border border-gray-200 rounded-lg p-3 text-gray-900 h-24"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value || ''}
              placeholder="Optional description..."
              multiline
              textAlignVertical="top"
            />
          )}
        />
        {errors.description && <Text className="text-red-500 text-xs mt-1">{errors.description.message as string}</Text>}
      </View>

      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        className={`w-full bg-blue-600 rounded-lg p-4 flex-row justify-center items-center shadow-sm ${
          isSubmitting ? 'opacity-70' : ''
        }`}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-lg">Create Project</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
