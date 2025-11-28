import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const getApiUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const host = debuggerHost.split(':')[0]
    return `http://${host}:3000`;
  }

  return 'http://localhost:3000'
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json', }
})

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const login = async (email, password) => {
  try {
    const response = await api.post('/login', { email, password })
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token)
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Login failed. Please try again.' }
  }
}

export const register = async (userData) => {
  try {
    const response = await api.post('/register', userData)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed. Please try again.' }
  }
}

export const getCurrentUser = async () => {
  const user = await AsyncStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export const logout = async () => {
  await AsyncStorage.removeItem('token')
  await AsyncStorage.removeItem('user')
}

export default api;
