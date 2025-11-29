import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './src/screens/LoginScreen';
import Dashboard from './src/screens/Dashboard';
import SignUpScreen from './src/screens/SignUpScreen';
import CreatePostScreen from './src/screens/CreatePostScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import ReportPostScreen from './src/screens/ReportPostScreen';
import { registerForPushNotificationsAsync, setupNotificationListeners } from './src/services/notificationService';
import { updatePushToken } from './src/services/api';


import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import ProfileScreen from './src/screens/ProfileScreen';
import colors from './src/styles/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false, tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: { backgroundColor: colors.cardBackground, borderTopColor: colors.border, paddingBottom: 5, paddingTop: 5, },
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === 'Home') {
          iconName = 'home';
        } else if (route.name === 'Profile') {
          iconName = 'user';
        }
        return <Feather name={iconName} size={size} color={color} />;
      },
    })} >
      <Tab.Screen name="Home" component={Dashboard} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const notificationListener = useRef();

  useEffect(() => {
    async function checkAuth() {
      const token = await AsyncStorage.getItem('token')
      setInitialRoute(token ? 'MainTabs' : 'Login')

      if (token) {
        try {
          const pushToken = await registerForPushNotificationsAsync();
          if (pushToken) {
            await updatePushToken(pushToken);
          }
        } catch (error) {
          console.log('Push notifications not available:', error.message);
        }
      }
    }
    checkAuth()

    try {
      notificationListener.current = setupNotificationListeners(
        (notification) => {
          console.log('Notification received:', notification);
        },
        (response) => {
          console.log('Notification tapped:', response);
        }
      );
    } catch (error) {
      console.log('Notification listeners not available');
    }

    return () => {
      if (notificationListener.current) {
        try {
          notificationListener.current();
        } catch (error) {
        }
      }
    };
  }, [])

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="CreatePost" component={CreatePostScreen} />
        <Stack.Screen name="PostDetail" component={PostDetailScreen} />
        <Stack.Screen name="Contacts" component={ContactsScreen} />
        <Stack.Screen name="ReportPost" component={ReportPostScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
