import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView, Modal, FlatList, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Save, X, Calendar, ChevronDown } from 'lucide-react-native';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../../lib/axios';
import { Project } from '../../../types';

export function CreateTaskScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const queryClient = useQueryClient();
  const initialProjectId = route.params?.projectId;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(initialProjectId);
  const [status, setStatus] = useState<'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('PENDING');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isProjectPickerVisible, setIsProjectPickerVisible] = useState(false);

  // Fetch projects for the picker
  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects', 1, 100], // Fetch first 100 projects for simplicity
    queryFn: async () => {
      const response = await api.get<{ data: Project[] }>('/projects', { params: { page: 1, limit: 100 } });
      return response.data;
    }
  });

  const projects = projectsData?.data || [];
  const selectedProjectName = projects.find(p => p.id === selectedProjectId)?.name || 'Select a Project';

  const createTask = useMutation({
    mutationFn: async (data: { name: string; description?: string; projectId?: string; status: string; priority: string; dueDate?: string }) => {
      // dueDate is a string like DD-MM-YYYY or ISO. The backend expects ISO or date if it supports it.
      // If we just pass the string as is, we should ensure it's valid if possible, but let's pass what we have.
      const payload: any = { ...data };
      if (data.dueDate) {
        payload.dueDate = new Date(data.dueDate).toISOString(); // Try parse if possible
      }
      const response = await api.post('/tasks', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      navigation.goBack();
    }
  });

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const handleSave = () => {
    if (!name.trim() || !selectedProjectId) return;

    createTask.mutate({
      name: name.trim(),
      description: description.trim(),
      projectId: selectedProjectId,
      status: status,
      priority: priority,
      ...(dueDate && { dueDate: dueDate.toISOString() })
    });
  };

  const renderStatusChip = (s: typeof status, label: string) => (
    <TouchableOpacity
      onPress={() => setStatus(s)}
      className={`px-4 py-2 rounded-lg border mr-2 ${status === s ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-200'}`}
    >
      <Text className={`font-semibold ${status === s ? 'text-white' : 'text-gray-700'}`}>{label}</Text>
    </TouchableOpacity>
  );

  const renderPriorityChip = (p: typeof priority, label: string) => (
    <TouchableOpacity
      onPress={() => setPriority(p)}
      className={`px-4 py-2 rounded-lg border mr-2 ${priority === p ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-200'}`}
    >
      <Text className={`font-semibold ${priority === p ? 'text-white' : 'text-gray-700'}`}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-4 border-b border-gray-100 flex-row justify-between items-center bg-white z-10">
        <Text className="text-xl font-bold text-gray-900 ml-2">Edit Task</Text>
      </View>

      <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Name */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Task Name"
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-5 text-gray-900"
          placeholderTextColor="#94A3B8"
        />

        {/* Description */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Task Description"
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 h-24 mb-5 text-gray-900"
          textAlignVertical="top"
          multiline
          placeholderTextColor="#94A3B8"
        />

        {/* Project Picker */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">Project</Text>
        <TouchableOpacity
          onPress={() => setIsProjectPickerVisible(true)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 mb-5 flex-row justify-between items-center"
        >
          <Text className={selectedProjectId ? "text-gray-900" : "text-gray-400"}>
            {selectedProjectName}
          </Text>
          <ChevronDown color="#94A3B8" size={20} />
        </TouchableOpacity>

        {/* Status */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">Status</Text>
        <View className="flex-row mb-5">
          {renderStatusChip('PENDING', 'Pending')}
          {renderStatusChip('IN_PROGRESS', 'In Progress')}
          {renderStatusChip('COMPLETED', 'Completed')}
        </View>

        {/* Priority */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">Priority</Text>
        <View className="flex-row mb-5">
          {renderPriorityChip('LOW', 'Low')}
          {renderPriorityChip('MEDIUM', 'Medium')}
          {renderPriorityChip('HIGH', 'High')}
        </View>

        {/* Due Date */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">Due Date</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 mb-8 flex-row items-center"
        >
          <Calendar color="#94A3B8" size={20} className="mr-3" />
          <Text className={dueDate ? "text-gray-900" : "text-gray-400"}>
            {dueDate ? dueDate.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' }) : "Select Due Date"}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {/* Actions */}
        <View className="flex-row justify-between gap-4 mt-2">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="flex-1 py-4 border border-gray-200 rounded-xl items-center justify-center bg-white"
          >
            <Text className="text-gray-700 font-bold text-base">Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleSave}
            disabled={!name.trim() || !selectedProjectId || createTask.isPending}
            className={`flex-1 flex-row py-4 rounded-xl items-center justify-center ${
              !name.trim() || !selectedProjectId || createTask.isPending ? 'bg-indigo-300' : 'bg-indigo-600'
            }`}
          >
            {createTask.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Project Picker Modal */}
      <Modal
        visible={isProjectPickerVisible}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl min-h-[50%] p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">Select Project</Text>
              <TouchableOpacity onPress={() => setIsProjectPickerVisible(false)} className="p-2">
                <X color="#0F172A" size={24} />
              </TouchableOpacity>
            </View>
            
            {isLoadingProjects ? (
              <ActivityIndicator size="large" color="#4F46E5" className="mt-10" />
            ) : (
              <FlatList
                data={projects}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedProjectId(item.id);
                      setIsProjectPickerVisible(false);
                    }}
                    className={`py-4 border-b border-gray-100 ${selectedProjectId === item.id ? 'bg-indigo-50/50 -mx-6 px-6' : ''}`}
                  >
                    <Text className={`text-base ${selectedProjectId === item.id ? 'text-indigo-600 font-bold' : 'text-gray-700'}`}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text className="text-gray-500 text-center mt-10">No projects found. Please create a project first.</Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
