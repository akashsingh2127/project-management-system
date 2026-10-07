import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, FolderGit2, CheckSquare } from 'lucide-react-native';

import { DashboardScreen } from '../features/dashboard/screens/DashboardScreen';

import { ProjectsScreen } from '../features/projects/screens/ProjectsScreen';
import { TasksScreen } from '../features/tasks/screens/TasksScreen';
import { CreateProjectScreen } from '../features/projects/screens/CreateProjectScreen';

export type AppTabParamList = {
  Dashboard: undefined;
  ProjectsTab: undefined;
  TasksTab: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  CreateProject: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4F46E5', // indigo-600
        tabBarInactiveTintColor: '#94A3B8', // slate-400
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f1f5f9', // slate-100
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        }
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="ProjectsTab"
        component={ProjectsScreen}
        options={{
          title: 'Projects',
          tabBarIcon: ({ color, size }) => <FolderGit2 color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="TasksTab"
        component={TasksScreen}
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size }) => <CheckSquare color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="CreateProject" component={CreateProjectScreen} options={{ title: 'New Project', presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

