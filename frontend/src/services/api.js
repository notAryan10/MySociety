import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const port = process.env.PORT || 3000;

const getApiUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const host = debuggerHost.split(':')[0]
    return `http://${host}:${port}`;
  }

  return `http://localhost:${port}`;
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
    const response = await api.post('/auth/login', { email, password })
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
    const response = await api.post('/auth/register', userData)
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

export const createPost = async (postData) => {
  try {
    const response = await api.post('/posts/create', postData)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create post' }
  }
}

export const getPosts = async (filters = {}) => {
  try {
    const params = new URLSearchParams()
    if (filters.category && filters.category !== 'All') {
      params.append('category', filters.category)
    }
    if (filters.block) {
      params.append('block', filters.block)
    }

    const url = `/posts${params.toString() ? `?${params.toString()}` : ''}`
    const response = await api.get(url)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch posts' }
  }
}

export const getPostById = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch post' }
  }
}

export const createComment = async (commentData) => {
  try {
    const response = await api.post('/comments/create', commentData)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add comment' }
  }
}

export const getComments = async (postId) => {
  try {
    const response = await api.get(`/comments/${postId}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch comments' }
  }
}

export const uploadImage = async (imageUri) => {
  try {
    const formData = new FormData();

    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('image', {
      uri: imageUri,
      name: filename,
      type: type,
    });

    const response = await api.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to upload image' };
  }
};

export const reportPost = async (postId, reason) => {
  try {
    const response = await api.post(`/posts/${postId}/report`, { reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to report post' };
  }
};

export const deletePost = async (postId) => {
  try {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete post' };
  }
};

export const pinPost = async (postId) => {
  try {
    const response = await api.put(`/posts/pin/${postId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to pin post' };
  }
};

export const getUserProfile = async () => {
  try {
    const response = await api.get('/user/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch profile' };
  }
};

export const updateProfile = async (name) => {
  try {
    const response = await api.put('/user/profile', { name });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update profile' };
  }
};

export const updateSettings = async (mutedCategories) => {
  try {
    const response = await api.put('/user/settings', { mutedCategories });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update settings' };
  }
};

export const updatePushToken = async (pushToken) => {
  try {
    const response = await api.put('/auth/update-push-token', { pushToken });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update push token' };
  }
};


export default api;
